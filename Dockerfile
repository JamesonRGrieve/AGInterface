FROM node:23-alpine AS builder
WORKDIR /client-build
RUN apk add --no-cache python3 make g++ eudev-dev libusb-dev linux-headers eudev-libs
COPY package*.json ./
RUN npm install -g npm@latest 
RUN ARCH=$(uname -m) && \
    if [ "$ARCH" = "x86_64" ]; then \
    npm install lightningcss-linux-x64-musl @tailwindcss/oxide-linux-x64-musl; \
    elif [ "$ARCH" = "aarch64" ] || [ "$ARCH" = "arm64" ]; then \
    npm install lightningcss-linux-arm64-musl @tailwindcss/oxide-linux-arm64-musl; \
    elif [ "$ARCH" = "armv7l" ]; then \
    npm install lightningcss-linux-arm-musl @tailwindcss/oxide-linux-arm-musl; \
    elif [ "$ARCH" = "ppc64le" ]; then \
    npm install lightningcss-linux-ppc64le-musl @tailwindcss/oxide-linux-ppc64le-musl; \
    elif [ "$ARCH" = "s390x" ]; then \
    npm install lightningcss-linux-s390x-musl @tailwindcss/oxide-linux-s390x-musl; \
    else \
    echo "Unsupported architecture: $ARCH"; \
    echo "Available packages are for: x86_64, arm64, armv7l, ppc64le, s390x"; \
    exit 1; \
    fi
RUN npm ci
COPY . .
ARG API_URI
ARG SERVERSIDE_API_URI
ARG APP_NAME
ARG APP_URI
RUN chmod +x ./env.sh && ./env.sh
RUN npm run build

FROM node:23-alpine AS runner
WORKDIR /client
ENV NODE_ENV=production
RUN apk add --no-cache python3 libusb eudev make g++ linux-headers eudev-libs
COPY package*.json ./
RUN npm install -g npm@latest && npm ci --omit=dev

COPY --from=builder /client-build/server-wrapper.js /client/
COPY --from=builder /client-build/public /client/public
COPY --from=builder /client-build/.next/standalone /client/
COPY --from=builder /client-build/.next/static /client/.next/static

EXPOSE 1109
ENV PORT=1109
ENTRYPOINT ["node", "server-wrapper.js"]
