# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS build
COPY . .
RUN npm run build

FROM node:22-alpine AS api
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/src/db/migrate.ts ./apps/api/src/db/migrate.ts
EXPOSE 3001
CMD ["node", "apps/api/dist/index.js"]

FROM node:22-alpine AS web
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=build /app/apps/web/.next ./apps/web/.next
COPY --from=build /app/apps/web/public ./apps/web/public
COPY --from=build /app/apps/web/next.config.ts ./apps/web/next.config.ts
COPY --from=build /app/apps/web/package.json ./apps/web/package.json
EXPOSE 3000
CMD ["npm", "run", "start:web"]
