FROM node:18.17.1

WORKDIR /frontend

COPY package*.json ./

RUN yarn

COPY . .

EXPOSE 3002

CMD ["yarn", "dev"]`
