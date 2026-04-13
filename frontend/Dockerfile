
FROM node:alpine as build
WORKDIR /app
COPY package*.json .
RUN npm ci
RUN npm install -g @angular/cli
RUN npm i
COPY . .
RUN ng build

FROM nginx:latest
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html

EXPOSE 80