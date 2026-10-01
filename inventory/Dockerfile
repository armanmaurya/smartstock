# Build stage using Maven and Java 21
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /build

# Cache Maven dependencies layer
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy application source code and package JAR
COPY src ./src
RUN mvn clean package -DskipTests

# Runtime stage using lightweight Eclipse Temurin 21 JRE
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Copy built artifact from build stage
COPY --from=build /build/target/*.jar app.jar

# Expose Spring Boot port
EXPOSE 8080

# Environment defaults
ENV SPRING_PROFILES_ACTIVE=oracle \
    JAVA_OPTS="-Xms256m -Xmx512m -XX:+UseG1GC"

# Healthcheck verifying endpoint readiness
HEALTHCHECK --interval=20s --timeout=5s --start-period=45s --retries=5 \
  CMD wget -q --spider http://localhost:8080/api/reports/kpi || exit 1

# Launch application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
