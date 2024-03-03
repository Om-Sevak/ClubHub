FROM node:18-alpine

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

EXPOSE 5000

ENV MONGO_URI=mongodb+srv://Admin:ehiAGkcEh8508UEd@clubhub.4fw0aul.mongodb.net/ClubHub?retryWrites=true&w=majority

CMD ["npm", "start"]