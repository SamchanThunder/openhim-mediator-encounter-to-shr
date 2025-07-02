FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build
COPY src/test.json dist/test.json

EXPOSE 7060
CMD ["npm", "start"]
