# Frozen shim: the image carries no site content, it only fronts the OBS static website buckets so
# the CCE objects keep their current shape.
FROM nginx:stable-alpine

# Website endpoints to fall back through, primary first, comma separated. Defaults to the test
# bucket, every environment overrides it, see .github/workflows/docker-build-push.yaml.
ARG SD3_FRONT_ORIGINS="status-dashboard-test.obs-website.eu-de.otc.t-systems.com"

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/generate-origin-conf.sh /usr/local/bin/generate-origin-conf.sh

# nginx -t resolves the endpoints, so an unresolvable one fails the build instead of the pod.
RUN sh /usr/local/bin/generate-origin-conf.sh "$SD3_FRONT_ORIGINS" /etc/nginx/sd3-origins.conf \
    && nginx -t

EXPOSE 80
