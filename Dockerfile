FROM node:lts-alpine3.14

WORKDIR /usr/src/app

COPY . .
#RUN npm install -g yarn
RUN yarn


EXPOSE 8080

CMD [ "yarn", "start" ]
