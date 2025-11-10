package com.example.backend.service;

import com.example.backend.model.User;
import com.example.backend.model.User.Role;
import com.example.backend.repository.UserRepository;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

import java.util.Map;
import java.util.Optional;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    public CustomOAuth2UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        Map<String, Object> attributes = oAuth2User.getAttributes();
        String email = (String) attributes.get("email");
        String name = (String) attributes.get("name");

        System.out.println("CustomOAuth2UserService: email=" + email + ", name=" + name);

        // Obtener el rol seleccionado por el usuario (desde la sesión)
        final Role selectedRole = getSelectedRoleFromSession() != null ? 
                getSelectedRoleFromSession() : Role.STUDENT;
        
        System.out.println("Rol seleccionado para OAuth2: " + selectedRole);

        // Buscar si el usuario ya existe
        Optional<User> existingUser = userRepository.findByEmail(email);
        
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            
            // Verificar que el rol coincida con el seleccionado
            if (user.getRole() != selectedRole) {
                System.out.println("El usuario existe pero el rol seleccionado (" + selectedRole + 
                        ") no coincide con su rol actual (" + user.getRole() + ")");
                
                // Lanzar una excepción para interrumpir el flujo de OAuth2
                throw new RuntimeException("No puedes iniciar sesión como " + 
                        (selectedRole == Role.TEACHER ? "profesor" : "estudiante") + 
                        ". Tu cuenta está registrada como " + 
                        (user.getRole() == Role.TEACHER ? "profesor" : "estudiante") +
                        ". Por favor, selecciona el rol correcto e intenta nuevamente.");
            } else {
                System.out.println("Usuario existente encontrado con rol coincidente");
            }
            
            return oAuth2User;
        }
        
        // Si el usuario no existe, lo creamos
        User newUser = new User(email, name, null, selectedRole);
        System.out.println("Creando nuevo usuario con rol: " + selectedRole);
        userRepository.save(newUser);

        return oAuth2User;
    }

    // Método para obtener el rol seleccionado de la sesión
    private Role getSelectedRoleFromSession() {
        try {
            ServletRequestAttributes attr = (ServletRequestAttributes) RequestContextHolder.currentRequestAttributes();
            HttpServletRequest request = attr.getRequest();
            HttpSession session = request.getSession(false);
            
            if (session != null) {
                String roleStr = (String) session.getAttribute("selectedRole");
                if (roleStr != null) {
                    return Role.valueOf(roleStr);
                }
            }
        } catch (Exception e) {
            System.out.println("Error al obtener el rol de la sesión: " + e.getMessage());
        }
        return null;
    }
}