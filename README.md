# Персональный сайт

Статический сайт-визитка: чистый HTML, CSS и JavaScript, без сборки и зависимостей.
Публикуется на GitHub Pages автоматически через GitHub Actions.

## Что внутри

```
.
├── index.html                  # вся разметка: hero, обо мне, проекты, навыки, контакты
├── 404.html                    # страница для несуществующих адресов (GitHub Pages)
├── assets/
│   ├── css/styles.css          # токены тем, компоненты, адаптив
│   └── js/main.js              # тема, меню, scroll-spy, копирование e-mail
├── .github/workflows/deploy.yml # автодеплой на GitHub Pages
├── .nojekyll                   # отключает обработку Jekyll на Pages
└── .gitignore
```

Особенности:

- тёмная и светлая темы (выбор запоминается, по умолчанию — системная);
- адаптивная вёрстка и мобильное меню;
- доступность: skip-link, `aria-*`, видимый фокус, поддержка `prefers-reduced-motion`;
- никаких внешних шрифтов, CDN и трекеров — страница грузится одним заходом;
- относительные пути, поэтому сайт работает и в подпапке (`username.github.io/repo/`).

## Локальный просмотр

```bash
python3 -m http.server 8000
# открыть http://localhost:8000
```

Можно и просто открыть `index.html` в браузере, но локальный сервер ближе к
реальным условиям (например, для `navigator.clipboard`).

## Что заменить на своё

Все заглушки помечены в коде комментариями `TODO`:

| Что | Где |
| --- | --- |
| Имя, роль, город, описание | `index.html` (`<title>`, `meta`, `.hero`, `.brand`, `.footer`) |
| Текст «Обо мне» и цифры | `index.html`, секция `#about` |
| Проекты и ссылки на них | `index.html`, секция `#projects` |
| Навыки | `index.html`, секция `#skills` |
| E-mail | `mailto:` и `data-email` в секции `#contact` |
| Соцсети | `href` у ссылок в `.socials` |
| Аватар | заменить `.avatar__inner` на `<img src="assets/img/avatar.jpg" alt="...">` |

Найти все заглушки сразу:

```bash
grep -rn "your-username\|hello@example.com\|Александр\|АП" index.html README.md
```

Если сайт живёт в подпапке (`https://username.github.io/repo/`), поправьте ссылку
«Вернуться на главную» в `404.html` на `/repo/`.

## Публикация на GitHub Pages

### 1. Создать репозиторий и запушить код

```bash
git add .
git commit -m "feat: initial personal website"
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

- [ ] Заменены имя, тексты, ссылки и e-mail.
- [ ] Внешние ссылки открываются в новой вкладке (`target="_blank"` + `rel="noopener noreferrer"`).
- [ ] Сайт проверен в тёмной и светлой темах и на узком экране (< 400 px).
- [ ] Навигация работает с клавиатуры (Tab, Enter, Escape в мобильном меню).

