# unn_bet_frontend

Фронтенд покерной платформы UnnBet (Next.js, React, TypeScript, Zustand).

Репозиторий: [gitlab.com/unn-bet/unn_bet_frontend](https://gitlab.com/unn-bet/unn_bet_frontend)

---

## Как устроен prod

Браузер ходит на один домен **https://unn-bet.ru** (также `www.unn-bet.ru`, legacy `play.unn-bet.ru`):

| Путь | Куда попадает (Ingress) |
|------|-------------------------|
| `/` | `frontend-service` (Next.js, образ `poker-ui`) |
| `/api/*` | `gateway-service` → микросервисы бэкенда |
| `/ws/*` | `gateway-service` (SSE игры: `/api/game/stream/...`) |

На prod **`NEXT_PUBLIC_API_URL` не задан** — запросы идут на тот же origin (`/api/...`), без CORS-проблем.

Test-контур: **https://test.unn-bet.ru** — та же схема, namespace `integration-test`.

---

## Инфраструктура (для фронтенд-разработчика)

### Окружения

| | Production | Integration test |
|---|------------|------------------|
| URL | https://unn-bet.ru | https://test.unn-bet.ru |
| K8s namespace | `default` | `integration-test` |
| Образ | `cr.yandex/.../poker-ui:$SHA` | тот же tag после CI |

Бэкенд, PostgreSQL, Redis, Kafka — managed Yandex Cloud. Детали — в README репозитория **unn_bet_backend**.

### Что важно знать при разработке UI

1. **Авторизация** — JWT в `localStorage`, заголовок `Authorization: Bearer ...` (см. `src/lib/api.ts`).

2. **Логин** — пароль шифруется RSA (публичный ключ с `/api/auth/public-key`). На бэке ключ in-memory; в prod один pod auth — см. backend README.

3. **Лобби** — список обновляется polling каждые **5 сек** (`src/app/lobby/page.tsx`).

4. **Стол** — состояние комнаты приходит по **SSE** (`connectSSE` в `src/store/useStore.ts`). После `takeSeat` UI ждёт SSE, а не только ответ REST.

5. **Ingress** — для SSE включены длинные таймауты и `proxy-buffering: off` (`k8s/ingress.yaml`).

---

## Локальная разработка

### Требования

- Node.js 20+
- npm

### Установка и запуск

```bash
npm install
npm run dev
```

Приложение: http://localhost:3000

### API локально

По умолчанию в dev (`src/lib/api.ts`):

```text
NEXT_PUBLIC_API_URL=http://26.159.210.30:8080
```

Для своего gateway:

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8080
```

Убедитесь, что gateway и нужные сервисы бэкенда запущены (см. backend `docker-compose.yml`).

### Тесты

```bash
npm run test          # Vitest (unit)
npx vitest run        # как в CI: unit-tests
npm run test          # coverage job (allow_failure в CI)
```

---

## Kubernetes (`k8s/`)

| Файл | Назначение |
|------|------------|
| `deployment.yaml` | Deployment `frontend-service`, образ `poker-ui` |
| `service.yaml` | ClusterIP :80 |
| `ingress.yaml` | Маршруты `/`, `/api`, `/ws` на prod-домене |

CI в `deploy-prod` подставляет registry id и `$CI_COMMIT_SHA` в `deployment.yaml`.

Изменения **только UI/логики** — код в `src/`.  
Изменения **деплоя, ingress, replicas** — `k8s/`.

---

## CI/CD (GitLab)

Пайплайн в `.gitlab-ci.yml`. Запуск на **`main`** (docker-push также на тегах `v*`).

### Стадии

```
build → test → docker-push → deploy-prod → integration-test
```

| Job | Описание |
|-----|----------|
| `build-nextjs` | `npm install && npm run build` |
| `unit-tests` | `npx vitest run` |
| `coverage` | `npm run test` (не блокирует, `allow_failure`) |
| `build-and-push-docker` | Образ `poker-ui:$CI_COMMIT_SHA` |
| `deploy-prod` | Деплой в `default` |
| `deploy-integration-test` | Обновление frontend в `integration-test` |
| `trigger-integration-tests` | Запуск E2E в `unn_bet_integration_test` |

### Workflow для разработчика

1. Ветка → MR → review.
2. Merge в **`main`** → автоматический деплой на prod и test + интеграционные тесты.
3. Если упал **`trigger-integration-tests`** — открыть downstream pipeline в [unn_bet_integration_test](https://gitlab.com/unn-bet/unn_bet_integration_test/-/pipelines) и отчёт Playwright.
4. Feature branches **не деплоятся** — проверяйте локально + unit tests.

### Если сломался только фронт на prod

- GitLab → последний pipeline → job `deploy-prod` / `build-nextjs`
- Браузер → DevTools → Network (`/api/...`)
- Логи бэкенда не помогут с чисто UI-багом; для API-ошибок смотрите gateway/lobby в Yandex Logging (`stream_name = "gateway-service"`)

---

## Интеграционные тесты

E2E живут в отдельном репо **[unn_bet_integration_test](https://gitlab.com/unn-bet/unn_bet_integration_test)**.

После вашего merge в `main`:

1. Образ фронта обновляется на test-контуре.
2. Playwright прогоняется против https://test.unn-bet.ru.
3. Тестовые пользователи `it_*` удаляются из `unn_bet_test`.

Локальный прогон E2E (нужен поднятый test-контур):

```bash
cd ../unn_bet_integration_tests
npm ci
npm test
```

---

## Структура проекта (кратко)

```
src/
  app/           # Next.js App Router (login, lobby, profile, table)
  components/    # UI-компоненты
  store/         # Zustand (auth, lobby, table, SSE)
  lib/           # api.ts, crypto.ts
k8s/             # Kubernetes prod
```

---

## Чеклист перед merge в `main`

- [ ] `npm run build` без ошибок
- [ ] `npx vitest run`
- [ ] Проверка против локального или test API при изменении контрактов
- [ ] Нет секретов в коде / `.env` в git

---

## Связанные репозитории

| Репозиторий | Роль |
|-------------|------|
| [unn_bet_backend](https://gitlab.com/unn-bet/unn_bet_backend) | API, gateway, game/lobby |
| [unn_bet_integration_test](https://gitlab.com/unn-bet/unn_bet_integration_test) | Playwright E2E |
