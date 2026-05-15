FROM node:20-alpine AS build
WORKDIR /repo
COPY package.json package-lock.json* ./
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/
RUN npm install
COPY tsconfig.base.json ./
COPY apps/web ./apps/web
COPY packages/shared ./packages/shared
RUN npm run build -w @visitrip/web

FROM nginx:1.27-alpine
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /repo/apps/web/dist /usr/share/nginx/html
EXPOSE 80
