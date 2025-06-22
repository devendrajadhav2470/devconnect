# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
# We copy these files first to leverage Docker's layer caching.
# If only code changes, npm install won't re-run unless package.json changes.
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the entire application source code to the working directory
COPY . .

# Expose the port your app runs on
EXPOSE 3000

# Define the command to run your app
CMD [ "npm", "start" ]
