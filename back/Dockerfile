# Étape de construction
FROM node:18.15 AS build-stage

WORKDIR /app

# Copier les fichiers de dépendance en premier pour utiliser le cache Docker
COPY package*.json ./
RUN npm install

# Copier le reste du code source
COPY ./ ./

# Construire l'application
RUN npm run build

# Étape de production
FROM node:18.15 AS production-stage

WORKDIR /app

# Copier les fichiers de dépendance à nouveau
COPY package*.json ./
RUN npm install --only=production

# Copier le code compilé de l'étape de construction
COPY --from=build-stage /app/dist /app/dist

CMD ["node", "dist/src/main"]
