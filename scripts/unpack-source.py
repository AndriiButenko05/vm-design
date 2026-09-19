"""
Розпаковує партію від замовниці у .source з правильними іменами.

    python scripts/unpack-source.py "C:/Users/andrb/Downloads/Project Marina new.zip"

Навіщо окремий скрипт, а не unzip: архіви зібрані на macOS без прапорця UTF-8,
тому кириличні імена тек ("Фото реализованных объектов") у звичайних
розпакувальниках перетворюються на кашу. Тут вони декодуються явно.

Заодно відсіює службовий мотлох macOS: __MACOSX, ._* та .DS_Store.
"""

import os
import shutil
import sys
import unicodedata
import zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEST = os.path.join(ROOT, ".source")


# Кириличні теки з архіву → короткі ASCII-імена.
# Пайплайн не повинен залежати від кодування імен узагалі.
FOLDER_MAP = {
    "Фото реализованных объектов": "projects",
    "Выставочные стенды": "fairs",
    "фото для services": "services",
    "Фото для services": "services",
}


def real_name(info: zipfile.ZipInfo) -> str:
    """
    Ім'я з архіву у правильному кодуванні.

    macOS пише імена в UTF-8, але часто не виставляє прапорець 0x800.
    Тоді zipfile декодує їх як cp437 і виходить каша. Лікується так:
    беремо байти назад і пробуємо UTF-8 — якщо вийшло, це був саме цей випадок.
    """
    name = info.filename
    if not (info.flag_bits & 0x800):
        try:
            name = name.encode("cp437").decode("utf-8")
        except (UnicodeEncodeError, UnicodeDecodeError):
            pass

    # Нормалізація: діакритика в іменах файлів приходить розкладеною (NFD).
    name = unicodedata.normalize("NFC", name)

    parts = name.split("/")
    return "/".join(FOLDER_MAP.get(p, p) for p in parts)


def is_junk(path: str) -> bool:
    parts = path.split("/")
    return (
        "__MACOSX" in parts
        or any(p.startswith("._") for p in parts)
        or ".DS_Store" in parts
    )


def main() -> None:
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    archive = sys.argv[1]
    z = zipfile.ZipFile(archive)

    written = skipped = junk = 0
    total_bytes = 0

    for info in z.infolist():
        name = real_name(info)
        if is_junk(name):
            junk += 1
            continue
        if name.endswith("/"):
            continue

        target = os.path.join(DEST, *name.split("/"))
        os.makedirs(os.path.dirname(target), exist_ok=True)

        # Повторний запуск не має переписувати те, що вже лежить.
        if os.path.exists(target) and os.path.getsize(target) == info.file_size:
            skipped += 1
            continue

        with z.open(info) as src, open(target, "wb") as dst:
            shutil.copyfileobj(src, dst)
        written += 1
        total_bytes += info.file_size

    print(f"  записано {written} ({total_bytes / 1073741824:.2f} GB)")
    print(f"  пропущено (вже є) {skipped}")
    print(f"  відсіяно службових {junk}")
    print(f"  -> {os.path.relpath(DEST, ROOT)}")


if __name__ == "__main__":
    main()
