"""
Ретуш креслень: прибирає з титульних блоків прізвища та адреси клієнтів
і віддає сторінки як зображення.

    python scripts/redact-drawings.py --dry     # показати, що буде зафарбовано
    python scripts/redact-drawings.py           # зробити

Метод і чому саме він — див. scripts/redact-drawings.mjs.md.
Коротко: сторінка спершу растеризується, тому текстового шару
з персональними даними у вихідному файлі не лишається взагалі.
Малювати прямокутник поверх тексту в самому PDF було б хибно —
текст звідти витягується копіюванням.
"""

import argparse
import json
import os
import re
import sys
import unicodedata

import pypdfium2 as pdfium
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, ".source", "Project Marina new", "Project PDF")
OUT = os.path.join(ROOT, "src", "assets", "drawings")

# Повні комплекти лежать ПОЗА src/: усе, що Astro бачить у src/assets,
# він копіює у збірку — навіть те, на що немає жодного посилання.
# Через це 137 непублічних аркушів давали ~24 МБ мертвої ваги в dist.
FULL = os.path.join(ROOT, ".drawings-full")

# Скільки аркушів кожного комплекту йде на сайт. Має збігатися
# з PUBLIC_PAGES у src/lib/drawings.ts.
PUBLIC_PAGES = 8
MANIFEST = os.path.join(ROOT, "src", "data", "drawings.json")

# Ширина сторінки на виході. Досить, щоб читати розміри на екрані,
# замало, щоб роздрукувати в масштабі й використати як робоче креслення.
TARGET_WIDTH = 1500

# Мітки клітинок, які треба зачистити.
LABELS = ("CLIENTE", "CLIENT", "INDIRIZZO", "ADRESSE", "ADRESS")

# Розрив між символами, більший за цей, вважається межею клітинки.
GAP_PT = 14.0

# Поле навколо зони зафарбування, у пунктах.
PAD_PT = 1.5

# ── Дані клієнтів живуть поза репозиторієм ───────────────────────
#
# Тут раніше стояли два списки: назви вихідних PDF і перелік заборонених
# рядків для контролю витоку. Обидва містять рівно те, що цей скрипт і
# покликаний приховати, — прізвища замовників і адреси їхнього житла.
# В одній із назв прізвище стоїть просто так: Nice_<вулиця>_<прізвище>.pdf.
#
# Тому вони переїхали у .source/redaction.json, а ця тека не версіонується.
# Без конфігурації скрипт не працює НАВМИСНО: якби він допускав порожній
# FORBIDDEN, контроль витоку тихо став би заглушкою, що завжди каже «чисто».
CONFIG = os.path.join(ROOT, ".source", "redaction.json")

if not os.path.exists(CONFIG):
    sys.exit(
        f"Немає {CONFIG}.\n"
        "Це перелік комплектів і заборонених рядків. Він поза git, бо містить\n"
        "прізвища й адреси замовників. Структуру описано в README."
    )

with open(CONFIG, encoding="utf-8") as _fh:
    _cfg = json.load(_fh)

SETS = [(s["file"], s["slug"], s["label"], s["project"]) for s in _cfg["sets"]]

# Контроль: цих рядків не має лишитися у жодній зоні, що НЕ зафарбована.
FORBIDDEN = _cfg["forbidden"]

if not FORBIDDEN:
    sys.exit("У redaction.json порожній forbidden — контроль витоку був би фікцією.")


def norm(s):
    """
    Верхній регістр БЕЗ зміни довжини рядка.

    Звичайна нормалізація NFKD розкладає діакритику ('é' -> 'e' + accent)
    і подовжує рядок. На аркушах із французьким текстом це зсувало індекси
    відносно списку символів, і зона ретуші рахувалася не там.
    Тому кожен символ мапиться рівно в один.
    """
    out = []
    for ch in s or "":
        up = ch.upper()
        out.append(up if len(up) == 1 else ch)
    return "".join(out)


