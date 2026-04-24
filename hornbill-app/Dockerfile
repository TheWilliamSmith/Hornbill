FROM node:22-alpine AS base

WORKDIR /app

RUN apk update && apk add --no-cache git curl

RUN addgroup -S hornbill && adduser -S hornbill -G hornbill

RUN npm install -g pnpm

FROM base AS dependencies

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm install --frozen-lockfile

FROM base AS build

ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL

COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/package.json ./
COPY --from=dependencies /app/pnpm-lock.yaml ./

COPY src ./src
COPY public ./public
COPY tsconfig.json ./
COPY next.config.ts ./
COPY postcss.config.mjs ./

RUN pnpm run build

FROM base AS production

COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public

RUN chown -R hornbill:hornbill /app

ENV NODE_ENV=production

HEALTHCHECK --interval=10s --timeout=5s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

EXPOSE 3000

USER hornbill

CMD ["node", "server.js"]