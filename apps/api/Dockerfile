FROM node:20-alpine AS build
WORKDIR /repo
COPY package.json package-lock.json* ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/
COPY packages/db/package.json ./packages/db/
RUN npm install
COPY tsconfig.base.json ./
COPY apps/api ./apps/api
COPY packages/shared ./packages/shared
COPY packages/db ./packages/db
RUN npm run build -w @visitrip/api

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /repo/apps/api/dist ./dist
EXPOSE 3001
CMD ["node", "dist/index.js"]
