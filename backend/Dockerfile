# 1. import from docker hub the image
FROM node:18-alpine

# 2. working directory
WORKDIR /app

# 3. copy the dependency and install them
COPY package*.json ./
RUN npm install

# 4. copy of all code source
COPY . .

# 5. Lport where the app working
EXPOSE 3000

# 6. command to run the project
CMD ["npm", "start"]