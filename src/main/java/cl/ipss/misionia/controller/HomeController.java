package cl.ipss.misionia.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

    @GetMapping("/")
    public String inicio() {
        return "index";
    }

    @GetMapping("/diagnostico")
    public String diagnostico() {
        return "diagnostico";
    }

    @GetMapping("/perfil")
    public String perfil() {
        return "perfil";
    }

    @GetMapping("/ruta")
    public String ruta() {
        return "ruta";
    }
}
