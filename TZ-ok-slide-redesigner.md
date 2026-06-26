# ТЗ: OK Slide Redesigner
> Веб-приложение на GitHub Pages. Превращает .pptx / текст в красивые слайды по дизайн-системе ОК. Выдаёт SVG + PDF.

---

## 1. Стек

| Слой | Технология | Почему |
|---|---|---|
| Frontend | React + Vite | SPA, быстрый старт, GitHub Pages |
| Стили | CSS Modules + design-tokens.js | Все токены в одном файле |
| PPTX-парсинг | mammoth.js (браузер) или python-pptx (если есть бэк) | Без бэкенда — mammoth |
| AI | Anthropic API `/v1/messages` | Классификация + генерация вариантов |
| SVG → PDF | jsPDF + SVG2PDF.js | Браузерная конвертация |
| Деплой | GitHub Pages / gh-pages | Бесплатно, без сервера |
| Бэкенд (опц.) | Cloudflare Worker | Хранение серверного ключа |

---

## 2. Архитектура проекта

```
ok-slide-redesigner/
├── src/
│   ├── design-system/
│   │   ├── tokens.js          ← ВСЕ токены: цвета, радиусы, шрифты, отступы
│   │   ├── typography.js      ← Шрифтовая система
│   │   ├── mockups.js         ← SVG-мокапы телефонов (iPhone, Android)
│   │   └── grid.js            ← Сетки: 2-col, 3-col, hero, table, timeline
│   │
│   ├── layouts/               ← Рендереры лейаутов (чистые функции SVG)
│   │   ├── Cover.js
│   │   ├── Stats.js
│   │   ├── ThreeCards.js
│   │   ├── BeforeAfter.js
│   │   ├── Table.js
│   │   ├── Timeline.js
│   │   └── index.js           ← { layout: renderFn }
│   │
│   ├── ai/
│   │   ├── classifier.js      ← Промт: определить лейаут + извлечь данные
│   │   ├── variants.js        ← Промт: сгенерировать 3 варианта сетки
│   │   └── client.js          ← Обёртка над fetch к Anthropic API
│   │
│   ├── parsers/
│   │   ├── pptxParser.js      ← Парсинг .pptx через mammoth / JSZip
│   │   └── textParser.js      ← Разбивка вставленного текста на слайды
│   │
│   ├── export/
│   │   ├── svgExport.js       ← Скачать SVG (один / все)
│   │   └── pdfExport.js       ← SVG → PDF через jsPDF
│   │
│   ├── components/
│   │   ├── App.jsx
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx         ← Список слайдов (миниатюры)
│   │   ├── Canvas.jsx          ← Превью активного слайда
│   │   ├── VariantPicker.jsx   ← 2-3 варианта одного слайда рядом
│   │   ├── PropsPanel.jsx      ← Редактор данных + смена лейаута
│   │   ├── TokensPanel.jsx     ← Просмотр токенов
│   │   ├── ApiKeyModal.jsx     ← Ввод ключа пользователем
│   │   └── ProgressBar.jsx
│   │
│   └── main.jsx
│
├── public/
│   └── fonts/                 ← SB Sans или Arial subset
│
├── design-system-docs/        ← Документация токенов (для Figma-экспорта)
│   └── tokens.json            ← W3C Design Tokens формат
│
└── .env.example               ← VITE_ANTHROPIC_KEY=your_key_here
```

---

## 3. Дизайн-система (tokens.js)

```js
// src/design-system/tokens.js
export const COLORS = {
  // Основные
  orange:       '#FF5500',
  orangeLight:  '#FF6B1A',
  orangeDark:   '#E04A00',
  black:        '#1A1A1A',
  cream:        '#FFF0E5',
  creamDark:    '#FFE4D0',
  white:        '#FFFFFF',

  // Текст
  textOnOrange: '#FFFFFF',
  textAccent:   '#FFD4B8',   // приглушённый белый на оранжевом
  textOnCream:  '#1A1A1A',
  metricValue:  '#FFFFFF',
  metricLabel:  '#FF5500',   // оранжевый лейбл на чёрной карточке

  // Семантические
  cardDark:     '#1A1A1A',
  cardLight:    '#FFF0E5',
  separator:    'rgba(255,255,255,0.2)',
};

export const RADII = {
  slide:   '24px',   // внешний радиус слайда (превью)
  card:    '24px',   // большие карточки
  badge:   '16px',   // метрика-бейдж
  icon:    '14px',   // иконка-аватар
  button:  '12px',   // кнопки UI
  chip:    '8px',    // теги / чипы
};

export const SPACING = {
  // Внутри слайда (px при 1920×1080)
  slideH:  72,    // отступ по горизонтали
  slideV:  64,    // отступ по вертикали
  gap:     36,    // между блоками
  inner:   48,    // внутри карточки
  headerH: 240,   // высота зоны заголовка
};

export const TYPE = {
  // Семейства
  display: 'SB Sans Display, Arial Black, Arial, sans-serif',
  body:    'SB Sans Text, Arial, sans-serif',

  // Размеры (px при 1920×1080)
  h1:      108,  // обложка
  h2:      72,   // заголовок слайда
  h3:      42,   // подзаголовок карточки
  body:    27,
  caption: 21,
  metric:  96,   // большая цифра
  metricSm:30,   // лейбл под цифрой

  // Веса
  black:   900,
  bold:    700,
  regular: 400,
};

export const SLIDE = {
  w: 1920,
  h: 1080,
  aspect: '16/9',
};

export const SHADOWS = {
  card: '0 4px 24px rgba(0,0,0,0.12)',
};
```

---

## 4. Лейауты слайдов

### 4.1 Типы лейаутов

| ID | Название | Когда использовать |
|---|---|---|
| `cover` | Обложка | Первый слайд, раздел-разделитель |
| `stats` | Статистика | 2–6 числовых метрик |
| `three_cards` | 3 карточки | 3 параллельных тезиса/пункта |
| `before_after` | Было/Стало | Сравнение с метрикой результата |
| `table` | Таблица строк | Структурированные данные с категориями |
| `timeline` | Таймлайн | Данные с временной прогрессией |
| `two_col` | 2 колонки | Текст + список или 2 блока контента |
| `mockup` | С мокапом | Показ интерфейса на телефоне |

### 4.2 Варианты сетки (для каждого лейаута — 3 варианта)

Каждый лейаут рендерится в **3 варианта** с разной композицией:

**Вариант A** — классический (как в оригинальных слайдах ОК)
**Вариант B** — смещённый акцент (иначе расставлены веса)
**Вариант C** — компактный / нестандартный (другая иерархия)

Пример для `before_after`:
- A: описание слева, скриншоты справа, метрика внизу слева
- B: метрика крупно слева (50% ширины), было/стало справа стопкой
- C: горизонтальная полоса было→стало сверху, описание + метрика снизу

---

## 5. Мокапы телефонов (mockups.js)

SVG-мокапы рисуются кодом (не картинки) — масштабируются без потери качества.

```js
// src/design-system/mockups.js

export function iphoneMockup({ x, y, w, content, dark = true }) {
  const h = w * 2.16; // соотношение сторон iPhone
  const r = w * 0.12;
  const screenPad = w * 0.04;
  const screenY = y + h * 0.08;
  const screenH = h * 0.84;

  return `
    <!-- корпус -->
    <rect x="${x}" y="${y}" width="${w}" height="${h}"
          rx="${r}" fill="${dark ? '#1A1A1A' : '#F5F5F5'}"
          stroke="#333" stroke-width="2"/>
    <!-- экран -->
    <rect x="${x + screenPad}" y="${screenY}"
          width="${w - screenPad*2}" height="${screenH}"
          rx="${r * 0.6}" fill="${dark ? '#0A0A0A' : '#FFFFFF'}"/>
    <!-- динамик -->
    <rect x="${x + w*0.35}" y="${y + h*0.025}" width="${w*0.3}" height="${h*0.012}"
          rx="4" fill="${dark ? '#333' : '#CCC'}"/>
    <!-- контент слота -->
    ${content || ''}
  `;
}

export function androidMockup({ x, y, w, content, dark = true }) {
  // аналогично, чуть другие пропорции
}
```

---

## 6. AI-модуль

### 6.1 Промт: классификация + извлечение данных

