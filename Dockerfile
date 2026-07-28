FROM node:22-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@11.13.1

# Copy workspace config
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY pnpm-lock.yaml ./

# Copy package.json files for all workspace packages
COPY packages/shared/package.json ./packages/shared/
COPY apps/server/package.json ./apps/server/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source files
COPY packages/shared ./packages/shared
COPY apps/server ./apps/server

# Build
RUN pnpm --filter @mintfolio/server build

EXPOSE 3001

CMD ["node", "apps/server/dist/src/main"]
