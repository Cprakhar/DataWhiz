FROM node:22.17-alpine

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install --production

# Copy the source code
COPY . .

# Set environment variables
ARG BACKEND_BASE_URL
ENV BACKEND_BASE_URL=${BACKEND_BASE_URL}

# Build the Next.js application
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Command to run the Next.js application
CMD ["npm", "start"]