```
// src/ai/classifier.js — SYSTEM PROMPT

You are a slide layout classifier for the OK (Odnoklassniki) design system.

Given raw slide text, output ONLY valid JSON without any markdown or explanation.

## Output schema
{
  "layout": "<layout_id>",
  "confidence": 0.0-1.0,
  "data": { ...layout-specific fields... }
}

## Layout schemas

cover:
  { "title": "string (max 3 lines)", "subtitle": "string|null" }

stats:
  { "title": "string", "rows": [{ "label": "string", "metrics": [{"value":"string","label":"string"}] }] }

three_cards:
  { "title": "string", "cards": [{ "icon": "emoji", "title": "string", "bullets": ["string"] }] }

before_after:
  { "title": "string", "description": "string", "before": "string", "after": "string",
    "metric": { "value": "string", "label": "DAU|TS|Rev|string" } }

table:
  { "title": "string", "columns": ["string","string"],
    "rows": [{ "category": "string", "detail": "string", "metric": "string|null" }] }

timeline:
  { "title": "string",
    "points": [{ "label": "string", "value": "string", "active": bool }] }

two_col:
  { "title": "string", "left": { "heading": "string", "body": "string" },
    "right": { "heading": "string", "bullets": ["string"] } }

mockup:
  { "title": "string", "description": "string",
    "before": "string|null", "after": "string|null",
    "metric": { "value": "string", "label": "string" },
    "hasScreenshots": true }

## Classification rules
- cover → title slides, short text, no data, section dividers
- stats → 2+ numeric metrics are the main content
- three_cards → exactly 3 parallel items/pillars/columns
- before_after → "было/стало", "до/после", before/after comparison present
- table → structured rows with categories, multi-row data
- timeline → time labels present (dates, periods, H1/H2, май/июнь)
- two_col → two distinct content blocks without strong before/after framing
- mockup → mentions screenshots, phone UI, app screens, "лента", "экран"

## Important
- Keep all text in the original language (Russian stays Russian)
- Shorten titles to max 80 chars, preserve meaning
- If bullets > 5, keep the most important 4
- metric.label: prefer short tags: DAU, TS, Rev, MAU — not full phrases
```

### 6.2 Промт: генерация 3 вариантов сетки

```
// src/ai/variants.js — SYSTEM PROMPT

You are a slide layout composer for the OK design system.
Given slide data and layout type, generate 3 grid variants with different visual compositions.

## Design tokens available
- slide: 1920×1080px
- spacing.slideH: 72px (horizontal margin)
- spacing.slideV: 64px (vertical margin)  
- spacing.gap: 36px (between blocks)
- header zone: y=64 to y=240 (title + logo)
- content zone: y=270 to y=1016

## Output schema
Return ONLY valid JSON array of 3 variant objects:

[
  {
    "variant": "A",
    "label": "Классический",        ← short human label
    "description": "string",         ← 1 sentence what's different
    "grid": {
      "type": "two_col|three_col|hero_left|hero_right|stacked|asymmetric",
      "regions": [
        {
          "id": "string",            ← e.g. "metric_badge", "card_1", "description"
          "x": number, "y": number,
          "w": number, "h": number,
          "role": "title|metric|card|description|image_placeholder|badge"
        }
      ]
    }
  },
  { "variant": "B", ... },
  { "variant": "C", ... }
]

## Rules for variants
- A: faithful to the original OK presentation style
- B: shift the visual weight — e.g. make the metric dominate, or flip columns
- C: unconventional but still on-brand — different hierarchy, unexpected proportion

## Constraints
- All regions must stay within x: 48–1872, y: 180–1036
- Minimum region size: 120×60px
- Regions must not overlap
- Keep at least 24px gap between all regions
- Metric badges: preferred size ~260×110px, radius 20px
- Cards on cream background: radius 24px

## Input you will receive
{ "layout": "before_after", "data": { ... } }
```

### 6.3 Промт: улучшение текста слайда (опциональная фича)

```
// src/ai/textpolish.js — SYSTEM PROMPT

You are a slide copywriter for business presentations.
Given raw slide text, improve it for clarity and impact without changing the meaning.

Rules:
- Keep the original language (Russian → Russian)
- Shorten titles: max 60 chars, punchy
- Bullets: max 7 words each, start with verb or noun
- Numbers/metrics: keep exactly as-is
- Do not invent facts
- Output the same JSON schema as input, only text fields changed
- Do not add markdown, do not wrap in code blocks
```

---

## 7. Пользовательский поток (UX)

```
1. Открыл приложение
   → Видит демо-слайды из ОК (6 штук)
   → Понимает что это делает

2. Ввод ключа API (если нет серверного)
   → Кнопка «Настройки» → модалка → поле для ключа
   → Ключ сохраняется в localStorage
   → Если серверный ключ есть — этот шаг скрыт

3. Загрузка контента
   → Вариант A: перетащить .pptx на зону дропа
     → Парсинг через JSZip/mammoth → текст по слайдам
   → Вариант B: кнопка «Вставить текст» → textarea
     → Разбивка на слайды по двойному переносу строки

4. Обработка (прогресс-бар)
   → Для каждого слайда: запрос к Claude → layout + data
   → Параллельно или последовательно (зависит от rate limits)

5. Результат
   → Слева: список слайдов (миниатюры SVG)
   → Центр: активный слайд, под ним 3 варианта сетки
   → Пользователь выбирает вариант кликом → он становится активным
   → Справа: панель редактирования (JSON или form-поля)

6. Экспорт
   → «Скачать SVG» — все слайды как отдельные .svg файлы в .zip
   → «Скачать PDF» — все слайды в одном .pdf файле
   → «Скачать один слайд» — SVG / PNG активного
```

---

## 8. Компонент VariantPicker

Ключевой компонент — показывает 3 варианта одного слайда:

```
┌─────────────────────────────────────────────────┐
│  Вариант A          Вариант B       Вариант C    │
│  Классический       Метрика вперёд  Стопка       │
│  ┌──────────┐      ┌──────────┐    ┌──────────┐  │
│  │          │      │          │    │          │  │
│  │  [SVG]   │      │  [SVG]   │    │  [SVG]   │  │
│  │          │      │          │    │          │  │
│  └──────────┘      └──────────┘    └──────────┘  │
│  ● выбран           ○               ○             │
└─────────────────────────────────────────────────┘
```

- Все 3 рендерятся с реальными данными слайда
- Клик выбирает вариант → он отображается в основном Canvas
- При смене слайда — варианты перегенерируются (или кешируются)

---

## 9. Экспорт

### SVG
- Один файл на слайд: `slide-01.svg`, `slide-02.svg`, ...
- ZIP через JSZip: `presentation.zip`
- Все шрифты embeddable через `<style>` внутри SVG

### PDF
```js
// src/export/pdfExport.js
import jsPDF from 'jspdf';
import svg2pdf from 'svg2pdf.js';

export async function exportToPDF(slides) {
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [1920, 1080] });
  for (let i = 0; i < slides.length; i++) {
    if (i > 0) pdf.addPage([1920, 1080], 'landscape');
    const svgEl = document.getElementById(`slide-svg-${i}`);
    await svg2pdf(svgEl, pdf, { x: 0, y: 0, width: 1920, height: 1080 });
  }
  pdf.save('presentation.pdf');
}
```

---

## 10. Режимы API-ключа

### Режим A: пользовательский ключ
- Модалка при первом запросе (или в настройках)
- Хранится в `localStorage` (предупреждение пользователю)
- Передаётся в заголовке `x-api-key` из браузера

### Режим B: серверный ключ (Cloudflare Worker)
```
src/ai/client.js:
  if (import.meta.env.VITE_USE_PROXY === 'true')
    → fetch('/api/claude', { body: messages })  // Worker проксирует
  else
    → fetch('https://api.anthropic.com/v1/messages', { headers: { 'x-api-key': userKey } })
```

Cloudflare Worker (5 строк):
```js
export default {
  fetch(req, env) {
    return fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { ...req.headers, 'x-api-key': env.ANTHROPIC_KEY },
      body: req.body,
    });
  }
}
```

---

## 11. GitHub Pages деплой

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with: { node-version: '20' }
      - run: npm ci
      - run: npm run build
        env:
          VITE_USE_PROXY: false   # или true если есть Worker
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

```js
// vite.config.js
export default {
  base: '/ok-slide-redesigner/',  // имя репозитория
  build: { outDir: 'dist' }
}
```

---

## 12. Приоритет разработки (фазы)

### Фаза 1 — MVP (можно показать)
- [ ] Дизайн-система: tokens.js, 6 лейаутов
- [ ] Рендер SVG по данным (без AI)
- [ ] Вставка текста → ручной выбор лейаута
- [ ] Скачать SVG + PDF
- [ ] Деплой на GitHub Pages

### Фаза 2 — AI-классификация
- [ ] Подключение Claude API
- [ ] Автоматическая классификация лейаута
- [ ] 3 варианта сетки через AI
- [ ] Оба режима ключа (user / server)

### Фаза 3 — Полный фарш
- [ ] Парсинг .pptx (JSZip)
- [ ] Мокапы телефонов в SVG
- [ ] Редактор полей (не только JSON)
- [ ] Улучшение текста через AI
- [ ] Figma API экспорт (если есть токен)

---

## 13. Промт для запуска в Claude Code

Вставь это в начало сессии в Claude Code:

```
Мы делаем веб-приложение OK Slide Redesigner.
Репозиторий: github.com/[username]/ok-slide-redesigner

Стек: React + Vite, деплой на GitHub Pages.
Дизайн-система описана в файле TZ-ok-slide-redesigner.md.

Начни с Фазы 1:
1. Создай структуру проекта (npm create vite@latest)
2. Создай src/design-system/tokens.js с токенами из ТЗ
3. Создай src/layouts/ — 6 файлов рендереров (чистые функции, принимают data, возвращают SVG-строку)
4. Создай базовый App.jsx с sidebar (список слайдов) + canvas (превью) + props panel
5. Добавь демо-слайды из ОК как демо-данные
6. Настрой vite.config.js для GitHub Pages
7. Добавь npm run deploy через gh-pages

Не подключай AI пока — только рендер по данным.
Все SVG-рендереры должны быть чистыми функциями: (data, tokens) => svgString
```

---

## 14. Структура design-tokens.json (для Figma)

