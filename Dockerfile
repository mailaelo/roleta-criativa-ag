FROM node:23-alpine

WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application files
COPY . .

# Expose port
EXPOSE 3000

# Start server with experimental strip types
CMD ["node", "--experimental-strip-types", "server.ts"]
