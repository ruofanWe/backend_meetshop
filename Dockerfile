FROM node:20-alpine


WORKDIR /app


COPY package*.json ./


RUN npm install


COPY . .


EXPOSE 3000


CMD ["node", "src/q2-banking/app.js"]