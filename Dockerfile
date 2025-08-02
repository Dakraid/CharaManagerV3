FROM node:24-alpine AS build
WORKDIR /app

RUN corepack enable

COPY package.json package-lock.yaml ./

# Install dependencies
RUN npm install --frozen-lockfile

# Copy the entire project
COPY . ./

# Build the project
RUN npm run build

# Build Stage 2

FROM node:24-alpine
WORKDIR /app

# Only `.output` folder is needed from the build stage
COPY --from=build /app/.output/ ./

# Change the port and host
ENV PORT=80
ENV HOST=0.0.0.0

EXPOSE 80

CMD ["node", "/app/server/index.mjs"]