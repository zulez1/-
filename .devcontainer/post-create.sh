#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

echo "==> Включаем pnpm через corepack"
corepack enable
corepack prepare pnpm@10 --activate

echo "==> Устанавливаем зависимости"
pnpm install

echo "==> Готовим .env файлы"
[ -f apps/api/.env ] || cp apps/api/.env.example apps/api/.env
[ -f apps/web/.env.local ] || cp apps/web/.env.example apps/web/.env.local

# В Codespaces БД доступна по хосту "db" (сервис из .devcontainer/docker-compose.yml),
# а не "localhost" как при локальном запуске.
sed -i 's#postgresql://sem:sem@localhost:5432/sem#postgresql://sem:sem@db:5432/sem#' apps/api/.env

# В Codespaces фронтенд и API открываются через разные проброшенные домены
# (https://<codespace>-3000.<domain> и https://<codespace>-4000.<domain>),
# а не через localhost — подставляем реальные адреса, если это Codespaces.
if [ -n "${CODESPACE_NAME:-}" ]; then
  DOMAIN="${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN:-app.github.dev}"
  API_URL="https://${CODESPACE_NAME}-4000.${DOMAIN}"
  WEB_URL="https://${CODESPACE_NAME}-3000.${DOMAIN}"
  sed -i "s#^NEXT_PUBLIC_API_URL=.*#NEXT_PUBLIC_API_URL=\"${API_URL}/api\"#" apps/web/.env.local
  sed -i "s#^WEB_ORIGIN=.*#WEB_ORIGIN=\"${WEB_URL}\"#" apps/api/.env
  echo "    Codespaces обнаружен: API_URL=${API_URL}, WEB_ORIGIN=${WEB_URL}"
  echo "    Порт 4000 должен быть публичным (или ты авторизован в том же браузере) — иначе веб не достучится до API."
fi

echo "==> Ждём базу данных"
until (exec 3<>/dev/tcp/db/5432) 2>/dev/null; do
  sleep 1
done

echo "==> Применяем миграции"
pnpm --filter @sem/api exec prisma migrate deploy

echo "==> Заполняем демо-данными"
pnpm --filter @sem/api run seed

echo "==> Готово. В двух терминалах запусти:"
echo "    pnpm dev:api"
echo "    pnpm dev:web"
