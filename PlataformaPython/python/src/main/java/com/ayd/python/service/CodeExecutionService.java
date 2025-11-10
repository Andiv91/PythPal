package com.ayd.python.service;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.ayd.python.dto.CodeRequestDTO;
import com.ayd.python.dto.CodeResponseDTO;

import reactor.core.publisher.Mono;

@Service
public class CodeExecutionService {

    private final WebClient webClient;

    public CodeExecutionService() {
        this.webClient = WebClient.builder()
                .baseUrl("https://emkc.org/api/v2/piston")
                .build();
    }

    public Mono<CodeResponseDTO> ejecutarCodigo(CodeRequestDTO request) {
        return webClient.post()
                .uri("/execute")
                .bodyValue(new EjecutarPayload(request))
                .retrieve()
                .bodyToMono(CodeResponseDTO.class);
    }

    // Clase interna para el payload que espera Piston
    record EjecutarPayload(String language, String version, Source[] files) {
        public EjecutarPayload(CodeRequestDTO dto) {
            this(dto.getLanguage(), dto.getVersion(), new Source[]{new Source("main.py", dto.getCode())});
        }
    }

    record Source(String name, String content) {}
}