```json
{
  "$schema": "https://tr.designtokens.org/format/",
  "color": {
    "orange":      { "$value": "#FF5500", "$type": "color" },
    "black":       { "$value": "#1A1A1A", "$type": "color" },
    "cream":       { "$value": "#FFF0E5", "$type": "color" },
    "white":       { "$value": "#FFFFFF", "$type": "color" },
    "textAccent":  { "$value": "#FFD4B8", "$type": "color" }
  },
  "borderRadius": {
    "card":   { "$value": "24px", "$type": "dimension" },
    "badge":  { "$value": "16px", "$type": "dimension" },
    "button": { "$value": "12px", "$type": "dimension" }
  },
  "spacing": {
    "slideH": { "$value": "72px", "$type": "dimension" },
    "gap":    { "$value": "36px", "$type": "dimension" },
    "inner":  { "$value": "48px", "$type": "dimension" }
  },
  "typography": {
    "h1": { "$value": { "fontSize": "108px", "fontWeight": "900", "fontFamily": "SB Sans Display, Arial" }, "$type": "typography" },
    "h2": { "$value": { "fontSize": "72px", "fontWeight": "800", "fontFamily": "SB Sans Display, Arial" }, "$type": "typography" },
    "body": { "$value": { "fontSize": "27px", "fontWeight": "400", "fontFamily": "SB Sans Text, Arial" }, "$type": "typography" },
    "metric": { "$value": { "fontSize": "96px", "fontWeight": "800", "fontFamily": "SB Sans Display, Arial" }, "$type": "typography" }
  }
}
```

---

## 15. Режимы просмотра (View Modes)

Три режима переключаются кнопками в хедере. Активный режим меняет только центральную зону — сайдбар и панель свойств остаются на месте.

### Переключатель режимов

```
┌─────────────────────────────────────────────────────────────┐
│  [ОК]  Slide Redesigner    [ Оригинал | Результат | Сравнение ]   [UI Kit]  ⚙  │
└─────────────────────────────────────────────────────────────┘
```

Состояние хранится в URL-параметре `?mode=original|result|compare` — чтобы можно было шарить ссылку.

---

### Режим A: Оригинал (`mode=original`)

Показывает исходные слайды из .pptx как они есть — растеризованные PNG или текстовый превью. Нужен чтобы помнить «откуда пришли».

```
┌──────────────────────────────────────────┐
│                                          │
│   [PNG / текст оригинального слайда]     │
│           1920 × 1080                     │
│                                          │
└──────────────────────────────────────────┘
```

- Если .pptx — рендерим каждый слайд через LibreOffice (бэк) или показываем сырой текст (фронт)
- Если вставлен текст — показываем его как «карточку сырого контента» в нейтральном стиле
- Под слайдом: `← Пред | 3 / 12 | След →`

---

### Режим B: Результат (`mode=result`)

Основной рабочий режим. Показывает переоформленный слайд + варианты снизу.

```
┌─────────────────────────────────┐
│                                 │
│   [Активный SVG-слайд]          │  ← Canvas, макс. ширина ~900px
│                                 │
└─────────────────────────────────┘

  Варианты:
  ┌──────────┐  ┌──────────┐  ┌──────────┐
  │  A  ●    │  │  B  ○    │  │  C  ○    │   ← VariantPicker
  └──────────┘  └──────────┘  └──────────┘

  [⬇ SVG]  [⬇ PDF]  [✏ Редактировать]
```

- Клик на вариант → он становится активным в Canvas
- Кнопка «Редактировать» → открывает PropsPanel справа

---

### Режим C: Сравнение (`mode=compare`)

Два слайда одинакового размера рядом — оригинал слева, результат справа.

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   ┌────────────────────┐     ┌────────────────────┐        │
│   │                    │     │                    │        │
│   │   ОРИГИНАЛ         │     │   РЕЗУЛЬТАТ        │        │
│   │   (PNG / текст)    │     │   (SVG)            │        │
│   │                    │     │                    │        │
│   └────────────────────┘     └────────────────────┘        │
│        Оригинал                  Вариант A ▾               │
│                                                             │
│   ← Пред                                         След →     │
└─────────────────────────────────────────────────────────────┘
```

Детали реализации:
- Оба слайда занимают ~46% ширины контейнера, gap 2%
- Под правым слайдом — дропдаун выбора варианта (A / B / C)
- Навигация `← →` синхронно переключает оба
- Кнопка `[⬇ PDF сравнения]` — экспортирует PDF где каждый разворот = оригинал + результат
- Лейбл «Оригинал» / «Результат» показан над каждой панелью тонкой строчкой

---

### Панель альтернатив (при клике на слайд в результате)

При клике на активный слайд в режимах Результат и Сравнение — справа выезжает колонка альтернатив:

```
┌─────────────────────────────────────────────────────────┐
│  [Canvas: активный слайд] │  Альтернативы               │
│                           │  ┌──────────┐ Вариант A ●  │
│                           │  └──────────┘               │
│                           │  ┌──────────┐ Вариант B ○  │
│                           │  └──────────┘               │
│                           │  ┌──────────┐ Вариант C ○  │
│                           │  └──────────┘               │
│                           │  [↺ Перегенерировать]       │
└─────────────────────────────────────────────────────────┘
```

- Колонка шириной ~280px, выезжает с правой стороны (анимация slide-in)
- «Перегенерировать» — повторный запрос к Claude для новых вариантов
- Закрывается кликом за пределами или на крестик

---

## 16. UI Kit (вкладка)

Отдельная вкладка в хедере `[UI Kit]`. Показывает все элементы дизайн-системы живьём — рендерятся из тех же токенов что и слайды, никакого дублирования кода.

### Структура страницы UI Kit

```
UI Kit — Дизайн-система ОК
────────────────────────────────────────────────

  [Цвета]  [Типографика]  [Компоненты]  [Сетки]  [Мокапы]

────────────────────────────────────────────────
```

Секции переключаются горизонтальными таб-пиллами внутри страницы.

---

### Секция: Цвета

```
Основная палитра
  ██████  orange        #FF5500
  ██████  black         #1A1A1A
  ██████  cream         #FFF0E5
  ██████  white         #FFFFFF

На оранжевом фоне
  ░░░░░░  textOnOrange  #FFFFFF   AA ✓
  ░░░░░░  textAccent    #FFD4B8   AA ✓

Карточки
  ██████  cardDark      #1A1A1A
  ██████  cardLight     #FFF0E5
  ░░░░░░  metricLabel   #FF5500
```

Каждый цвет: свотч + имя токена + hex + WCAG-контраст-бейдж.

---

### Секция: Типографика

Живые примеры каждого стиля:

```
h1 — 72px / 900          «Социальная сеть Одноклассники»
h2 — 48px / 800          «Ключевые запуски H1 2026»
h3 — 28px / 700          «Регуляторная поддержка»
body — 18px / 400        «Перешли на новую модель ранжирования»
caption — 14px / 400     «лента рекомендаций, короткие видео»
metric — 64px / 800      «39,5»
metricLabel — 20px / 700 «МЛН MAU»
```

Под каждым: токен-имя + CSS-значения.

---

### Секция: Компоненты

Все переиспользуемые SVG-блоки которые появляются на слайдах:

| Компонент | Описание |
|---|---|
| MetricBadge | Чёрная карточка: большое число + лейбл снизу |
| CreamCard | Кремовая карточка: иконка + заголовок + буллеты |
| SectionHeader | Заголовок слайда + лого ОК справа |
| BulletList | Список с оранжевой стрелкой-chevron |
| Separator | Тонкая разделительная линия (rgba белый) |
| ChipTag | Небольшой тег с фоном |
| LogoBadge | Иконка ОК в скруглённом квадрате |

Каждый компонент отрисован как SVG-превью + подпись токенов которые он использует.

```
MetricBadge
┌────────────────────┐
│  39,5  МЛН         │   bg: cardDark   radius: badge
│        MAU         │   text: white / metricLabel
└────────────────────┘
tokens: colors.cardDark, colors.metricLabel, radii.badge,
        type.metric (64/800), type.metricSm (20/700)
[Копировать SVG]
```

---

### Секция: Сетки

Визуализация доступных grid-паттернов:

```
two_col          three_col         hero_left
┌────┬────┐      ┌───┬───┬───┐     ┌──────┬───┐
│    │    │      │   │   │   │     │      │   │
│    │    │      │   │   │   │     │      │   │
└────┴────┘      └───┴───┴───┘     └──────┴───┘
50% / 50%        33% / 33% / 33%   60% / 40%

hero_right       stacked           asymmetric
┌───┬──────┐     ┌──────────┐      ┌─────┬─────┐
│   │      │     ├──────────┤      │     │ ┌─┐ │
│   │      │     └──────────┘      │     │ └─┘ │
└───┴──────┘                       └─────┴─────┘
40% / 60%        full-width rows   70% / 30%
```

Каждая сетка кликабельна — показывает пример реального слайда с этой сеткой.

---

### Секция: Мокапы телефонов

Все доступные мокапы из `mockups.js` с интерактивными контролами:

```
iPhone (тёмный)        iPhone (светлый)       Android (тёмный)
┌──┐                   ┌──┐                    ┌──┐
│  │                   │  │                    │  │
│  │                   │  │                    │  │
└──┘                   └──┘                    └──┘
w=220px                w=220px                 w=220px

