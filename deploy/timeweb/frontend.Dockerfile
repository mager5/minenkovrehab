FROM node:22-bookworm-slim@sha256:c3de60bf2f9dd0ac6370e6117950ff62d6e339527e7472301c9c78a017978392 AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts
COPY src ./src
COPY public ./public
COPY content ./content
COPY next.config.js tsconfig.json tailwind.config.js postcss.config.js global.d.ts ./
ENV NEXT_TELEMETRY_DISABLED=1
ENV MIGRATION_ENV=local MIGRATION_SITE_ORIGIN=http://127.0.0.1:3100 MIGRATION_API_INTERNAL_URL=http://127.0.0.1:3101
RUN npm run build
RUN npm prune --omit=dev --ignore-scripts
FROM node:22-bookworm-slim@sha256:c3de60bf2f9dd0ac6370e6117950ff62d6e339527e7472301c9c78a017978392
WORKDIR /app
COPY --from=build --chown=node:node /app /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 CMD node -e "fetch('http://127.0.0.1:3000/api/health/live').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node","node_modules/next/dist/bin/next","start","-H","0.0.0.0","-p","3000"]
