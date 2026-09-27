# Собирает и запускает API целиком внутри контейнера — для локального
# запуска через docker-compose.full.yml без установки Node/pnpm на хосте.
FROM node:22-bookworm-slim

RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace
# Версия pnpm приходит из "packageManager" в корневом package.json —
# corepack сам скачает и активирует ровно её при первом вызове pnpm.
RUN corepack enable

# Placeholder — реальный DATABASE_URL приходит из docker-compose при запуске.
# Нужен только чтобы `prisma generate` на этапе сборки не споткнулся об
# отсутствие переменной.
ENV DATABASE_URL="postgresql://sem:sem@localhost:5432/sem?schema=public"

COPY . .

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @sem/api exec prisma generate
RUN pnpm --filter @sem/api build

EXPOSE 4000

RUN chmod +x apps/api/docker-entrypoint.sh
CMD ["apps/api/docker-entrypoint.sh"]
