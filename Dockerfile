FROM node:lts-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS prod

RUN mkdir -p /app
COPY pnpm-lock.yaml /app
WORKDIR /app
RUN pnpm fetch

COPY . /app
RUN pnpm run build

FROM nginx:stable-alpine

RUN sed -i '1idaemon off;' /etc/nginx/nginx.conf

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=prod /app/dist/ /app

EXPOSE 80

CMD [ "nginx" ]