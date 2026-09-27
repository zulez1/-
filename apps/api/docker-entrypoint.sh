#!/bin/sh
set -e

echo "Ждём базу данных (db:5432)..."
until node -e "require('net').connect(5432,'db').on('connect',function(){this.end();process.exit(0)}).on('error',function(){process.exit(1)})" >/dev/null 2>&1; do
  sleep 1
done
echo "База доступна."

echo "Применяем миграции..."
pnpm --filter @sem/api exec prisma migrate deploy

echo "Заполняем демо-данными (безопасно повторно — использует upsert)..."
pnpm --filter @sem/api run prisma:seed

echo "Запускаем API..."
exec pnpm --filter @sem/api start
