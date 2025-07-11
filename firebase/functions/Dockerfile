# Use an official Node.js runtime as a parent image
FROM node:18-slim

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to leverage Docker cache
COPY package*.json ./

# Install app dependencies
RUN npm install

# Bundle app source
COPY . .

# Build the TypeScript source code
RUN npm run build

# Your app binds to port 8080 so you'll use the EXPOSE instruction
EXPOSE 8080

# Define the command to run your app
CMD [ "node", "dist/server.js" ]