def to_display(box, w0, h0, rot):
    """
    Переводить рамку символа з неповернутих координат сторінки у ті,
    в яких сторінка справді малюється.

    Аркуші зверстані з поворотом: pdfium віддає рамки символів
    у неповернутому просторі, а render() поворот застосовує.
    Без цього перетворення рядок титульного блока читається як
    вертикальний стовпчик і не збирається.
    """
    l, b, r, t = box
    if rot == 90:
        pts = [(b, w0 - l), (t, w0 - r)]
    elif rot == 180:
        pts = [(w0 - l, h0 - b), (w0 - r, h0 - t)]
    elif rot == 270:
        pts = [(h0 - b, l), (h0 - t, r)]
    else:
        pts = [(l, b), (r, t)]
    xs = [p[0] for p in pts]
    ys = [p[1] for p in pts]
    return (min(xs), min(ys), max(xs), max(ys))


def chars_of(textpage, w0, h0, rot):
    """Символи сторінки з непорожніми рамками, у координатах відображення."""
    out = []
    for i in range(textpage.count_chars()):
        try:
            box = textpage.get_charbox(i)
        except Exception:
            continue
        if not box or (box[2] - box[0]) <= 0 or (box[3] - box[1]) <= 0:
            continue
        ch = textpage.get_text_range(i, 1)
        if not ch:
            continue
        out.append((ch, to_display(box, w0, h0, rot)))
    return out


