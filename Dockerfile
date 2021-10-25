FROM node:lts-alpine3.14

WORKDIR /usr/src/app

COPY package*.json ./
#COPY genedb.sqlite3 ./

#RUN npm install -g yarn
RUN yarn

COPY . .

EXPOSE 8080

CMD [ "node", "server.js" ]
