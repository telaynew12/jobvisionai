# Stage 1: Build
FROM node:20-alpine AS build

WORKDIR /app

# Copy only package files first for caching dependencies
COPY package*.json ./

RUN npm install

# Copy the rest of the app (only after dependencies are installed)
COPY . .

# Build the React app
RUN npm run build

# Stage 2: Serve with lightweight Nginx
FROM nginx:alpine

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy build output to Nginx
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