[ Тёмный / Светлый ]   [ Размер: S M L ]   [Копировать SVG]
```

- Ползунок размера: S (160px) / M (220px) / L (300px)
- Переключатель тёмный/светлый
- Кнопка «Копировать SVG» — копирует код мокапа для вставки в слайд

---

## 17. Обновлённая структура файлов

```
src/
├── design-system/
│   ├── tokens.js
│   ├── typography.js
│   ├── mockups.js
│   └── grid.js
│
├── layouts/           (без изменений)
│
├── ui-kit/            ← НОВОЕ
│   ├── UIKitPage.jsx  ← корневой компонент вкладки
│   ├── ColorsSection.jsx
│   ├── TypographySection.jsx
│   ├── ComponentsSection.jsx
│   ├── GridsSection.jsx
│   └── MockupsSection.jsx
│
├── components/
│   ├── App.jsx         ← добавить роутинг вкладок + viewMode state
│   ├── Header.jsx      ← переключатель режимов + кнопка UI Kit
│   ├── ViewModeBar.jsx ← [Оригинал | Результат | Сравнение]   ← НОВОЕ
│   ├── CompareView.jsx ← режим сравнения бок о бок            ← НОВОЕ
│   ├── AlternativesPanel.jsx ← выезжающая колонка вариантов  ← НОВОЕ
│   ├── Sidebar.jsx
│   ├── Canvas.jsx
│   ├── VariantPicker.jsx
│   ├── PropsPanel.jsx
│   └── ...
│
└── hooks/
    ├── useViewMode.js     ← состояние режима + sync с URL   ← НОВОЕ
    └── useAlternatives.js ← открыт/закрыт + выбранный вариант ← НОВОЕ
```

---

## 18. Обновлённый промт для Claude Code (Фаза 1 + новое)

```
Мы делаем OK Slide Redesigner — веб-приложение на React + Vite,
деплой на GitHub Pages. Полное ТЗ в файле TZ-ok-slide-redesigner.md.

── Фаза 1: базовый рендер ──────────────────────────────────────────

1. npm create vite@latest ok-slide-redesigner -- --template react
2. src/design-system/tokens.js — токены из §3 ТЗ
3. src/layouts/ — 8 рендереров: Cover, Stats, ThreeCards, BeforeAfter,
   Table, Timeline, TwoCol, Mockup. Каждый: (data, tokens) => svgString
4. src/design-system/mockups.js — iphoneMockup() и androidMockup()
   как чистые SVG-функции из §5 ТЗ
5. App.jsx со структурой: Header | Sidebar | MainArea | PropsPanel

── Фаза 1б: три режима просмотра ───────────────────────────────────

6. Header.jsx: переключатель [Оригинал | Результат | Сравнение] + вкладка [UI Kit]
   Состояние в URL ?mode=original|result|compare через useViewMode.js
7. CompareView.jsx: два слайда бок о бок (§15), одинаковый размер,
   лейблы «Оригинал» / «Результат», дропдаун варианта под правым
8. AlternativesPanel.jsx: выезжающая колонка вариантов (§15),
   открывается при клике на слайд в режимах result/compare
9. ViewModeBar.jsx: три кнопки, передаёт mode в App

── Фаза 1в: UI Kit ─────────────────────────────────────────────────

10. src/ui-kit/UIKitPage.jsx — страница с таб-пиллами (§16)
11. ColorsSection — свотчи с токен-именем, hex, WCAG-бейджем
12. TypographySection — живые SVG-примеры каждого типостиля
13. ComponentsSection — MetricBadge, CreamCard, SectionHeader,
    BulletList, Separator, ChipTag, LogoBadge (рендерятся из тех же
    функций что слайды — никакого дублирования)
14. GridsSection — 6 сеток как ASCII-схемы + кликабельный пример слайда
15. MockupsSection — iPhone/Android с ползунком размера и переключателем тёмный/светлый

── Общие требования ────────────────────────────────────────────────

- Все SVG-рендереры — чистые функции, нет сайд-эффектов
- Токены импортируются из одного файла tokens.js везде
- Не подключай AI на этом этапе
- Демо-данные — 6 слайдов из реальной ОК-презентации
- vite.config.js: base: '/ok-slide-redesigner/'
- npm run deploy через gh-pages
```


---

## 19. Фаза 4 — Figma API интеграция

### 19.1 Концепция

Одни и те же данные слайда (`slideData`) рендерятся тремя разными рендерерами:

```
slideData (JSON)
    │
    ├── renderSVG(data)    → svgString     → скачать / PDF
    ├── renderFigma(data)  → figma nodes  → POST в Figma API
    └── renderPPTX(data)   → pptx XML     → (будущее)
```

Все рендереры — чистые функции от одних токенов. Добавление Figma-рендерера не трогает SVG-код.

---

### 19.2 Что нужно от пользователя

| Параметр | Где взять | Где хранить |
|---|---|---|
| `figmaToken` | figma.com → Settings → Personal Access Tokens | localStorage |
| `figmaFileKey` | из URL файла: `figma.com/file/`**`ABCD1234`**`/...` | localStorage |
| `figmaPageName` | имя страницы куда вставлять (по умолчанию «Page 1») | localStorage |

Вводятся в том же модальном окне настроек что и API-ключ Claude. Отдельная секция «Figma».

---

### 19.3 Структура файлов

```
src/export/
├── svgExport.js       (уже есть)
├── pdfExport.js       (уже есть)
├── figmaExport.js     ← новый модуль
└── figmaNodes/        ← конвертеры лейаутов в Figma nodes
    ├── index.js       ← { layout: convertFn }
    ├── cover.js
    ├── stats.js
    ├── threeCards.js
    ├── beforeAfter.js
    ├── table.js
    ├── timeline.js
    └── helpers.js     ← общие хелперы: makeText, makeRect, makeFrame
```

---

### 19.4 helpers.js — базовые примитивы

```js
// src/export/figmaNodes/helpers.js

import { COLORS, TYPE, RADII, SPACING } from '../../design-system/tokens.js'

// Цвет из hex → Figma RGB (0–1)
export function hex2rgb(hex) {
  const r = parseInt(hex.slice(1,3), 16) / 255
  const g = parseInt(hex.slice(3,5), 16) / 255
  const b = parseInt(hex.slice(5,7), 16) / 255
  return { r, g, b }
}

export function solidFill(hex, opacity = 1) {
  return [{ type: 'SOLID', color: hex2rgb(hex), opacity }]
}

export function makeRect({ x, y, w, h, fill, radius = 0, name = 'rect' }) {
  return {
    type: 'RECTANGLE',
    name,
    x, y,
    width: w,
    height: h,
    cornerRadius: parseInt(radius),
    fills: solidFill(fill),
  }
}

export function makeText({ x, y, w, h, text, fontSize, fontWeight = 400,
                           color = COLORS.white, name = 'text' }) {
  return {
    type: 'TEXT',
    name,
    x, y,
    width: w,
    height: h,
    characters: text,
    style: {
      fontSize,
      fontWeight,
      fills: solidFill(color),
      fontFamily: 'Arial',
      textAutoResize: 'HEIGHT',
    },
  }
}

export function makeFrame({ x = 0, y = 0, w, h, name, fill, radius = 0, children = [] }) {
  return {
    type: 'FRAME',
    name,
    x, y,
    width: w,
    height: h,
    cornerRadius: parseInt(radius),
    fills: fill ? solidFill(fill) : [],
    children,
  }
}
```

---

### 19.5 Пример конвертера: cover.js

```js
// src/export/figmaNodes/cover.js

import { COLORS, TYPE, SPACING, SLIDE } from '../../design-system/tokens.js'
import { makeFrame, makeRect, makeText, solidFill } from './helpers.js'

export function coverToFigma(data) {
  const { w, h } = SLIDE
  const { title = '', subtitle = '' } = data

  return makeFrame({
    name: `Слайд: ${title.slice(0, 40)}`,
    w, h,
    fill: COLORS.orange,
    children: [

      // Декоративный круг
      makeRect({
        name: 'decor/circle',
        x: w * 0.72, y: h * 0.1,
        w: 520, h: 520,
        fill: COLORS.orangeLight,
        radius: '260',
      }),

      // Заголовок (три строки)
      makeText({
        name: 'title',
        x: SPACING.slideH, y: h * 0.22,
        w: w * 0.6, h: 400,
        text: title,
        fontSize: TYPE.h1,
        fontWeight: TYPE.black,
        color: COLORS.textOnOrange,
      }),

      // Подзаголовок
      ...(subtitle ? [makeText({
        name: 'subtitle',
        x: SPACING.slideH, y: h * 0.72,
        w: w * 0.5, h: 80,
        text: subtitle,
        fontSize: TYPE.body,
        color: COLORS.textAccent,
      })] : []),

      // Лого-бейдж
      makeFrame({
        name: 'logo/badge',
        x: SPACING.slideH, y: h - 140,
        w: 108, h: 108,
        fill: 'rgba(255,255,255,0.18)',
        radius: RADII.icon,
        children: [
          makeText({
            name: 'logo/text',
            x: 20, y: 32,
            w: 68, h: 44,
            text: 'ОК',
            fontSize: 28,
            fontWeight: TYPE.bold,
            color: COLORS.white,
          })
        ]
      }),
    ]
  })
}
```

---

### 19.6 figmaExport.js — главный модуль

```js
// src/export/figmaExport.js

