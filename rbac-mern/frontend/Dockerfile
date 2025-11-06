FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
CMD ["npx","serve","-s","build","-l","3000"]
