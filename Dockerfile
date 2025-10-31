FROM node:18-alpine AS build
WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

FROM node:18-alpine
WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY --from=build /app/src ./src

EXPOSE 3001

CMD ["node", "src/index.js"]