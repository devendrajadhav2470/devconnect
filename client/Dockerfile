# =================================================================
# STAGE 1: Build the React application
# =================================================================
FROM node:18-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
# This leverages Docker's layer caching.
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the application for production
# This creates a 'dist' folder with the static files.
RUN npm run build

# Use Vite's preview server
EXPOSE 4173
CMD ["npm", "run", "preview"]

