# Умный дом

Открывает [yandex.ru/iot](https://yandex.ru/iot/) во всплывающем окне расширения **или** с теми же правками UI через Tampermonkey на самом сайте.

Расширение только для расширения **Chrome / Edge / Chromium**.

## Расширение

1. Скачайте или склонируйте репозиторий.
2. Откройте `chrome://extensions` (или `edge://extensions`).
3. Включите **Режим разработчика**.
4. **Загрузить распакованное расширение** → выберите папку репозитория.
5. Закрепите иконку на панели и нажмите на неё.

## Tampermonkey

Файл: [`userscript/yandex-iot.user.js`](userscript/yandex-iot.user.js)

1. Установите [Tampermonkey](https://www.tampermonkey.net).
2. Откройте `userscript/yandex-iot.user.js`.
3. Подтвердите установку.
4. Зайдите на [yandex.ru/iot](https://yandex.ru/iot).

Логика для расширения и скрипта одна: `content/tweak.js` + `content/tweak.css`. Скрипт для [Tampermonkey](https://www.tampermonkey.net) **собирается** из них:

```bash
node scripts/build-userscript.js
```

## Что меняется на странице

- Компактный UI (без лишней шапки и рекламных пунктов в нижнем меню)
- Кнопка Алисы: показать/скрыть Алису в нижнем меню (по умолчанию скрыта)
- Скрыты сториз / промо / adfox / in-app баннеры
- Скролл фильтров колесом и перетаскиванием

## Файлы

| Файл                             | Назначение              |
| -------------------------------- | ----------------------- |
| `manifest.json`                  | Расширение MV3          |
| `popup.html` / `popup.css`       | Окно расширения         |
| `rules.json`                     | DNR                     |
| `content/tweak.js` / `tweak.css` | Общие правки UI         |
| `userscript/yandex-iot.user.js`  | Скрипт для Tampermonkey |
| `scripts/build-userscript.js`    | Сборка userscript       |
| `icons/`                         | Иконки                  |

## Лицензия

MIT
