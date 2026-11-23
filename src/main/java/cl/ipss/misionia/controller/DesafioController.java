package cl.ipss.misionia.controller;

import java.util.Map;
import java.util.NoSuchElementException;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.WebDataBinder;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.InitBinder;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import cl.ipss.misionia.entity.Desafio;
import cl.ipss.misionia.entity.Habilidad;
import cl.ipss.misionia.service.DesafioService;
import cl.ipss.misionia.service.PublicacionInvalidaException;

@Controller
@RequestMapping("/admin/desafios")
public class DesafioController {

    private static final String LISTA = "admin/desafios/lista";
    private static final String FORMULARIO = "admin/desafios/formulario";
    private static final String VOLVER_A_LISTA = "redirect:/admin/desafios";
    private final DesafioService service;

    public DesafioController(DesafioService service) {
        this.service = service;
    }

    @InitBinder("desafio")
    public void limitarCamposEditables(WebDataBinder binder) {
        binder.setAllowedFields("titulo", "enunciado", "opcionA", "opcionB", "opcionC", "opcionD",
                "respuestaCorrecta", "habilidadPrincipal", "habilidadSecundaria", "puntajeJuego",
                "feedbackCorrecto", "feedbackIncorrecto", "publicadoDiagnostico", "ordenDiagnostico", "mensajeNia");
    }

    @ModelAttribute("habilidades")
    public Habilidad[] habilidades() {
        return Habilidad.values();
    }

    @GetMapping
    public String listar(Model model) {
        model.addAttribute("desafios", service.listarTodos());
        return LISTA;
    }

    @GetMapping("/nuevo")
    public String nuevo(Model model) {
        model.addAttribute("desafio", new Desafio());
        return FORMULARIO;
    }

    @GetMapping("/{id}")
    public String detalle(@PathVariable Long id, Model model) {
        model.addAttribute("desafio", service.obtener(id));
        return "admin/desafios/detalle";
    }

    @PostMapping
    public String crear(@Valid @ModelAttribute("desafio") Desafio desafio,
            BindingResult errores, RedirectAttributes redirect) {
        if (errores.hasErrors()) {
            return FORMULARIO;
        }
        try {
            service.crear(desafio);
        } catch (PublicacionInvalidaException ex) {
            errores.rejectValue(ex.getCampo(), "publicacion.invalida", ex.getMessage());
            return FORMULARIO;
        }
        redirect.addFlashAttribute("mensaje", "Desafío creado correctamente.");
        return VOLVER_A_LISTA;
    }

    @GetMapping("/{id}/editar")
    public String editar(@PathVariable Long id, Model model) {
        model.addAttribute("desafio", service.obtener(id));
        model.addAttribute("idEdicion", id);
        return FORMULARIO;
    }

    @PostMapping("/{id}")
    public String actualizar(@PathVariable Long id, @Valid @ModelAttribute("desafio") Desafio desafio,
            BindingResult errores, Model model, RedirectAttributes redirect) {
        if (errores.hasErrors()) {
            service.obtener(id);
            model.addAttribute("idEdicion", id);
            return FORMULARIO;
        }
        try {
            service.actualizar(id, desafio);
        } catch (PublicacionInvalidaException ex) {
            errores.rejectValue(ex.getCampo(), "publicacion.invalida", ex.getMessage());
            model.addAttribute("idEdicion", id);
            return FORMULARIO;
        }
        redirect.addFlashAttribute("mensaje", "Cambios guardados correctamente.");
        return VOLVER_A_LISTA;
    }

    @PostMapping("/{id}/estado")
    public String cambiarEstado(@PathVariable Long id, @RequestParam boolean activo, RedirectAttributes redirect) {
        service.cambiarEstado(id, activo);
        redirect.addFlashAttribute("mensaje", activo ? "Desafío reactivado." : "Desafío desactivado.");
        return VOLVER_A_LISTA;
    }

    @ExceptionHandler(NoSuchElementException.class)
    public ModelAndView desafioNoEncontrado(NoSuchElementException excepcion) {
        return new ModelAndView(LISTA, Map.of("error", excepcion.getMessage(), "desafios", service.listarTodos()),
                HttpStatus.NOT_FOUND);
    }
}
