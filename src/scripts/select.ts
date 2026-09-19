/**
 * Власний випадний список для поля «тип проєкту».
 *
 * Нативний <select> не стилізується: сам список малює операційна система,
 * і CSS туди не дістає — звідси синя підсвітка й системні шрифти посеред
 * темної форми.
 *
 * Тому розмітка лишається нативною, а скрипт її замінює:
 *   без JS — звичайний робочий <select>;
 *   з JS   — кнопка та listbox, які виглядають як решта полів.
 *
 * Значення живе в тому самому <select>, тож форма надсилається однаково
 * в обох випадках, і нічого не треба міняти на боці обробника.
 */

for (const field of document.querySelectorAll<HTMLElement>('[data-select]')) {
  const select = field.querySelector('select');
  const label = field.querySelector('label');
  if (!select) continue;

  const options = [...select.options];
  const listId = `${select.id}-list`;
  const buttonId = `${select.id}-button`;

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'sel__button';
  button.id = buttonId;
  button.setAttribute('aria-haspopup', 'listbox');
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-controls', listId);

  const value = document.createElement('span');
  value.className = 'sel__value';
  value.textContent = select.selectedOptions[0]?.text ?? '';

  const chevron = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  chevron.setAttribute('class', 'sel__chevron');
  chevron.setAttribute('viewBox', '0 0 12 8');
  chevron.setAttribute('aria-hidden', 'true');
  chevron.innerHTML = '<path d="M1 1.5 L6 6.5 L11 1.5" fill="none" stroke="currentColor" stroke-width="1.25" />';

  button.append(value, chevron);

  const list = document.createElement('ul');
  list.className = 'sel__list';
  list.id = listId;
  list.setAttribute('role', 'listbox');
  list.hidden = true;

  const items = options.map((option, i) => {
    const li = document.createElement('li');
    li.className = 'sel__option';
    li.setAttribute('role', 'option');
    li.setAttribute('aria-selected', String(i === select.selectedIndex));
    li.textContent = option.text;
    li.addEventListener('click', () => choose(i));
    li.addEventListener('pointermove', () => setActive(i));
    list.append(li);
    return li;
  });

  // Нативний список більше не показуємо, але він лишається джерелом значення
  // і далі надсилається разом із формою.
  select.hidden = true;
  select.setAttribute('tabindex', '-1');
  select.setAttribute('aria-hidden', 'true');
  if (label) label.htmlFor = buttonId;

  field.append(button, list);

  let open = false;
  let active = select.selectedIndex;

  function setActive(i: number) {
    active = (i + items.length) % items.length;
    items.forEach((li, n) => li.classList.toggle('is-active', n === active));
    items[active].scrollIntoView({ block: 'nearest' });
  }

  function choose(i: number) {
    select!.selectedIndex = i;
    value.textContent = options[i].text;
    items.forEach((li, n) => li.setAttribute('aria-selected', String(n === i)));
    // Подія потрібна, якщо колись з'явиться валідація чи аналітика.
    select!.dispatchEvent(new Event('change', { bubbles: true }));
    setOpen(false);
    button.focus();
  }

  function setOpen(next: boolean) {
    open = next;
    list.hidden = !next;
    button.setAttribute('aria-expanded', String(next));
    field.classList.toggle('is-open', next);
    if (next) setActive(select!.selectedIndex);
  }

  button.addEventListener('click', () => setOpen(!open));

  button.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpen(true);
    }
  });

  list.addEventListener('keydown', (e) => e.preventDefault());

  document.addEventListener('keydown', (e) => {
    if (!open) return;
    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        setOpen(false);
        button.focus();
        break;
      case 'ArrowDown':
        e.preventDefault();
        setActive(active + 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActive(active - 1);
        break;
      case 'Home':
        e.preventDefault();
        setActive(0);
        break;
      case 'End':
        e.preventDefault();
        setActive(items.length - 1);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        choose(active);
        break;
      case 'Tab':
        setOpen(false);
        break;
    }
  });

  document.addEventListener('pointerdown', (e) => {
    if (open && !field.contains(e.target as Node)) setOpen(false);
  });
}
