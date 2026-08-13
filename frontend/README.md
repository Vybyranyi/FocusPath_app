# FocusPath — клієнт

React 19 + Vite 7 + TypeScript. Загальний опис проєкту — у
[кореневому README](../README.md), архітектура — у [`DESIGN.md`](../DESIGN.md).

## Запуск

Зазвичай клієнт піднімають разом із сервером із кореня (`npm run dev`). Окремо:

```bash
npm install
npm run dev        # http://localhost:5173
```

Змінні оточення читаються з **кореневого** `.env` через `envDir` у
`vite.config.ts`. Свій `.env` у цій теці створювати не треба. Клієнту потрібна
одна змінна — `VITE_API_URL`.

## Команди

| Команда | Що робить |
| --- | --- |
| `npm run dev` | Dev-сервер із HMR |
| `npm run build` | `tsc -b` і збірка Vite у `dist/` |
| `npm run preview` | Локальний перегляд зібраного `dist/` |
| `npm run typecheck` | Перевірка типів без збірки |
| `npm run lint` | ESLint |
| `npm test` | Vitest один раз (не watch) |
| `npm run test:watch` | Vitest у watch-режимі |
| `npm run test:coverage` | Vitest із покриттям |

## Структура

```
src/
├── api/client.ts     єдиний мережевий шар
├── store/            зрізи Redux, селектори, типізовані хуки
├── pages/            екрани: Login, Register, Main, CreateHabit, Stats, Profile
├── components/
│   ├── ui/           Button, Input, Select, Switch, SegmentControl, …
│   ├── layout/       Layout, Header, AppBar, ProtectedRoute, WeekSelector
│   ├── habit/        HabitCard, ProgressBanner, HabitDetailPopup, лоадери
│   ├── pickers/      дата, тиждень, тривалість, колір, емодзі, тип звички
│   ├── profile/      картки профілю, зміна пароля, аватар
│   └── stats/        зведення й рядки статистики
├── lib/              чисті хелпери (habitProgress, utils)
├── hooks/            useResponsiveHeader
├── animation/        AILoadingAnimation
├── types/            типи форм і UI
└── __tests__/        тести
```

## Мережевий шар

Усі запити йдуть через `apiRequest` з `@api/client`. Робити `fetch` напряму з
компонента чи thunk'а не треба — це обійде все, що клієнт робить сам:

- **розгортає конверт** відповіді, тому виклик отримує `data` напряму;
- **зводить усі способи впасти** до одного `ApiError` з полями `code`,
  `status` і `details` — мережевий збій, нечитабельна відповідь і помилка
  сервера обробляються однаково;
- **надсилає cookie** (`credentials: 'include'`) і додає заголовок
  `X-CSRF-Token` для методів, що змінюють стан;
- **оновлює сесію при 401** і повторює запит рівно один раз. Усі одночасні
  оновлення чекають на один спільний `refreshInFlight`: сервер ротує
  refresh-токен при кожному використанні, тож дві паралельні спроби лишили б
  переможеного зі вже витраченим токеном.

Для тексту, який показують користувачу, є `errorMessage(error)`.

## Стан

Три зрізи Redux Toolkit: `auth`, `habit`, `calendar`.

Похідні значення живуть у `store/selectors.ts` і йдуть через `createSelector` —
рахуються раз на зміну, а не на кожен рендер кожного підписника. Прості
селектори полів навмисно **не** мемоїзовані: вони повертають шматок стану як є.

Сесія на клієнті не зберігається. На старті `App` питає `GET /auth/me` — cookie
браузер надішле сам. Відмова для гостя тут нормальний шлях, а не збій.

Гостя при цьому впізнають ще до запиту: `hasSessionCookie()` з `@api/client`
перевіряє CSRF-cookie — єдину з трьох, читабельну для JS, з тим самим строком
життя, що й refresh-токен. Назви дві: у продакшені сервер видає її з префіксом
`__Host-`, тому клієнт пробує `__Host-csrf_token`, а потім `csrf_token`. Немає її — немає сесії, тож ні `/auth/me`,
ні автоматичне оновлення сесії не викликаються. Інакше кожен гість отримував би
дві червоні помилки в консолі, які браузер пише на будь-яку 4xx.

## Стилі

Tailwind 4 через `@tailwindcss/vite`. Токени дизайну (кольори, шрифт
Montserrat) оголошені в `src/index.css` у блоці `@theme`. Окремого
`tailwind.config` немає — конфігурація живе в CSS.

## Тести

Vitest + Testing Library + jsdom. Хелпери в `src/testUtils.tsx`:

- `renderWithProviders(ui, { preloadedState, route })` — рендерить із Redux і
  роутером; стор будується на кожен виклик, тому стан не протікає між тестами.
  Повертає стор разом зі звичайним результатом RTL.
- `makeHabitSummary(overrides)` — фікстура звички у формі `GET /habits/daily`.
  Перевизначайте лише ті поля, про які тест справді міркує.
- `habitState(overrides)` — готовий стан зрізу звичок.

```bash
npm test                                   # усе один раз
npm run test:watch                         # watch
npm test -- src/__tests__/Button.test.tsx  # один файл
```

## Аліаси

`@`, `@assets`, `@components`, `@pages`, `@store`, `@hooks`, `@animation`,
`@api`, `@shared`.

Оголошені **двічі** — у `tsconfig.app.json` (`paths`) для компілятора і в
`vite.config.ts` (`resolve.alias`) для збирача та Vitest. Новий аліас треба
додати в обидва місця, інакше зламається або перевірка типів, або збірка.

## Особливість збірки

У `tsconfig.app.json` увімкнено `erasableSyntaxOnly` — дозволений лише той
TypeScript, який зникає без сліду при компіляції. Тому, зокрема, не можна
використовувати constructor parameter properties: клас `ApiError` оголошує й
присвоює поля окремо саме через це.
