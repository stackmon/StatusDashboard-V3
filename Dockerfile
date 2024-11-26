FROM node:lts-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app
COPY . .

RUN pnpm install --frozen-lockfile
RUN apk add --no-cache nginx

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD [ "cd /app && pnpm run build && nginx -g 'daemon off;'" ]
