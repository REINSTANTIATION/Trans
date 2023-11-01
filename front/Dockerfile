FROM node:18.15 as dev-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY ./ .
CMD ["npm", "run", "dev"]

#Desactiver NGINX pour pouvoir avoir le hot-reloading par le serveur vite 

# FROM nginx as production-stage
# EXPOSE 80
# RUN mkdir /app
# COPY nginx.conf /etc/nginx/conf.d/default.conf
# COPY --from=build-stage /app/dist /app
