FROM node:22-bookworm-slim@sha256:c3de60bf2f9dd0ac6370e6117950ff62d6e339527e7472301c9c78a017978392
WORKDIR /app
COPY robokassa-api/package.json robokassa-api/package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts
COPY robokassa-api/timeweb ./timeweb
COPY robokassa-api/utils/cookies.js ./utils/cookies.js
COPY deploy/timeweb/roles.sql ./timeweb/runtime-roles.sql
USER node
EXPOSE 3101
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 CMD node -e "fetch('http://127.0.0.1:3101/health/live').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node","timeweb/server.js"]
