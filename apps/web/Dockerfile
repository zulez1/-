# Собирает и запускает веб целиком внутри контейнера — для локального
# запуска через docker-compose.full.yml без установки Node/pnpm на хосте.
FROM node:22-bookworm-slim

WORKDIR /workspace
# Версия pnpm приходит из "packageManager" в корневом package.json —
# corepack сам скачает и активирует ровно её при первом вызове pnpm.
RUN corepack enable

# NEXT_PUBLIC_* переменные Next.js встраивает в бандл на этапе сборки,
# поэтому они приходят как build-args, а не обычные env в рантайме.
ARG NEXT_PUBLIC_API_URL="http://localhost:4000/api"
ARG NEXT_PUBLIC_YANDEX_MAPS_API_KEY=""
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_YANDEX_MAPS_API_KEY=$NEXT_PUBLIC_YANDEX_MAPS_API_KEY

COPY . .

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @sem/web build

EXPOSE 3000

CMD ["pnpm", "--filter", "@sem/web", "exec", "next", "start", "-H", "0.0.0.0", "-p", "3000"]
