package com.example.backend.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaController {

    // Redirige cualquier ruta que no sea /api/** ni un recurso con punto a index.html
    @RequestMapping(value = {
            "/{path:^(?!api$).*$}",
            "/{path:^(?!api$).*$}/**"
    })
    public String forwardToIndex() {
        return "forward:/index.html";
    }
}

