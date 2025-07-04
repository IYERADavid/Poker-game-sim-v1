# frontend/Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

# Copy the application code
COPY . .

# Build the frontend
RUN pnpm build

# Expose the port Next.js will run on
EXPOSE 3000

# Command to run the Next.js server
CMD ["pnpm", "start"]