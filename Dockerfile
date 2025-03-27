# Imagen base de Node.js
FROM node:22

WORKDIR /app

# Copia de lo necesario (evitando node_modules y .env en imagen final)
COPY package*.json ./
RUN npm install

# Copia del resto de archivos (excepto .env si hay variables en runtime)
COPY . .

# Puerto expuesto
EXPOSE 3000

CMD ["node", "server.js"]