import { coverToFigma }      from './figmaNodes/cover.js'
import { statsToFigma }      from './figmaNodes/stats.js'
import { threeCardsToFigma } from './figmaNodes/threeCards.js'
import { beforeAfterToFigma} from './figmaNodes/beforeAfter.js'
import { tableToFigma }      from './figmaNodes/table.js'
import { timelineToFigma }   from './figmaNodes/timeline.js'

const CONVERTERS = {
  cover:        coverToFigma,
  stats:        statsToFigma,
  three_cards:  threeCardsToFigma,
  before_after: beforeAfterToFigma,
  table:        tableToFigma,
  timeline:     timelineToFigma,
}

// Конвертировать один слайд → Figma node
export function slideToFigmaNode(slide, index) {
  const convert = CONVERTERS[slide.layout]
  if (!convert) throw new Error(`No Figma converter for layout: ${slide.layout}`)
  const node = convert(slide.data)
  node.name = `${String(index + 1).padStart(2, '0')} — ${node.name}`
  // Сдвигаем фреймы по горизонтали чтобы не накладывались
  node.x = index * (1920 + 100)
  node.y = 0
  return node
}

// Отправить все слайды в Figma
export async function exportToFigma(slides, { token, fileKey, pageName = 'Redesigned' }) {
  // 1. Получить список страниц файла
  const fileRes = await fetch(`https://api.figma.com/v1/files/${fileKey}`, {
    headers: { 'X-Figma-Token': token }
  })
  const fileData = await fileRes.json()

  // 2. Найти нужную страницу (или взять первую)
  const page = fileData.document.children.find(p => p.name === pageName)
             || fileData.document.children[0]

  // 3. Сконвертировать все слайды
  const nodes = slides.map((slide, i) => slideToFigmaNode(slide, i))

  // 4. POST nodes в файл
  const res = await fetch(
    `https://api.figma.com/v1/files/${fileKey}/nodes`,
    {
      method: 'POST',
      headers: {
        'X-Figma-Token': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nodes: nodes.map(n => ({
          ...n,
          document: { id: page.id }
        }))
      })
    }
  )

  if (!res.ok) {
    const err = await res.json()
    throw new Error(`Figma API error: ${err.message}`)
  }

  return {
    url: `https://www.figma.com/file/${fileKey}`,
    count: slides.length,
  }
}
```

---

### 19.7 UX в интерфейсе

Кнопка «Открыть в Figma» появляется в хедере рядом с «Скачать PDF» — но только если заполнен Figma token в настройках.

```
Флоу:
1. Пользователь открывает ⚙ Настройки
2. Секция «Figma» → вводит token + file key
3. Нажимает [Проверить] → GET /v1/me → показывает имя аккаунта
4. В хедере появляется кнопка [↗ Figma]
5. Клик → прогресс «Отправляю 12 слайдов...»
6. Готово → ссылка «Открыть файл в Figma»
```

Модальное окно настроек (новая секция):

```
┌─────────────────────────────────────┐
│  ⚙ Настройки                    ✕  │
│                                     │
│  Claude API                         │
│  ○ Мой ключ  ○ Серверный            │
│  [sk-ant-...____________]           │
│                                     │
│  ──────────────────────────────     │
│                                     │
│  Figma                              │
│  Token  [figd_...___________]       │
│  File   [https://figma.com/file/..] │
│  Страница  [Redesigned_______▾]     │
│  [Проверить подключение]            │
│  ✓ Подключено как Nikita            │
│                                     │
│             [Сохранить]             │
└─────────────────────────────────────┘
```

---

### 19.8 Промт для Claude Code (Фаза 4)

```
Добавь Figma API экспорт в OK Slide Redesigner.
ТЗ — раздел §19.

1. Создай src/export/figmaNodes/helpers.js с функциями
   hex2rgb, solidFill, makeRect, makeText, makeFrame из §19.4

2. Создай конвертеры для всех 8 лейаутов в src/export/figmaNodes/.
   Каждый: (data) => figmaFrameNode
   Используй только helpers.js + tokens.js — никакого SVG-кода.

3. Создай src/export/figmaExport.js с функциями
   slideToFigmaNode() и exportToFigma() из §19.6

4. В SettingsModal.jsx добавь секцию «Figma»:
   - поля token, fileKey, pageName
   - кнопку «Проверить» → GET https://api.figma.com/v1/me
   - показывать имя пользователя при успехе

5. В Header.jsx добавь кнопку [↗ Figma]:
   - видна только если figmaToken есть в localStorage
   - при клике → вызывает exportToFigma() → прогресс → ссылка на файл

Важно: конвертеры Figma и SVG-рендереры независимы.
Один и тот же slideData → разные выходы. Не переиспользуй SVG-код в Figma-конвертерах.
```

---

### 19.9 Ограничения Figma API (важно знать)

| Ограничение | Детали |
|---|---|
| Шрифты | Figma не загружает шрифты через API. Используй только шрифты которые уже есть в Figma: **Arial, Inter, Roboto**. SB Sans — только если он загружен в Figma организации |
| Изображения | Картинки из .pptx нужно сначала загрузить через `POST /v1/files/{key}/images`, получить imageRef, потом вставить в ноду |
| Rate limit | 3 запроса / сек на запись. При > 10 слайдов — добавить задержку между батчами |
| POST nodes | Этот endpoint создаёт новые ноды, не перезаписывает. При повторном экспорте появятся дубли — добавить опцию «удалить предыдущие» |
| CORS | Figma API поддерживает CORS из браузера — бэкенд не нужен |


---

## 20. Пересмотр AI-модуля: свободная композиция

### 20.1 Концепция (обновлённая)

Предыдущий подход (§6) предполагал жёсткие лейауты — Claude выбирал один из 8 шаблонов.

**Новый подход:** Claude — AI-дизайнер. Он анализирует контент, сам придумывает оптимальную bento-сетку и генерирует SVG напрямую. Лейауты из §4 остаются как *примеры вдохновения* в промте, не как ограничения.

```
Старая архитектура:
  контент → classifier → layout_id → hardcoded renderer → SVG

Новая архитектура:
  контент + токены + примеры → Claude → SVG (3 варианта)
                                            ↓
                                      валидация SVG
                                            ↓
                                      рендер в браузере
```

---

### 20.2 Библиотека визуальных акцентов

Акценты берутся из реальных слайдов ОК — Claude знает их и применяет по смыслу.

| Акцент | SVG-паттерн | Когда использовать |
|---|---|---|
| **Стрелка рисованная** | `<path>` с кривой Безье + arrowhead, stroke orangeLight, stroke-width 3–5 | Связать два элемента, показать переход было→стало |
| **Обводка маркером** | `<ellipse>` или `<path>` с grunge-stroke, fill none, stroke orange, opacity 0.7, stroke-width 6–8 | Обвести ключевую цифру или слово |
| **Подчёркивание** | `<line>` волнистое или прямое, stroke orange, stroke-width 4 | Выделить важное слово в тексте |
| **Кружок** | `<circle>` fill none, stroke white/orange, stroke-width 3 | Обвести иконку, аватар |
| **Скоба / bracket** | `<path>` L-образный, stroke white, stroke-width 3 | Сгруппировать несколько пунктов |
| **Метка-бейдж** | `<rect rx="16">` fill black + текст белый | Метрика результата (+0.3% DAU) |
| **Chip-тег** | `<rect rx="8">` fill orangeLight + текст | Категория, лейбл вертикали |

---

### 20.3 Главный промт (новый)

Это системный промт для генерации слайда. Заменяет classifier.js и variants.js.

```
// src/ai/slideDesigner.js — SYSTEM PROMPT

You are an expert presentation designer for OK (Odnoklassniki), Russia's social network.
Your task: given slide content, design 3 beautiful SVG slide variants (1920×1080px).

## Brand identity
- Background: always #FF5500 (OK orange) — the entire slide is orange
- Dark cards: #1A1A1A with white text — use for metrics, stats
- Light cards: #FFF0E5 (cream) with #1A1A1A text — use for content blocks
- Accent text on orange: #FFD4B8 (muted white) for descriptions
- Metric labels: #FF5500 on dark cards
- Logo badge: white rounded square, bottom-left, always present

## Typography (embed in SVG as font-family)
- Display: font-family="Arial Black, Arial" — titles, metrics, headlines
- Body: font-family="Arial" — descriptions, bullets, captions
- Title (h1): 108px / weight 900 — cover slides
- Slide title (h2): 72px / weight 800 — top of every content slide
- Card heading (h3): 42px / weight 700
- Body text: 27px / weight 400
- Caption: 21px / weight 400 / fill #FFD4B8
- Metric number: 96px / weight 800 / fill white
- Metric label: 30px / weight 700 / fill #FF5500

## Spacing
- Slide: 1920×1080px
- Horizontal margin: 72px from edges
- Vertical margin: 64px from edges
- Title zone: y=64 to y=240 (title text + OK logo badge top-right)
- Content zone: y=270 to y=1016
- Gap between blocks: 36px minimum
- Card inner padding: 48px

## Card radii
- Large cards: rx=36
- Metric badges: rx=24
- Icon badges: rx=20
- Small chips: rx=12

## OK logo badge (always include, top-right)
<rect x="1776" y="40" width="100" height="100" rx="20"
      fill="white" opacity="0.18"/>
<text x="1826" y="100" font-family="Arial Black" font-size="32"
      fill="white" text-anchor="middle">ОК</text>

## Bento grid philosophy
Do NOT use rigid equal-column grids. Think like a designer:
- Let content size drive cell size — a big metric gets a big cell
- Mix cell sizes: one wide cell + two narrow, or asymmetric 60/40 split
- Leave intentional breathing room — not every pixel needs content
- Group related items visually (proximity, shared background)
- Create visual hierarchy: ONE dominant element per slide

## Visual accents library
Use these SVG patterns to add emphasis. Apply based on content semantics:

Arrow (connects two elements):
<path d="M {x1},{y1} C {cx},{cy} {cx2},{cy2} {x2},{y2}"
      fill="none" stroke="#FF6B1A" stroke-width="4"
      marker-end="url(#arrowhead)"/>
<!-- always include arrowhead def when using arrows: -->
<defs>
  <marker id="arrowhead" markerWidth="10" markerHeight="7"
          refX="9" refY="3.5" orient="auto">
    <polygon points="0 0, 10 3.5, 0 7" fill="#FF6B1A"/>
  </marker>
</defs>

Marker circle (highlights key number/word):
<ellipse cx="{cx}" cy="{cy}" rx="{rw}" ry="{rh}"
         fill="none" stroke="white" stroke-width="6" opacity="0.7"
         stroke-dasharray="none"/>

Underline accent:
<line x1="{x}" y1="{y}" x2="{x2}" y2="{y}"
      stroke="#FF5500" stroke-width="5" stroke-linecap="round"/>

Metric badge (result callout):
<rect x="{x}" y="{y}" width="320" height="130" rx="24" fill="#1A1A1A"/>
<text x="{x+24}" y="{y+76}" font-family="Arial Black" font-size="52"
      fill="white">+0,3%</text>
<text x="{x+24+130}" y="{y+76}" font-family="Arial Black" font-size="32"
      fill="#FF5500">DAU</text>

## Variant strategy
Generate exactly 3 variants. Each must feel genuinely different:

Variant A — "Классический":
  Faithful to original OK slide style. Title top-left, content in
  structured cards below. Metric badge bottom-left if present.

Variant B — "Акцент":
  One element dominates 40–50% of the slide area.
  Could be: giant metric, large image placeholder, bold statement text.
  Supporting content compressed to the side or bottom.

Variant C — "Бенто":
  Free-form bento grid. Cells of different sizes, asymmetric.
  Use visual accents (arrows, circles) to create flow.
  Most creative interpretation of the content.

## Output format
Return ONLY a JSON array, no markdown, no explanation:

[
  {
    "variant": "A",
    "label": "Классический",
    "description": "one sentence describing the key compositional choice",
    "svg": "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1920 1080' width='1920' height='1080'>...</svg>"
  },
  { "variant": "B", "label": "Акцент", "description": "...", "svg": "..." },
  { "variant": "C", "label": "Бенто", "description": "...", "svg": "..." }
]

## Critical SVG rules
- All text must fit inside its container — estimate character width
- No element outside viewBox (0 0 1920 1080)
- Always close all SVG tags properly
- foreignObject is NOT supported — use <text> only
- Multi-line text: use multiple <text> elements with dy="1.2em" or explicit y
- Long titles: break at ~40 chars per line manually
- Embed all styles inline (no <style> tags needed, use attributes)
- Test: every rect/text x+width must be ≤ 1920, y+height must be ≤ 1080
```

---

### 20.4 Промт: пользовательский запрос (user turn)

```
// src/ai/slideDesigner.js — USER MESSAGE TEMPLATE

Slide content:
"""
{rawText}
"""

Context clues (extracted from .pptx if available):
- Has screenshots/images: {hasImages}
- Original layout type (hint only): {layoutHint}
- Slide position: {slideIndex} of {totalSlides}

Design 3 SVG variants for this slide following the system prompt rules.
Focus on: what is the most important information here? Make that dominant.
Apply visual accents where they add meaning, not decoration.
```

---

### 20.5 Валидация и fallback

Claude иногда делает ошибки в координатах или незакрытые теги. Нужна валидация:

```js
// src/ai/svgValidator.js

export function validateSlideSVG(svgString) {
  const errors = []
  const { w, h } = SLIDE // 1920, 1080

  // 1. Парсим SVG
  const parser = new DOMParser()
  const doc = parser.parseFromString(svgString, 'image/svg+xml')
  const parseError = doc.querySelector('parsererror')
  if (parseError) {
    errors.push({ type: 'parse_error', message: parseError.textContent })
    return { valid: false, errors }
  }

  // 2. Проверяем элементы за пределами viewBox
  doc.querySelectorAll('rect, text, circle, ellipse').forEach(el => {
    const x = parseFloat(el.getAttribute('x') || el.getAttribute('cx') || 0)
    const y = parseFloat(el.getAttribute('y') || el.getAttribute('cy') || 0)
    const ew = parseFloat(el.getAttribute('width') || el.getAttribute('rx') * 2 || 0)
    const eh = parseFloat(el.getAttribute('height') || el.getAttribute('ry') * 2 || 0)
    if (x + ew > w + 10) errors.push({ type: 'overflow_x', el: el.tagName, x, w: ew })
    if (y + eh > h + 10) errors.push({ type: 'overflow_y', el: el.tagName, y, h: eh })
  })

  return { valid: errors.length === 0, errors }
}

export async function generateWithRetry(prompt, maxRetries = 2) {
  for (let i = 0; i <= maxRetries; i++) {
    const result = await callClaude(prompt)
    const variants = JSON.parse(result)

    const validated = variants.map(v => ({
      ...v,
      validation: validateSlideSVG(v.svg)
    }))

    // Если хотя бы 2 из 3 валидны — возвращаем
    const validCount = validated.filter(v => v.validation.valid).length
    if (validCount >= 2) return validated

    // Иначе повтор с доп. инструкцией
    if (i < maxRetries) {
      const errorDetails = validated
        .filter(v => !v.validation.valid)
        .map(v => `Variant ${v.variant}: ${v.validation.errors.map(e => e.type).join(', ')}`)
        .join('\n')
      prompt += `\n\nPrevious attempt had errors:\n${errorDetails}\nPlease fix coordinates.`
    }
  }
  throw new Error('Failed to generate valid SVG after retries')
}
```

---

### 20.6 Обновлённый промт для Claude Code

```
Обнови AI-модуль в OK Slide Redesigner согласно §20 ТЗ.

1. Замени src/ai/classifier.js и src/ai/variants.js
   на один файл src/ai/slideDesigner.js
   Функция: generateSlideVariants(rawText, hints) → Promise<Variant[]>
   где Variant = { variant, label, description, svg, validation }

2. Системный промт — полностью из §20.3 ТЗ.
   User-промт — шаблон из §20.4.

3. Создай src/ai/svgValidator.js из §20.5:
   validateSlideSVG(svgString) → { valid, errors }
   generateWithRetry(prompt, maxRetries=2) → validated variants

4. Обнови VariantPicker.jsx:
   - Показывать label + description под каждым вариантом
   - Если validation.valid === false — показывать жёлтый бейдж
     «Требует проверки» (не скрывать вариант, дизайнер сам решит)

5. Обнови Canvas.jsx:
   - Рендерить SVG-строку напрямую через dangerouslySetInnerHTML
   - Не использовать img src=data:image/svg — нужен живой SVG в DOM
     (для последующего svg2pdf)

6. Кеширование:
   - Сохранять сгенерированные варианты в sessionStorage по ключу
     слайда (hash от rawText) — не перегенерировать при переключении

Не трогай SVG-рендереры в src/layouts/ — они нужны для UI Kit
и для Figma-экспорта. AI-генерация и code-рендеринг существуют параллельно.
```

---

### 20.7 Сравнение подходов: шаблоны vs AI-генерация

| | Шаблоны (§4–6) | AI-генерация (§20) |
|---|---|---|
| Скорость | мгновенно | 3–8 сек на слайд |
| Качество | предсказуемое | выше потолок, ниже пол |
| Bento-сетки | нет | да |
| Визуальные акценты | только заданные | по смыслу контента |
| Стоимость | бесплатно | ~$0.01–0.05 за слайд |
| Fallback | всегда работает | нужен retry |
| Figma-экспорт | через figmaNodes/ | через SVG → импорт |

**Рекомендуемая стратегия:**
- Шаблоны (§4) — быстрый предпросмотр пока AI думает
- AI-генерация (§20) — финальный результат, 3 варианта
- Показывать шаблонный рендер сразу, заменять AI-вариантами когда готовы

---

## 21. Интерактивная доработка слайда

### 21.1 Кнопка «Перегенерировать»

Появляется в двух местах:
- В `VariantPicker` под тремя вариантами — перегенерировать все три
- В `AlternativesPanel` — там же

```
┌──────────┐  ┌──────────┐  ┌──────────┐
│  A  ●    │  │  B  ○    │  │  C  ○    │
└──────────┘  └──────────┘  └──────────┘
              [↺ Перегенерировать]
```

При клике — новый запрос к Claude с тем же контентом но с seed-инструкцией:
```
Previous variants didn't satisfy the user. Generate 3 completely different
compositional approaches. Avoid: {список лейаутов предыдущих вариантов}.
```

Предыдущие варианты не удаляются — уходят в историю. Пользователь может
вернуться через `← Предыдущие варианты`.

---

### 21.2 Уточняющий промт

Поле ввода под активным слайдом в режиме «Результат»:

```
┌─────────────────────────────────────────────────────────┐
│                   [Canvas: активный SVG]                │
└─────────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────┐  ┌────────┐
  │ Уточни: сделай метрику крупнее...       │  │   →    │
  └─────────────────────────────────────────┘  └────────┘
  Примеры: «убери карточки» · «добавь стрелку» · «текст крупнее»
```

Технически — **multi-turn conversation**. История сообщений сохраняется
для каждого слайда:

```js
// src/ai/slideDesigner.js

export async function refineSlide(currentSVG, userInstruction, slideData) {
  const messages = [
    {
      role: 'user',
      content: buildInitialPrompt(slideData) // первый запрос
    },
    {
      role: 'assistant',
      content: JSON.stringify(currentVariant) // предыдущий ответ Claude
    },
    {
      role: 'user',
      content: `
Refine the selected variant (${currentVariant.variant}) based on this instruction:
"${userInstruction}"

Keep the overall composition and brand tokens. Return ONLY the updated variant
as a single JSON object (same schema, variant field = "refined"):
{ "variant": "refined", "label": "...", "description": "...", "svg": "..." }
      `.trim()
    }
  ]

  const response = await callClaude({ messages, system: SLIDE_DESIGNER_SYSTEM_PROMPT })
  return JSON.parse(response)
}
```

История уточнений показывается как цепочка под слайдом:

```
v1: Классический  →  «сделай метрику крупнее»
v2: refined       →  «добавь стрелку от описания»
v3: refined ●     ←  текущий
                  [↩ Откатить]
```

---

### 21.3 Примеры уточняющих инструкций (подсказки в UI)

Показываются как кликабельные чипы под полем ввода:

```
«Метрику крупнее»  «Убери карточки»  «Добавь стрелку»
«Текст лаконичнее»  «Бенто-сетка»  «Акцент на числах»
«Добавь обводку маркером»  «Светлее фон карточек»
```

При клике на чип — текст вставляется в поле и сразу отправляется.

---

### 21.4 Обновлённая структура компонентов

```
Canvas.jsx
  └── SlideRefineBar.jsx     ← поле ввода + чипы-подсказки  [НОВОЕ]

VariantPicker.jsx
  └── RegenerateButton.jsx   ← кнопка + история вариантов   [НОВОЕ]

src/ai/
  ├── slideDesigner.js       ← generateSlideVariants() + refineSlide()
  └── conversationStore.js   ← хранение истории per-слайд   [НОВОЕ]
```

```js
// src/ai/conversationStore.js
// Хранит историю multi-turn для каждого слайда

const store = new Map() // slideId → { messages[], variants[] }

export function getHistory(slideId) {
  return store.get(slideId) || { messages: [], variants: [] }
}

export function addVariants(slideId, variants) {
  const h = getHistory(slideId)
  h.variants.push({ timestamp: Date.now(), variants })
  store.set(slideId, h)
}

export function addRefinement(slideId, instruction, result) {
  const h = getHistory(slideId)
  h.messages.push(
    { role: 'user', content: instruction },
    { role: 'assistant', content: JSON.stringify(result) }
  )
  h.variants.push({ timestamp: Date.now(), variants: [result], instruction })
  store.set(slideId, h)
}
```

---

### 21.5 Промт для Claude Code (фича уточнений)

```
Добавь интерактивную доработку слайда согласно §21 ТЗ.

1. src/ai/conversationStore.js — хранение истории per-слайд (§21.4)
   getHistory, addVariants, addRefinement

2. В slideDesigner.js добавь функцию refineSlide(currentSVG, instruction, slideData)
   Использует multi-turn: history + новый user message → один уточнённый вариант
   Схема ответа: { variant: "refined", label, description, svg }

3. SlideRefineBar.jsx (под Canvas):
   - textarea / input одна строка
   - кнопка отправить (или Enter)
   - 8 чипов-подсказок (§21.3), клик = вставить + отправить
   - показывать спиннер пока идёт запрос
   - disabled если нет выбранного варианта

4. RegenerateButton.jsx (в VariantPicker):
   - кнопка «↺ Перегенерировать»
   - при клике: новый generateSlideVariants с avoid-инструкцией
   - стрелка «← Предыдущие» если есть история

5. Цепочка истории под SlideRefineBar:
   v1 → «инструкция» → v2 → «инструкция» → v3 ●
   Клик на любой → откатить к нему
   Кнопка [↩ Откатить] = вернуться на шаг назад

Хранение истории — только в памяти (conversationStore.js Map),
не в localStorage. При перезагрузке страницы история сбрасывается — это нормально.
```

---

## 22. Выбор модели и оптимизация стоимости

### 22.1 Рекомендуемые модели

| Задача | Модель | Причина |
|---|---|---|
| Классификация слайда → JSON | `claude-haiku-4-5-20251001` | Короткий output, простая задача, в 5× дешевле |
| Генерация SVG (3 варианта) | `claude-sonnet-4-6` | Оптимум качество/цена, 1M контекст, 128K output |
| Уточняющий промт (refine) | `claude-sonnet-4-6` | Нужно понимать предыдущий SVG и точно следовать инструкции |
| Перегенерация | `claude-sonnet-4-6` | То же что генерация |

### 22.2 Примерная стоимость на презентацию

```
Презентация 20 слайдов:

  Классификация:   20 × $0.001  = $0.02
  Генерация SVG:   20 × $0.04   = $0.80
  2 уточнения:      2 × $0.02   = $0.04
  ─────────────────────────────────────
  Итого без кеша:               ~ $0.86

  С prompt caching системного промта (-90% на повторных):
  Итого с кешем:                ~ $0.25
```

### 22.3 Prompt Caching — обязательная оптимизация

Системный промт (токены дизайн-системы + библиотека акцентов + правила SVG)
занимает ~3–4k токенов и одинаков для всех слайдов. Без кеширования он
тарифицируется заново на каждом запросе.

```js
// src/ai/client.js

export async function callClaude({ messages, userKey, useCache = true }) {
  const apiKey = userKey || import.meta.env.VITE_ANTHROPIC_KEY

  const body = {
    model: 'claude-sonnet-4-6',
    max_tokens: 16000,
    system: useCache
      ? [
          {
            type: 'text',
            text: SLIDE_DESIGNER_SYSTEM_PROMPT,
            cache_control: { type: 'ephemeral' }, // ← кешируем системный промт
          },
        ]
      : SLIDE_DESIGNER_SYSTEM_PROMPT,
    messages,
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-beta': 'prompt-caching-2024-07-31', // ← обязательный заголовок
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(`Claude API error ${res.status}: ${err.error?.message}`)
  }

  const data = await res.json()
  return data.content.map(c => c.text || '').join('')
}
```

### 22.4 Двухмодельная архитектура

```js
// src/ai/slideDesigner.js

import { SLIDE_DESIGNER_SYSTEM_PROMPT } from './prompts.js'
import { callClaude } from './client.js'

// Шаг 1: быстрая классификация через Haiku
export async function classifySlide(rawText, userKey) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': userKey || import.meta.env.VITE_ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',  // ← Haiku для классификации
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: `Classify this slide. Output ONLY JSON:
{"type":"cover|stats|three_cards|before_after|table|timeline|two_col|mockup",
 "hasImages":bool,"hasMetrics":bool,"itemCount":number}

Slide text:
"""${rawText}"""`
      }]
    })
  })
  const data = await res.json()
  return JSON.parse(data.content[0].text)
}

