FROM node:lts-alpine AS base


ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS prod

WORKDIR /app
COPY . .

RUN pnpm install --frozen-lockfile

RUN --mount=type=secret,id=SD_BACKEND_URL,env=SD_BACKEND_URL \
    --mount=type=secret,id=SD_CLIENT_ID,env=SD_CLIENT_ID \
    --mount=type=secret,id=SD_AUTHORITY_URL,env=SD_AUTHORITY_URL \
    --mount=type=secret,id=SD_REDIRECT_URL,env=SD_REDIRECT_URL \
    --mount=type=secret,id=SD_LOGOUT_REDIRECT_URL,env=SD_LOGOUT_REDIRECT_URL \
    --mount=type=secret,id=SD_AUTH_SECRET,env=SD_AUTH_SECRET \
    pnpm run build

FROM nginx:stable-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=prod /app/dist/ /app

EXPOSE 80

CMD [ "nginx" ]
