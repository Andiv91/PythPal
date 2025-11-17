package com.example.backend.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaController {

    // Redirige cualquier ruta sin extensión (sin punto) a index.html.
    // Los endpoints /api/** tienen precedencia por ser más específicos.
    @RequestMapping({
        "/{p:^(?!api$)[^\\.]*}",
        "/{p:^(?!api$)[^\\.]*}/{p2:[^\\.]*}",
        "/{p:^(?!api$)[^\\.]*}/{p2:[^\\.]*}/{p3:[^\\.]*}",
        "/{p:^(?!api$)[^\\.]*}/{p2:[^\\.]*}/{p3:[^\\.]*}/{p4:[^\\.]*}",
        "/{p:^(?!api$)[^\\.]*}/{p2:[^\\.]*}/{p3:[^\\.]*}/{p4:[^\\.]*}/{p5:[^\\.]*}"
    })
    public String forwardToIndex() {
        return "forward:/index.html";
    }
}

