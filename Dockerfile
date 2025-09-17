# Use an official Node.js runtime as the base image
FROM node:20-slim

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the source code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Command to run the app
CMD ["npm", "run", "dev"]