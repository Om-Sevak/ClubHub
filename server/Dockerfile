FROM node:18-alpine

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

EXPOSE 5000

ARG MONGO_URI
ARG SESSION_SECRET
ARG ORIGIN
ARG AZURE_STORAGE_CONNECTION_STRING
ARG CONTAINER_NAME
ARG DEFAULT_LOGO_URL 

ENV MONGO_URI $MONGO_URI
ENV SESSION_SECRET $SESSION_SECRET
ENV ORIGIN $ORIGIN
ENV AZURE_STORAGE_CONNECTION_STRING $AZURE_STORAGE_CONNECTION_STRING
ENV CONTAINER_NAME $CONTAINER_NAME
ENV DEFAULT_LOGO_URL $DEFAULT_LOGO_URL 

CMD ["npm", "start"]