FROM caddy:2-builder AS b
RUN xcaddy build --with github.com/caddyserver/replace-response
FROM caddy:2
COPY --from=b /usr/bin/caddy /usr/bin/caddy
