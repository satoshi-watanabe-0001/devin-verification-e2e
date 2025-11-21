FROM node:20-alpine

WORKDIR /app

COPY package.json ./

RUN npm install

COPY server.js ./

EXPOSE 8085

ENV PORT=8085

CMD ["npm", "start"]
