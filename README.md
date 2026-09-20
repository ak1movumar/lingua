# Lingua

Приложение для изучения языков: курсы, уроки, прогресс, достижения, друзья и чаты. Администраторы управляют учебными материалами и пользователями через `/admin`.

## Запуск

Нужны Node.js 22+ и npm.

```sh
npm ci
```

Скопируйте `.env.example` в `.env.local`, укажите `NEXT_PUBLIC_API_URL` и запустите:

```sh
npm run dev
```

Приложение доступно на http://localhost:3000. Этот адрес должен быть разрешён в CORS бэкенда.

## Команды

| Команда                | Назначение                                                       |
| ---------------------- | ---------------------------------------------------------------- |
| `npm run dev`          | Локальный сервер                                                 |
| `npm run build`        | Production-сборка                                                |
| `npm start`            | Запуск собранного приложения                                     |
| `npm run check`        | Типы, линтер, форматирование, тесты, переводы, контраст и сборка |
| `npm run format`       | Форматирование исходников                                        |
| `npm run api:generate` | Обновление API-типов и полей админки из `docs/openapi.json`      |

## Структура

```text
src/
  app/                  Маршруты и layouts Next.js
  components/
    ui/                 Кнопки, поля, диалоги и общие стили
    layout/             Оболочка и навигация
    design-system/      Витрина компонентов
  features/
    account/            Профиль, настройки и уведомления
    admin/              Управление ресурсами
      course-import/    Материалы и импорт курса для начинающих
    auth/               Авторизация и сессия
    chats/              Переписка, участники и реакции
    courses/            Каталог и страница курса
    landing/            Главная страница
    learning/           Учебная панель и общая навигация
    lessons/            Упражнения и прохождение уроков
    progress/           Прогресс и статистика
    rewards/            Достижения, задания дня и рейтинг
    social/             Пользователи, друзья и заявки
  services/api/         HTTP-клиент и обновление токенов
  i18n/                 Переводы RU/KY/EN
  providers/            Контексты запросов, языка и темы
  hooks/                Общие React-хуки
  lib/                  Вспомогательные функции
  constants/            Ключи запросов
  styles/               Темы, переменные и глобальные стили
  types/                Сгенерированные API-типы
tests/                  Тесты контрактов и логики
scripts/                Генерация схем и проверки оформления
docs/                   Контракт API и технические заметки
```

Стек: Next.js App Router, React, TypeScript, SCSS Modules, TanStack Query, Axios, React Hook Form и Zod.

## Разделы

- Обучение: `/dashboard`, `/courses`, `/courses/[id]`, `/lessons/[id]`, `/progress`.
- Общение: `/community`, `/friends`, `/users/[id]`, `/chats`, `/chats/[id]`.
- Аккаунт: `/profile`, `/settings`.
- Награды: `/achievements`, `/challenges`, `/leaderboard`.
- Управление: `/admin`. Импорт подготовленного курса: `/admin/import`.
- Публичные примеры: `/exercise-preview`, `/design-system`.

## Документация

- [Архитектура](docs/architecture.md)
- [Интеграция с бэкендом и ограничения](docs/backend.md)
- [Администрирование](docs/administration.md)

Для HTTPS-развёртывания нужен HTTPS-адрес API. Автоматические проверки не заменяют проверку интерфейса в браузере и прохождение уроков с тестовым аккаунтом.
