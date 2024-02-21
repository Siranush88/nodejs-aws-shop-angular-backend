# Use the official Node.js 14 image
FROM node:18-alpine AS builder

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

COPY .env .

# Expose the port the app runs on
EXPOSE 4000

# Start the application
CMD ["node", "index.js"]