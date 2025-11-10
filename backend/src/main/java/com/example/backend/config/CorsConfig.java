package com.example.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        // Permitir credenciales
        config.setAllowCredentials(true);

        // Orígenes permitidos desde variable de entorno (coma separada)
        String originsEnv = System.getenv("ALLOWED_ORIGINS");
        Set<String> allowedOrigins = new HashSet<>();
        if (originsEnv != null && !originsEnv.trim().isEmpty()) {
            Arrays.stream(originsEnv.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .forEach(allowedOrigins::add);
        }
        // Defaults de desarrollo
        allowedOrigins.add("http://localhost:3000");
        allowedOrigins.add("https://localhost:3000");

        allowedOrigins.forEach(config::addAllowedOrigin);
        
        // Permitir todos los headers
        config.addAllowedHeader("*");
        
        // Permitir todos los métodos (GET, POST, etc.)
        config.addAllowedMethod("*");
        
        source.registerCorsConfiguration("/**", config);
        
        return new CorsFilter(source);
    }
}