// Шаг 2: генерация SVG через Sonnet
export async function generateSlideVariants(rawText, hints, userKey) {
  const userMessage = buildUserPrompt(rawText, hints)

  return callClaude({
    messages: [{ role: 'user', content: userMessage }],
    userKey,
    useCache: true,   // ← кешируем системный промт
  })
}

// Шаг 3: уточнение через Sonnet (multi-turn)
export async function refineSlide(history, instruction, userKey) {
  return callClaude({
    messages: [
      ...history,
      { role: 'user', content: buildRefinePrompt(instruction) }
    ],
    userKey,
    useCache: true,
  })
}
```

### 22.5 Обновлённый промт для Claude Code

```
Обнови src/ai/ согласно §22 ТЗ.

1. client.js:
   - Базовая функция callClaude({ messages, userKey, useCache })
   - model: 'claude-sonnet-4-6' по умолчанию
   - При useCache=true: system prompt как массив с cache_control: ephemeral
   - Заголовок anthropic-beta: 'prompt-caching-2024-07-31'
   - Обработка ошибок: выбрасывать с читаемым сообщением

2. slideDesigner.js:
   - classifySlide(rawText, userKey) → использует claude-haiku-4-5-20251001,
     max_tokens: 300, без кеша системного промта (там нет тяжёлого промта)
   - generateSlideVariants(rawText, hints, userKey) → Sonnet + кеш
   - refineSlide(history, instruction, userKey) → Sonnet + кеш

