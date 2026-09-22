FROM nginx:stable-alpine

ARG SD3_FRONT_ORIGINS="status-dashboard-test.obs-website.eu-de.otc.t-systems.com"

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/generate-origin-conf.sh /usr/local/bin/generate-origin-conf.sh

# nginx -t resolves the endpoints, so an unresolvable one fails the build instead of the pod.
RUN sh /usr/local/bin/generate-origin-conf.sh "$SD3_FRONT_ORIGINS" /etc/nginx/sd3-origins.conf \
    && nginx -t

EXPOSE 80
