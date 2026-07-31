# Як вносити зміни

Документ описує, як налаштувати середовище, як влаштований процес і — головне —
у якому порядку додавати код, щоб він лягав у наявні шари, а не поруч із ними.

Чому проєкт влаштований саме так — у [`DESIGN.md`](DESIGN.md).
Що саме віддає API — у [`docs/API.md`](docs/API.md).

## Зміст

- [Налаштування середовища](#налаштування-середовища)
- [Щоденна робота](#щоденна-робота)
- [Гілки та коміти](#гілки-та-коміти)
- [Перед pull request](#перед-pull-request)
- [Як додати ендпоінт](#як-додати-ендпоінт)
- [Як додати спільний тип](#як-додати-спільний-тип)
- [Як додати аліас шляху](#як-додати-аліас-шляху)
- [Тести](#тести)
- [Стиль коду](#стиль-коду)

---

## Налаштування середовища

Потрібні **Node 24** і доступ до MongoDB (локальна або Atlas).

```bash
git clone https://github.com/Vybyranyi/FocusPath_app.git
cd FocusPath_app
cp .env.example .env      # заповнити MONGO_URI, JWT_SECRET, OPENAI_API_KEY
npm install               # залежності кореня
npm run install:all       # залежності frontend і server
npm run dev
```

`.env` **один на весь репозиторій** і лежить у корені. Vite читає його через
`envDir`, сервер — через явний `dotenv.config()` у `src/server.ts`. Другий
`.env` усередині пакета створювати не треба: він або не спрацює, або мовчки
розійдеться з кореневим.

Мінімум для запуску — `MONGO_URI` і `JWT_SECRET`. Без `OPENAI_API_KEY` працює
все, крім генерації звички через AI.

Тестам БД не потрібна взагалі: серверний сьют піднімає MongoDB у пам'яті на
кожен прогін.

---

## Щоденна робота

Усе з кореня:

| Команда | Що робить |
| --- | --- |
| `npm run dev` | Фронтенд (5173) і сервер (3000) одночасно |
| `npm run lint` | ESLint обох пакетів |
| `npm run typecheck` | `tsc` обох пакетів |
| `npm test` | Обидва тест-сьюти |
| `npm run build` | Прод-збірка обох пакетів |

Один пакет — через `--prefix`:

```bash
npm --prefix server run test
npm --prefix frontend run test:watch
npm --prefix server exec jest -- src/services/habitSchedule.test.ts
```

Створити адміністративний акаунт із `ADMIN_EMAIL` / `ADMIN_PASSWORD`:

```bash
npm --prefix server run seed:admin
```

---

## Гілки та коміти

Працюємо в гілках від `main`, прямі пуші в `main` не робимо.

```
feat/<коротка-назва>     нова функціональність
fix/<коротка-назва>      виправлення
refactor/<коротка-назва> зміна без зміни поведінки
docs/<коротка-назва>     документація
chore/<коротка-назва>    інфраструктура, залежності, конфіги
```

**Стиль повідомлень комітів** у цьому репозиторії — наказовий спосіб, з великої
літери, без префіксів Conventional Commits. Тема описує результат, а не процес:

```
Extract a service layer and fix two defects it exposed
Move sessions into httpOnly cookies with real rotation and CSRF
```

Якщо зміна неочевидна, тіло коміту має пояснити **чому**, а не переказати diff.

---

## Перед pull request

Три команди — рівно те, що прожене CI:

```bash
npm run lint && npm run typecheck && npm test
```

Далі:

- Додати або оновити тести на змінену поведінку.
- Записати зміну в [`CHANGELOG.md`](CHANGELOG.md), секція `[Unreleased]`.
- Якщо змінився контракт API — оновити [`docs/API.md`](docs/API.md).
- Якщо змінилася форма даних між клієнтом і сервером — оновити `shared/src/`.
- Якщо з'явилася нова змінна оточення — додати її в `.env.example` **і** в
  таблицю в [`README.md`](README.md).

Шаблон PR заповнюється автоматично і містить цей чекліст.

---

## Як додати ендпоінт

Порядок важливий: кожен наступний крок спирається на попередній, і саме в цьому
порядку написаний увесь наявний код.

### 1. Схема в `server/src/validation/`

Схема — єдине джерело правди. Тип DTO виводиться з неї, а не пишеться руками:

```ts
export const archiveHabitSchema = z.object({
    reason: z.string().trim().max(200).optional(),
});
export type ArchiveHabitDto = z.infer<typeof archiveHabitSchema>;
```

Вимога `z.string()` — це не формальність: об'єкт-оператор на кшталт
`{"$ne": null}` не пройде перевірку типу і не дістанеться до запиту.

### 2. Метод сервісу в `server/src/services/`

Тут живе бізнес-логіка **і перевірка власника**. Для звичок є готовий
`requireOwnedHabit` — користуйтеся ним, а не власним `findOne`:

```ts
export const archiveHabit = async (
    userId: string,
    habitId: string,
    { reason }: ArchiveHabitDto,
): Promise<IHabit> => {
    const habit = await requireOwnedHabit(userId, habitId);
    // ...
    return habit.save();
};
```

Помилки — це `throw` відповідного класу з `@errors/AppError`
(`NotFoundError`, `ConflictError`, `BadRequestError`, …). Ловити їх тут не
треба.

### 3. Контролер у `server/src/controllers/`

Тонкий: дістати `userId`, викликати сервіс, повернути `ok` або `created`.
Жодного `try/catch` — Express 5 сам передає відхилений проміс в обробник:

```ts
export const archiveHabit = async (
    req: TypedRequest<ArchiveHabitDto, HabitParams>,
    res: Response,
) => ok(res, { habit: await habitService.archiveHabit(requireUserId(req), req.params.id, req.body) });
```

Ніколи не викликайте `res.json` напряму: конверт формують тільки `ok` /
`created`.

### 4. Маршрут у `server/src/routes/`

```ts
router.patch(
    '/:id/archive',
    verifyTokenMiddleware,
    validate({ params: habitParamsSchema, body: archiveHabitSchema }),
    archiveHabit,
);
```

`validate` коерсить `body` і `params`, тому в контролер дати приходять уже як
`Date`. **`query` перевіряється, але не переписується** — Express 5 мовчки
відкидає присвоєння в `req.query`, тому хендлер читає рядок сам і розбирає його
(див. `getHabitsForDate`).

### 5. Тест поруч із кодом

Файл `*.test.ts` у тій самій теці. Чисту логіку тестуємо напряму, ендпоінти —
через `supertest` проти `app`.

### 6. Документація

Рядок у [`docs/API.md`](docs/API.md), і — якщо форма відповіді нова — тип у
`shared/src/`.

---

## Як додати спільний тип

`shared/` містить **тільки `.d.ts`**. Це обмеження навмисне: файли декларацій
не можуть містити рантайм-коду і ніколи не компілюються, тому жоден із пакетів
не отримує ні кроку збірки, ні залежності під час виконання.

1. Опишіть тип у відповідному файлі (`habit.d.ts`, `user.d.ts`, `api.d.ts`) або
   створіть новий.
2. Реекспортуйте його з `shared/src/index.d.ts`.
3. Використовуйте через `import type { X } from '@shared/index'` в обох пакетах.

**Спільній константі тут не місце.** Якщо потрібне спільне *значення*, воно має
жити в одному з пакетів.

Серверні моделі виводять свої інтерфейси зі спільних типів через `Omit`,
перевизначаючи лише те, що справді відрізняється в сховищі (дати як `Date`,
ідентифікатори як `ObjectId`, поля, яких у відповіді не буває). Так контракт і
сховище не можуть тихо розійтися — тримайтеся цього підходу.

---

## Як додати аліас шляху

Аліаси оголошені окремо для компілятора, тестового раннера і збирача. Додати
новий треба **в усі відповідні місця одразу**, інакше щось одне зламається:

| Пакет | Файли |
| --- | --- |
| server | `tsconfig.json` → `paths`, `jest.config.ts` → `moduleNameMapper` |
| frontend | `tsconfig.app.json` → `paths`, `vite.config.ts` → `resolve.alias` |

Серверна збірка ще проганяє `tsc-alias` (`npm run build` — це
`tsc && tsc-alias`), бо сам `tsc` лишає аліаси в згенерованому JS.

---

## Тести

### Сервер — Jest + supertest + mongodb-memory-server

- `jest.env.ts` (`setupFiles`) виставляє оточення **до** імпорту будь-якого
  модуля: кілька модулів читають `process.env` на етапі імпорту і інакше
  тримали б `undefined`.
- `jest.setup.ts` піднімає MongoDB у пам'яті на прогін і чистить усі колекції
  після кожного тесту.
- `BCRYPT_ROUNDS=4` у тестах — найдешевше, що приймає bcrypt. У production 12.
- Лімітери частоти під тестами вимкнені: сьют логіниться значно частіше за
  будь-якого реального клієнта, і з ними тест міряв би лімітер.
- Перший прогін завантажує бінарник `mongod` (~100 МБ) і тому довгий. Далі він
  кешується.

### Фронтенд — Vitest + Testing Library + jsdom

- `npm --prefix frontend test` не watch-режим. Для watch — `test:watch`.
- Стор для тесту будується через `makeStore(preloadedState)` — свіжий на кожен
  випадок, тому стан не протікає між ними. Хелпери в `src/testUtils.tsx`.

---

## Стиль коду

**Відступи різні в різних пакетах, і це навмисно:** 4 пробіли в `server/src`,
2 у `frontend/src`. Це зафіксовано в `.editorconfig` — просто дотримуйтеся
файлу, який редагуєте.

Форматера в проєкті немає. Prettier не додаємо свідомо: він переформатував би
весь наявний код і перетворив би будь-який PR на нечитабельний diff.

**Коментарі пояснюють «чому», а не «що».** Наявні коментарі — зразок: вони
фіксують міркування або збій, який призвів до цього рішення. Коментар, що
переказує наступний рядок, у review не пройде.

Приклад того, що потрібно:

```ts
// Deployments sit behind a single proxy. Without this every client would appear
// to the rate limiters as the proxy's address and be throttled as one visitor.
app.set("trust proxy", 1);
```

Коментарі в коді — англійською (виняток: наявні українські коментарі в
`habitRouter.ts`, їх лишаємо як є). Документація для людей — українською.
