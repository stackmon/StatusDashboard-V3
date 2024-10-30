FROM node:lts-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS prod

COPY pnpm-lock.yaml /app
WORKDIR /app
RUN pnpm fetch

COPY . /app
RUN pnpm run build

FROM steebchen/nginx-spa:stable
COPY --from=prod /app/dist/ /app
EXPOSE 80
CMD [ "nginx" ]
