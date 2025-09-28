FROM node:18-alpine AS build

WORKDIR /app

# install dependencies
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# copy files and run build
COPY . .

ARG VITE_APP_BASE_URL
ENV VITE_APP_BASE_URL=$VITE_APP_BASE_URL

RUN pnpm run build

# serve
FROM nginx:alpine

# copy built app
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# expose port
EXPOSE 80

# start nginx
CMD ["nginx", "-g", "daemon off;"]