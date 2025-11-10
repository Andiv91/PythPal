## -------- STAGE 1: Build with Maven --------
FROM maven:3.9.8-eclipse-temurin-17 AS builder
WORKDIR /app

# Copiamos pom primero para aprovechar la cache de dependencias
COPY pom.xml .
RUN mvn -q -B -DskipTests dependency:go-offline

# Copiamos el resto del código y construimos
COPY src ./src
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

