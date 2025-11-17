package com.example.backend;

import com.example.backend.config.OAuth2FailureHandler;
import com.example.backend.config.OAuth2SuccessHandler;
import com.example.backend.service.CustomOAuth2UserService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;

import com.example.backend.repository.UserRepository;
import com.example.backend.model.User;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {
    private final CustomOAuth2UserService customOAuth2UserService;
    private final OAuth2SuccessHandler oAuth2SuccessHandler;
    private final OAuth2FailureHandler oAuth2FailureHandler;

    private final UserRepository userRepository;

    public SecurityConfig(CustomOAuth2UserService customOAuth2UserService, 
                          OAuth2SuccessHandler oAuth2SuccessHandler,
                          OAuth2FailureHandler oAuth2FailureHandler,
                          UserRepository userRepository) {
        this.customOAuth2UserService = customOAuth2UserService;
        this.oAuth2SuccessHandler = oAuth2SuccessHandler;
        this.oAuth2FailureHandler = oAuth2FailureHandler;
        this.userRepository = userRepository;
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
            .securityContext(ctx -> ctx.securityContextRepository(securityContextRepository()))
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                .maximumSessions(1) // Permitir solo una sesión por usuario
            )
            
            // Configuración de autorización de requests
            .authorizeHttpRequests(auth -> auth
                // Recursos estáticos y SPA (frontend servido por el backend)
                .requestMatchers(HttpMethod.GET, "/", "/index.html", "/favicon.ico").permitAll()
                .requestMatchers(HttpMethod.GET, "/static/**", "/assets/**", "/*.js", "/*.css", "/*.png", "/*.svg", "/*.webp").permitAll()
                // OAuth y endpoints públicos
                .requestMatchers("/oauth2/**", "/login/**").permitAll()
                .requestMatchers("/api/auth/**", "/api/auth-status", "/api/profesores/**").permitAll()
                // Admin sólo con rol
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                // Resto de API requiere autenticación
                .requestMatchers("/api/**").authenticated()
                // TODO: otras rutas del frontend deben cargarse sin exigir auth (la app decidirá)
                .anyRequest().permitAll()
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
                        public OidcUser loadUser(
                                org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest userRequest) {
                            customOAuth2UserService.loadUser(userRequest);
                            OidcUser base = super.loadUser(userRequest);
                            String email = (String) base.getAttributes().get("email");
                            User.Role role = User.Role.STUDENT;
                            if (email != null) {
                                var dbUser = userRepository.findByEmail(email).orElse(null);
                                if (dbUser != null && dbUser.getRole() != null) {
                                    role = dbUser.getRole();
                                }
                            }
                            java.util.Set<GrantedAuthority> authorities = new java.util.LinkedHashSet<>(base.getAuthorities());
                            authorities.add(new SimpleGrantedAuthority("ROLE_" + role.name()));
                            return new DefaultOidcUser(authorities, base.getIdToken(), base.getUserInfo());
                        }
                    })
                )
            )
            
            // HABILITAR LOGIN CONVENCIONAL
            .formLogin(form -> form
                .loginProcessingUrl("/api/auth/login")
                .permitAll()
            );
            
        return http.build();
    }
}