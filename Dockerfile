# 1. Use an official Node.js runtime as a parent image
FROM node:18-slim

# 2. Install G++ (The C++ Compiler)
# We use 'slim' to keep it small, so we need to install build tools manually
RUN apt-get update && apt-get install -y g++ build-essential python3

# 3. Set the working directory inside the container
WORKDIR /app

# 4. Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# 5. Copy the rest of the application code
COPY . .

# 6. Create the processing directory (Docker will mount the volume here later)
RUN mkdir -p processing

# 7. Expose the API port
EXPOSE 5000

# 8. Default command (Can be overridden by Docker Compose)
CMD ["npm", "run", "dev"]