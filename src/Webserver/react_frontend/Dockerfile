FROM node
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
EXPOSE 3000 # Set the exposed port
CMD ["npm", "run", "dev"]