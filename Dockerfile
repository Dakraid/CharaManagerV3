FROM node:lts-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . ./

ENV NODE_ENV=production

RUN npm run build

FROM node:24-alpine
WORKDIR /app

COPY --from=build /app/.output/ ./

ENV NODE_ENV=production
ENV PORT=80
ENV HOST=0.0.0.0

EXPOSE 80

CMD ["node", "/app/server/index.mjs"]