# Персональный сайт — TTY / ASCII

Статический сайт-визитка в эстетике Linux-терминала: фосфорный зелёный на чёрном,
ASCII-логотип, скан-линии CRT и текстовые анимации. Чистый HTML, CSS и JavaScript,
без сборки, шрифтов извне и зависимостей. Публикуется на GitHub Pages через Actions.

## Что внутри

```
.
├── index.html                   # разметка: hero, обо мне, проекты, навыки, контакты
├── 404.html                     # страница для несуществующих адресов (GitHub Pages)
├── assets/
│   ├── css/terminal.css         # токены тем, терминальные компоненты, адаптив
│   └── js/main.js               # тема, меню, scroll-spy, печатная машинка, часы, e-mail
├── .github/workflows/deploy.yml # автодеплой на GitHub Pages
├── .nojekyll                    # отключает обработку Jekyll на Pages
└── .gitignore
```

Из чего складывается вид:

- **ASCII-логотип** — `<pre class="ascii">` в hero; тот же приём на странице 404.
- **Промпты как в шелле** — `blin4ik@tty1:~$ whoami`, `cat role.txt`, `cd projects/`.
- **neofetch-панель** — `sysinfo` справа от hero, со живыми часами.
- **Проекты как окна терминала** — заголовок окна, путь и теги в квадратных скобках.
- **Скан-линии и виньетка** — псевдоэлементы `body::before` / `body::after`.
- **Анимации** — печатная машинка в hero, эффект загрузки (`boot`), появление
  блоков при скролле (`reveal`).

Поведение:

- тёмная («фосфор») и светлая («бумага») темы, выбор запоминается в `localStorage`,
  по умолчанию — системная; переключатель подписан `theme=dark` / `theme=light`;
- адаптивная вёрстка и мобильное меню с `Escape` и закрытием по клику вне шапки;
- доступность: skip-link, `aria-*`, `aria-current` у активного пункта меню,
  видимый фокус, поддержка `prefers-reduced-motion` (отключает мигание курсора,
  скан-линии, печатную машинку и анимации появления);
- анимации появления включаются только при работающем JS (класс `.js` на `<html>`),
  поэтому без скриптов контент виден сразу;
- никаких CDN, трекеров и внешних шрифтов — только системный моноширинный стек;
- относительные пути, поэтому сайт работает и в подпапке (`username.github.io/repo/`).

## Локальный просмотр

```bash
python3 -m http.server 8000
# открыть http://localhost:8000
```

Можно и просто открыть `index.html` в браузере, но локальный сервер ближе к
реальным условиям (например, для `navigator.clipboard` при копировании e-mail).

## Что заменить на своё

Все заглушки помечены в коде комментариями `TODO`:

| Что | Где |
| --- | --- |
| Ник, роль, описание | `index.html` (`<title>`, `meta`, `.brand`, `.hero`, `.footer`) |
| ASCII-логотип | `index.html`, `<pre class="ascii">` в hero (и такой же в `404.html`) |
| Текст «Обо мне» и факты | `index.html`, секция `#about` |
| Проекты и ссылки на них | `index.html`, секция `#projects` (`.win__link`) |
| Навыки | `index.html`, секция `#skills` |
| E-mail | `mailto:` и `data-email` в секции `#contact` (сейчас заглушка `hello@example.com`) |
| Соцсети | `href` у ссылок в `.socials` (GitHub и Telegram — проверьте ники) |
| Строки neofetch | `index.html`, `<dl class="sysinfo__list">` |

Найти все заглушки сразу:

```bash
grep -rn "hello@example.com\|TODO" index.html README.md
```

ASCII-логотип собран из глифов шириной 4 символа с пробелом-разделителем:
`B L I N 4 I K` → 34 колонки. Если меняете текст, сохраняйте одинаковую ширину
каждой строки, иначе буквы «разъедутся» (шрифт моноширинный, но пробелы значимы).

Если сайт живёт в подпапке (`https://username.github.io/repo/`), поправьте ссылку
«Вернуться на главную» в `404.html` на `/repo/`.

## Публикация на GitHub Pages

### 1. Создать репозиторий и запушить код

```bash
git add .
git commit -m "feat: tty-style personal website"
git branch -M main
git remote add origin git@github.com:USERNAME/REPO.git
git push -u origin main
```

Имя репозитория влияет на адрес:

- `USERNAME.github.io` → сайт откроется по адресу `https://USERNAME.github.io/`;
- любое другое имя (например, `personal-website`) → `https://USERNAME.github.io/personal-website/`.

### 2. Включить Pages

1. Откройте репозиторий → **Settings** → **Pages**.
2. В блоке **Build and deployment** выберите **Source: GitHub Actions**.
3. Сделайте push в `main` (или запустите workflow вручную: **Actions** →
   «Deploy to GitHub Pages» → **Run workflow**).
4. Через минуту сайт будет доступен по адресу из блока Pages, он же печатается
   в логе job'а.

Репозиторий должен быть публичным (Pages для приватных репозиториев доступен
только на платных тарифах).

### Альтернатива: без Actions

Если не хочется использовать workflow, удалите `.github/workflows/deploy.yml` и в
**Settings → Pages** выберите **Deploy from a branch** → ветка `main`, папка `/ (root)`.
Сайт статический, сборка не нужна.

## Свой домен (по желанию)

1. **Settings → Pages → Custom domain** — введите домен.
2. В DNS пропишите `CNAME` на `USERNAME.github.io` (или `A`-записи на IP GitHub Pages).
3. Включите **Enforce HTTPS** после того, как сертификат выпустится.

GitHub создаст файл `CNAME` в репозитории — не удаляйте его.

## Проверка перед публикацией

- [ ] Заменены ник, тексты, ссылки и e-mail.
- [ ] ASCII-логотип не «разъехался» на узком экране (< 400 px).
- [ ] Сайт проверен в тёмной и светлой темах (переключатель `theme=` в шапке).
- [ ] Внешние ссылки открываются в новой вкладке (`target="_blank"` + `rel="noopener noreferrer"`).
- [ ] Навигация работает с клавиатуры (Tab, Enter, Escape в мобильном меню).
- [ ] При `prefers-reduced-motion: reduce` анимации не мешают чтению.

