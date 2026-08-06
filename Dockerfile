FROM node:20-bookworm-slim AS base

WORKDIR /app

# Prisma's config requires a DATABASE_URL during dependency installation and
# build. The real value is injected by Docker Compose at runtime.
ENV ASTRO_TELEMETRY_DISABLED=1 \
    DATABASE_URL=postgresql://placeholder:placeholder@localhost:5432/weddingly

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates openssl \
  && rm -rf /var/lib/apt/lists/*

FROM base AS dependencies

COPY package.json package-lock.json ./
RUN npm ci

FROM base AS build

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runtime

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=4321

COPY --from=build /app/package.json ./package.json
COPY --from=build /app/package-lock.json ./package-lock.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts ./prisma.config.ts

# The seed command imports a small number of runtime TypeScript modules.
COPY --from=build /app/src ./src

EXPOSE 4321

CMD ["npm", "run", "start"]
