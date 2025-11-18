## -------- STAGE 1: Build with Maven --------
FROM node:18-alpine AS frontend-builder
WORKDIR /frontend
# Instalar dependencias y compilar React
COPY frontend/package*.json ./
RUN npm ci --legacy-peer-deps
# Instalar dependencia de animación requerida por DotGrid
RUN npm install gsap@^3.12.5 --save-exact
COPY frontend/ ./
RUN npm run build

## -------- STAGE 1: Build with Maven --------
FROM maven:3.9.8-eclipse-temurin-17 AS builder
WORKDIR /app

# Copiamos pom primero para aprovechar la cache de dependencias
COPY backend/pom.xml ./pom.xml
RUN mvn -q -B -DskipTests dependency:go-offline

# Copiamos el resto del código y construimos
COPY backend/src ./src
# Copiamos el build del frontend al directorio estático de Spring
RUN mkdir -p ./src/main/resources/static
COPY --from=frontend-builder /frontend/build/ ./src/main/resources/static/
# Copiamos el logo original del frontend para usarlo en certificados
RUN mkdir -p ./src/main/resources/static/pictures
COPY --from=frontend-builder /frontend/src/pictures/pythonlogin.png ./src/main/resources/static/pictures/pythonlogin.png
RUN mvn -q -B -DskipTests package

## -------- STAGE 2: Runtime (slim JRE) --------
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copiamos el JAR construido
COPY --from=builder /app/target/*.jar /app/app.jar

# Render expone el puerto en la variable $PORT; Spring usa server.port
ENV PORT=8080
EXPOSE 8080

# Ejecutar
CMD ["sh", "-c", "java -Dserver.port=${PORT} -jar /app/app.jar"]

