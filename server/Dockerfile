FROM node:18-alpine

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

EXPOSE 5000

ARG MONGO_URI
ENV MONGO_URI $MONGO_URI

CMD ["npm", "start"]