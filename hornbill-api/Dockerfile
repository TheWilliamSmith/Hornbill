FROM node:24-alpine AS base 

WORKDIR /app

RUN npm install -g pnpm@10

RUN addgroup -S hornbill && adduser -S hornbill -G hornbill

FROM base AS dependencies

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

FROM base AS build

COPY --from=dependencies /app/node_modules ./node_modules

COPY src/ ./src
COPY prisma/ ./prisma
COPY docker/ ./docker
COPY tsconfig.json ./   
COPY tsconfig.build.json ./
COPY package.json ./
COPY prisma.config.ts ./

RUN pnpm prisma generate
RUN pnpm run build

FROM base AS production

COPY --from=build --chown=hornbill:hornbill /app/dist ./dist
COPY --from=dependencies --chown=hornbill:hornbill /app/node_modules ./node_modules
COPY --from=build --chown=hornbill:hornbill /app/docker/ ./docker
COPY --from=build --chown=hornbill:hornbill /app/package.json ./  
COPY --from=build --chown=hornbill:hornbill /app/prisma.config.ts ./
COPY --from=build --chown=hornbill:hornbill /app/prisma/ ./prisma  

EXPOSE 3000

RUN chmod +x ./docker/entrypoint.sh

USER hornbill

ENTRYPOINT [ "./docker/entrypoint.sh"]