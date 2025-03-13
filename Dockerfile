# Use the official Node.js 18 image for better compatibility
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package files first to leverage Docker caching
COPY package.json package-lock.json ./

# Install dependencies inside the container
RUN npm install

# Copy the rest of the frontend code
COPY . .

# Expose port 3000 for frontend access
EXPOSE 3000

# Start the React frontend
CMD ["npm", "start"]
