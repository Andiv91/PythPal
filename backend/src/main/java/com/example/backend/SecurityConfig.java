package com.example.backend;

import com.example.backend.config.OAuth2FailureHandler;
import com.example.backend.config.OAuth2SuccessHandler;
import com.example.backend.service.CustomOAuth2UserService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;

@Configuration
public class SecurityConfig {
    private final CustomOAuth2UserService customOAuth2UserService;
    private final OAuth2SuccessHandler oAuth2SuccessHandler;
    private final OAuth2FailureHandler oAuth2FailureHandler;

    public SecurityConfig(CustomOAuth2UserService customOAuth2UserService, 
                          OAuth2SuccessHandler oAuth2SuccessHandler,
                          OAuth2FailureHandler oAuth2FailureHandler) {
        this.customOAuth2UserService = customOAuth2UserService;
        this.oAuth2SuccessHandler = oAuth2SuccessHandler;
        this.oAuth2FailureHandler = oAuth2FailureHandler;
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public HttpSessionSecurityContextRepository securityContextRepository() {
        return new HttpSessionSecurityContextRepository();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors().and() // Habilitar CORS
            .csrf(AbstractHttpConfigurer::disable) // Deshabilitar CSRF para APIs
            
            // Configuración de autorización de requests
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**", "/api/auth-status", "/api/profesores/**").permitAll() // Endpoints públicos
                .anyRequest().authenticated() // Cualquier otra petición requiere autenticación
            )
            
            // Configuración para responder con 401 en caso de falta de autenticación
            .exceptionHandling(exc -> 
                exc.authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))
            )
            
            // Configuración de OAuth2 (Google)
            .oauth2Login(oauth2 -> oauth2
                // Configurar el manejador de éxito para redirigir al frontend
                .successHandler(oAuth2SuccessHandler)
                // Configurar el manejador de errores
                .failureHandler(oAuth2FailureHandler)
                .userInfoEndpoint(userInfo -> userInfo
                    .userService(customOAuth2UserService)
                    .oidcUserService(new OidcUserService() {
                        @Override
                        public org.springframework.security.oauth2.core.oidc.user.OidcUser loadUser(
                                org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest userRequest) {
                            customOAuth2UserService.loadUser(userRequest);
                            return super.loadUser(userRequest);
                        }
                    })
                )
            )
            
            // Configuración para mantener la sesión después de login exitoso
            .sessionManagement(session -> session
                .maximumSessions(1) // Permitir solo una sesión por usuario
            )
            
            // HABILITAR LOGIN CONVENCIONAL
            .formLogin(form -> form
                .loginProcessingUrl("/api/auth/login")
                .permitAll()
            );
            
        return http.build();
    }
}