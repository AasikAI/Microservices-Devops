# Build stage
FROM node:18-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Use relative paths for API calls to be handled by Nginx Reverse Proxy
ENV VITE_AUTH_SERVICE_URL=/api/auth
ENV VITE_PRODUCT_SERVICE_URL=/api/products
ENV VITE_ORDER_SERVICE_URL=/api/orders
RUN npm run build

# Production stage
FROM nginx:alpine
# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copy built assets
COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
