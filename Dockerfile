FROM node:22-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM node:22-alpine AS production
ENV NODE_ENV=production \
    PORT=3000

WORKDIR /app

# Traer node_modules ya instalados desde la etapa anterior
COPY --from=deps /app/node_modules ./node_modules

# Copiar solo el código que la app necesita en runtime
COPY package.json package-lock.json ./
COPY src ./src

# Ejecutar como usuario no privilegiado (el image ya trae el usuario "node")
USER node

EXPOSE 3000

# Comprobación de salud contra el endpoint /health
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${PORT}/health" || exit 1

CMD ["node", "src/server.js"]
