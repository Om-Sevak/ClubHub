FROM node:18-alpine

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

EXPOSE 5000

ENV MONGO_URI = $MONGO_URI

CMD ["npm", "start"]