3. В App.jsx обновить пайплайн:
   - Сначала classifySlide() → показать skeleton-превью с типом слайда
   - Затем generateSlideVariants() → заменить skeleton реальными SVG
   - Пользователь не ждёт вхолостую: видит прогресс двух шагов

4. В SettingsModal показывать примерную стоимость обработки:
   "~$0.25 за презентацию из 20 слайдов (с кешированием)"
```

---

## 23. Адаптивная типографика

### 23.1 Концепция

Вместо жёстких размеров — ступенчатая шкала. Размер выбирается автоматически
по длине текста. Работает и в code-рендерерах (src/layouts/), и передаётся
в системный промт для Claude.

### 23.2 Шкала (typography.js)

```js
// src/design-system/typography.js

export const TYPE_SCALE = {

  // Заголовок слайда (верхняя строка, h2-зона)
  slideTitle: [
    { maxChars: 40,  size: 72, weight: 800, lineHeight: 1.1 }, // «Запуск ТВ сетки»
    { maxChars: 70,  size: 56, weight: 800, lineHeight: 1.1 }, // «Улучшили алгоритмы ранжирования»
    { maxChars: 120, size: 42, weight: 700, lineHeight: 1.15 }, // «Клипы ОК: достижение фича-пэрити ОК х ВК»
    { maxChars: Infinity, size: 36, weight: 700, lineHeight: 1.2 }, // fallback
  ],

  // Заголовок обложки (h1-зона, крупнее)
  coverTitle: [
    { maxChars: 30,  size: 108, weight: 900, lineHeight: 1.05 },
    { maxChars: 55,  size: 80,  weight: 900, lineHeight: 1.05 },
    { maxChars: 80,  size: 64,  weight: 800, lineHeight: 1.1  },
    { maxChars: Infinity, size: 52, weight: 800, lineHeight: 1.15 },
  ],

  // Заголовок карточки (h3-зона)
  cardHeading: [
    { maxChars: 25,  size: 42, weight: 700, lineHeight: 1.2 },
    { maxChars: 45,  size: 32, weight: 700, lineHeight: 1.2 },
    { maxChars: 70,  size: 26, weight: 600, lineHeight: 1.25 },
    { maxChars: Infinity, size: 22, weight: 600, lineHeight: 1.3 },
  ],

  // Тело карточки / описание
  cardBody: [
    { maxChars: 120, size: 27, weight: 400, lineHeight: 1.5 },
    { maxChars: 240, size: 22, weight: 400, lineHeight: 1.5 },
    { maxChars: Infinity, size: 18, weight: 400, lineHeight: 1.5 },
  ],

  // Буллеты в карточке
  bullet: [
    { maxChars: 50,  size: 24, weight: 400, lineHeight: 1.4 },
    { maxChars: Infinity, size: 20, weight: 400, lineHeight: 1.4 },
  ],

  // Фиксированные (не адаптивные)
  fixed: {
    body:        { size: 27, weight: 400, lineHeight: 1.5  },
    caption:     { size: 21, weight: 400, lineHeight: 1.4  },
    metricValue: { size: 96, weight: 800, lineHeight: 1.0  }, // цифра
    metricLabel: { size: 30, weight: 700, lineHeight: 1.0  }, // лейбл под цифрой
    chip:        { size: 22, weight: 600, lineHeight: 1.0  },
  },
}

