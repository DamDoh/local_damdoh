
# Use an official Node.js runtime as a parent image
FROM node:18-slim

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install app dependencies
# Using a wildcard to handle both npm and yarn lock files
# The --only=production flag ensures only production dependencies are installed
RUN npm install --only=production

# Bundle app source
COPY dist/ ./dist/

# Your app binds to port 8080 so you need to expose it
EXPOSE 8080

# Define the command to run your app
CMD [ "node", "dist/server.js" ]