def rows_of(chars):
    """
    Групує символи у візуальні рядки за вертикальним центром.

    Порядок символів у PDF не відповідає порядку читання — CAD-експорт
    видає їх довільно. Тому рядок збирається геометрично, а не за індексом.
    """
    if not chars:
        return []

    heights = sorted(b[3] - b[1] for _, b in chars)
    h = heights[len(heights) // 2] or 6.0
    tol = h * 0.6

    items = sorted(chars, key=lambda cb: -((cb[1][1] + cb[1][3]) / 2))
    rows = []
    for ch, box in items:
        mid = (box[1] + box[3]) / 2
        if rows and abs(rows[-1]["mid"] - mid) <= tol:
            rows[-1]["chars"].append((ch, box))
            rows[-1]["mid"] = (rows[-1]["mid"] * (len(rows[-1]["chars"]) - 1) + mid) / len(rows[-1]["chars"])
        else:
            rows.append({"mid": mid, "chars": [(ch, box)]})

    for r in rows:
        r["chars"].sort(key=lambda cb: cb[1][0])
        r["text"] = "".join(c for c, _ in r["chars"])
    return rows


def redaction_boxes(textpage, w0, h0, rot):
    """
    Знаходить клітинки CLIENT / ADRESSE у титульному блоці й повертає
    їхні рамки разом зі значенням, яке туди потрапляє.
    Координати — простір відображення.
    """
    boxes = []

    for row in rows_of(chars_of(textpage, w0, h0, rot)):
        upper = norm(row["text"])
        chars = row["chars"]

        for label in LABELS:
            at = upper.find(label)
            if at == -1:
                continue
            # Довші мітки перевіряються першими: CLIENTE перед CLIENT,
            # ADRESSE перед ADRESS — інакше рамка обірветься на короткій.
            if any(
                longer != label and longer.startswith(label) and longer in upper
                for longer in LABELS
            ):
                continue

            lab = [b for _, b in chars[at:at + len(label)]]
            if not lab:
                continue
            l0 = min(b[0] for b in lab)
            r0 = max(b[2] for b in lab)
            b0 = min(b[1] for b in lab)
            t0 = max(b[3] for b in lab)

            # Праворуч від мітки, доки розрив між символами малий.
            right = r0
            prev = r0
            taken = []
            for ch, box in chars[at + len(label):]:
                if box[0] - prev > GAP_PT:      # межа клітинки титульного блока
                    break
                taken.append(ch)
                right = max(right, box[2])
                b0 = min(b0, box[1])
                t0 = max(t0, box[3])
                prev = box[2]

            value = "".join(taken).strip(" : ")
            if not value:
                # Порожня клітинка (Villa à Nice, Roma) — зафарбовувати нічого.
                continue

            boxes.append({
                "rect": (l0 - PAD_PT, b0 - PAD_PT, right + PAD_PT, t0 + PAD_PT),
                "label": label,
                "value": value,
            })
            break  # одна мітка на рядок

    return boxes


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry", action="store_true", help="показати, що буде зафарбовано")
    ap.add_argument("--limit", type=int, default=0, help="обмежити кількість сторінок на файл")
    args = ap.parse_args()

    manifest = {"sets": []}
    grand_redactions = 0
    leaks = []

    # Імена файлів містять діакритику («à Nice»), а на диску вона може бути
    # в іншій нормалізації Unicode — тому шукаємо за нормалізованим збігом.
    on_disk = {unicodedata.normalize("NFC", f): f for f in os.listdir(SRC)}

    for filename, slug, title, project in SETS:
        real = on_disk.get(unicodedata.normalize("NFC", filename))
        if not real:
            print(f"  ! немає файлу: {filename}")
            continue
        path = os.path.join(SRC, real)

        doc = pdfium.PdfDocument(path)
        n_pages = len(doc) if not args.limit else min(len(doc), args.limit)

        dest_dir = os.path.join(OUT, slug)
        full_dir = os.path.join(FULL, slug)
        if not args.dry:
            os.makedirs(dest_dir, exist_ok=True)
            os.makedirs(full_dir, exist_ok=True)

        pages = []
        redactions = 0
        samples = []

        for i in range(n_pages):
            page = doc[i]
            tp = page.get_textpage()

            # get_size() віддає розмір уже з урахуванням повороту;
            # рамки символів — ні, тому тримаємо обидві системи.
            w_disp, h_disp = page.get_size()
            rot = page.get_rotation()
            w0, h0 = (h_disp, w_disp) if rot in (90, 270) else (w_disp, h_disp)

            boxes = redaction_boxes(tp, w0, h0, rot)
            redactions += len(boxes)
            for b in boxes:
                if len(samples) < 4:
                    samples.append(f"{b['label']} -> {b['value'][:48]}")

            # Контроль витоку: чи все знайдене справді потрапило в зони.
            # Пробіли прибираємо з обох боків — у зібраному рядку їх немає,
            # бо символи-пробіли не мають рамки й відсіюються раніше.
            squash = lambda s: re.sub(r"\s+", "", s).upper()
            page_text = tp.get_text_range()
            covered = squash(" ".join(b["value"] for b in boxes))
            for pat in FORBIDDEN:
                for m in re.finditer(pat, page_text, re.I):
                    if squash(m.group(0)) not in covered:
                        leaks.append(f"{slug} стор.{i + 1}: '{m.group(0)}' поза зоною")

            if args.dry:
                continue

            scale = TARGET_WIDTH / w_disp
            img = page.render(scale=scale).to_pil().convert("RGB")
            draw = ImageDraw.Draw(img)

            for b in boxes:
                x0, y0, x1, y1 = b["rect"]
                # PDF рахує Y знизу, зображення — згори
                draw.rectangle(
                    [x0 * scale, (h_disp - y1) * scale, x1 * scale, (h_disp - y0) * scale],
                    fill=(255, 255, 255),
                )

            name = f"{i + 1:03d}.jpg"
            # Перші PUBLIC_PAGES — у src/assets (потраплять на сайт),
            # решта — у .drawings-full для надсилання за запитом.
            target = dest_dir if i < PUBLIC_PAGES else full_dir
            img.save(os.path.join(target, name), quality=82, optimize=True, progressive=True)
            pages.append({"file": name, "width": img.width, "height": img.height})

        grand_redactions += redactions
        manifest["sets"].append({
            "slug": slug, "title": title, "project": project,
            "pages": pages, "count": len(pages) or n_pages,
            "redactions": redactions,
        })

        mark = "—" if redactions == 0 else f"{redactions} зон"
        print(f"  {slug:16} {n_pages:>3} стор.  ретуш: {mark}")
        for s in samples:
            print(f"       {s}")

    print(f"\n  зон зафарбовано: {grand_redactions}")

    if leaks:
        print(f"\n  ⚠ ВИТІК — персональні дані поза зонами ({len(leaks)}):")
        for l in leaks[:15]:
            print(f"      {l}")
        sys.exit(1)
    print("  контроль витоку: чисто")

    if not args.dry:
        os.makedirs(os.path.dirname(MANIFEST), exist_ok=True)
        with open(MANIFEST, "w", encoding="utf-8") as f:
            json.dump(manifest, f, ensure_ascii=False, indent=1)
        print(f"  маніфест: {os.path.relpath(MANIFEST, ROOT)}")


if __name__ == "__main__":
    main()
