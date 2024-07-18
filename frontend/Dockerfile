# Use an official Node runtime as the base image
FROM node:20

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install any needed packages
RUN npm install

# Bundle app source
COPY . .

# Build the app
# RUN npm run build

# Serve the static files on port 3000
EXPOSE 3000

# Define the command to serve the app
CMD ["npm", "start"]
