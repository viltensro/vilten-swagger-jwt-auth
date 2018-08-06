FROM node:alpine

WORKDIR /opt/challenger

COPY build/. .
COPY .env .

RUN npm install

EXPOSE 3000
CMD [ "node", "main" ]
