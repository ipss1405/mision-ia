package cl.ipss.misionia.controller;

import java.util.List;

import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import cl.ipss.misionia.service.DesafioPublicado;
import cl.ipss.misionia.service.DesafioService;

@RestController
public class DiagnosticoApiController {

    private final DesafioService service;

    public DiagnosticoApiController(DesafioService service) {
        this.service = service;
    }

    @GetMapping("/api/desafios/diagnostico")
    public ResponseEntity<List<DesafioPublicado>> diagnostico() {
        List<DesafioPublicado> publicados = service.listarDiagnostico().stream()
                .map(DesafioPublicado::desde)
                .toList();
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(publicados);
    }
}
