# Development stage
FROM node:18
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
COPY package-lock.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Expose port
EXPOSE 8000

# Set environment variables
ENV NODE_ENV=development
ENV PORT=8000
ENV MONGO_ROOT_USERNAME=admin
ENV MONGO_ROOT_PASSWORD=password123
ENV MONGODB_URI=mongodb://admin:password123@mongodb:27017/damdoh?authSource=admin
ENV JWT_SECRET=damdoh_jwt_secret_key
ENV JWT_EXPIRES_IN=7d
ENV RATE_LIMIT_WINDOW_MS=15m
ENV RATE_LIMIT_MAX_REQUESTS=100
ENV CORS_ORIGIN=*
ENV LOG_LEVEL=info

# Start the application in development mode
CMD ["npm", "run", "dev"]