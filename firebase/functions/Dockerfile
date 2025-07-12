# Use an official Node.js runtime as a parent image
FROM node:18-slim

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install app dependencies
RUN npm install

# Bundle app source
COPY . .

# Build TypeScript source
RUN npm run build

# Your app binds to port 8080 so you need to expose it
EXPOSE 8080

# Define the command to run your app
CMD [ "node", "dist/server.js" ]
