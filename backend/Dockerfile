# 1. Escolhe a imagem base (Node.js 20 rodando numa distro Linux super leve chamada Alpine)
FROM node:20-alpine

# 2. Define a pasta de trabalho padrão dentro do container
WORKDIR /app

# 3. Copia os arquivos de manifesto de pacotes para dentro da pasta /app
COPY package*.json ./

# 4. Roda o comando para instalar as dependências dentro do container
RUN npm install

# 5. Copia todo o restante do código da pasta backend/ para o container
COPY . .

# 6. Documenta qual porta a aplicação vai escutar
EXPOSE 3000

# 7. Define o comando final que coloca o servidor de pé quando o container liga
CMD ["npm", "start"]
