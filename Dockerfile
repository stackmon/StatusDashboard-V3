# Frozen shim: the image carries no site content. The OBS static website buckets serve it, this
# container only forwards to them and falls back to the next region, so the CCE objects
# (Deployment, Service, Ingress) keep their current shape.
FROM nginx:stable-alpine

# Website endpoints to fall back through, primary first, comma separated. Default is the public
# production chain; the CH site and other environments are built by overriding it, see
# .github/workflows/docker-build-push.yaml.
ARG SD3_FRONT_ORIGINS="status.obs-website.eu-de.otc.t-systems.com,status-dashboard.obs-website.eu-nl.otc.t-systems.com,status-pub.obs-website.eu-ch2.sc.otc.t-systems.com"

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/generate-origin-conf.sh /usr/local/bin/generate-origin-conf.sh

# nginx -t resolves the endpoints, so a misspelled or unresolvable one fails the build instead of
# the pod.
RUN sh /usr/local/bin/generate-origin-conf.sh "$SD3_FRONT_ORIGINS" /etc/nginx/sd3-origins.conf \
    && nginx -t

EXPOSE 80