// Хелпер: выбрать ступень по длине текста
export function pickType(scaleName, text) {
  const steps = TYPE_SCALE[scaleName]
  if (!steps) return TYPE_SCALE.fixed[scaleName] || TYPE_SCALE.fixed.body
  return steps.find(s => text.length <= s.maxChars)
}

// Хелпер для SVG: вернуть font-size и font-weight как атрибуты
export function svgTypeAttrs(scaleName, text) {
  const t = pickType(scaleName, text)
  return `font-size="${t.size}" font-weight="${t.weight}"`
}

// Хелпер: посчитать приблизительное количество строк
// (нужно для расчёта высоты текстового блока в SVG)
export function estimateLines(text, scaleName, containerWidth) {
  const t = pickType(scaleName, text)
  // ~0.55 * size = приблизительная ширина символа Arial
  const charsPerLine = Math.floor(containerWidth / (t.size * 0.55))
  const words = text.split(' ')
  let lines = 1, lineLen = 0
  words.forEach(w => {
    if (lineLen + w.length + 1 > charsPerLine) { lines++; lineLen = w.length }
    else lineLen += w.length + 1
  })
  return { lines, lineHeight: t.lineHeight, totalHeight: lines * t.size * t.lineHeight }
}
```

### 23.3 Использование в code-рендерерах

```js
// src/layouts/Cover.js — пример использования

import { pickType, estimateLines } from '../design-system/typography.js'
import { COLORS, SPACING, SLIDE } from '../design-system/tokens.js'

export function renderCover(data) {
  const { w, h } = SLIDE
  const { title = '', subtitle = '' } = data

  const t = pickType('coverTitle', title)
  const { lines, totalHeight } = estimateLines(title, 'coverTitle', w * 0.58)

  // Разбиваем заголовок на строки вручную
  const titleLines = wrapText(title, t.size, w * 0.58)

  return `
<rect width="${w}" height="${h}" fill="${COLORS.orange}"/>
${titleLines.map((line, i) => `
  <text x="${SPACING.slideH}"
        y="${h * 0.28 + i * t.size * t.lineHeight}"
        font-family="Arial Black, Arial"
        font-size="${t.size}"
        font-weight="${t.weight}"
        fill="${COLORS.textOnOrange}">${esc(line)}</text>
`).join('')}
${subtitle ? `
  <text x="${SPACING.slideH}" y="${h * 0.28 + totalHeight + 32}"
        font-family="Arial" font-size="27" font-weight="400"
        fill="${COLORS.textAccent}">${esc(subtitle)}</text>
` : ''}
  `.trim()
}

// Утилита: разбить текст на строки по ширине контейнера
function wrapText(text, fontSize, maxWidth) {
  const charsPerLine = Math.floor(maxWidth / (fontSize * 0.55))
  const words = text.split(' ')
  const lines = []
  let current = ''
  words.forEach(word => {
    if ((current + ' ' + word).trim().length > charsPerLine) {
      if (current) lines.push(current.trim())
      current = word
    } else {
      current = (current + ' ' + word).trim()
    }
  })
  if (current) lines.push(current.trim())
  return lines
}
```

### 23.4 Таблица адаптации в системный промт Claude

Добавить в конец системного промта из §20.3:

```
## Adaptive typography — mandatory rules

Measure title length (characters including spaces) and pick size:

slideTitle (top of content slides):
  ≤ 40 chars  → font-size="72"  font-weight="800"
  ≤ 70 chars  → font-size="56"  font-weight="800"
  ≤ 120 chars → font-size="42"  font-weight="700"
  > 120 chars → font-size="36"  font-weight="700" (split to 2 lines)

coverTitle (cover slides only):
  ≤ 30 chars  → font-size="108" font-weight="900"
  ≤ 55 chars  → font-size="80"  font-weight="900"
  ≤ 80 chars  → font-size="64"  font-weight="800"
  > 80 chars  → font-size="52"  font-weight="800"

cardHeading (inside cream/dark cards):
  ≤ 25 chars  → font-size="42"  font-weight="700"
  ≤ 45 chars  → font-size="32"  font-weight="700"
  ≤ 70 chars  → font-size="26"  font-weight="600"
  > 70 chars  → font-size="22"  font-weight="600"

cardBody / description text:
  ≤ 120 chars → font-size="27"
  ≤ 240 chars → font-size="22"
  > 240 chars → font-size="18"

bullets: font-size="24" if bullet ≤ 50 chars, else font-size="20"

NEVER scale metric values (always font-size="96")
NEVER scale chip/tag labels (always font-size="22")

Line wrapping: estimate ~0.55 × font-size px per character (Arial).
Calculate chars per line = floor(containerWidth / (fontSize × 0.55)).
Break title into multiple <text> elements with dy="1.2em" spacing.
If text still overflows after size reduction → truncate with «…»
```

### 23.5 Промт для Claude Code

```
Обнови типографику в OK Slide Redesigner согласно §23 ТЗ.

1. Создай src/design-system/typography.js с TYPE_SCALE из §23.2
   Экспортировать: TYPE_SCALE, pickType, svgTypeAttrs, estimateLines

2. Добавь утилиту wrapText(text, fontSize, maxWidth) → string[]
   в src/design-system/typography.js или src/utils/text.js

3. Обнови все рендереры в src/layouts/ — заменить хардкод размеров
   на вызовы pickType() + wrapText():
   - Cover.js     → coverTitle
   - Stats.js     → slideTitle для заголовка, fixed.metricValue для цифр
   - ThreeCards.js → slideTitle + cardHeading + bullet
   - BeforeAfter.js → slideTitle + cardBody
   - Table.js     → slideTitle + cardBody
   - Timeline.js  → slideTitle + cardBody

4. В системный промт slideDesigner.js добавить секцию
   «Adaptive typography» из §23.4 — вставить перед «## Output format»

5. Написать тест: renderCover({ title: 'Короткий' }) и
   renderCover({ title: 'Очень длинный заголовок который не влезает...' })
   — убедиться что font-size разный, текст не вылезает за 1920px
```
