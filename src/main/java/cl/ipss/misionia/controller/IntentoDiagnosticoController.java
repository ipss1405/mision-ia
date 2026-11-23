package cl.ipss.misionia.controller;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import cl.ipss.misionia.service.IntentoDiagnosticoService;
import cl.ipss.misionia.service.IntentoDiagnosticoService.IntentoCreado;
import cl.ipss.misionia.service.IntentoDiagnosticoService.Resultado;
import cl.ipss.misionia.service.IntentoDiagnosticoService.Seleccion;

@RestController
@RequestMapping("/api/intentos")
public class IntentoDiagnosticoController {

    private final IntentoDiagnosticoService service;

    public IntentoDiagnosticoController(IntentoDiagnosticoService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<IntentoCreado> crear() {
        return ResponseEntity.status(HttpStatus.CREATED).cacheControl(CacheControl.noStore())
                .body(service.crear());
    }

    @PostMapping("/{id}/finalizar")
    public ResponseEntity<Resultado> finalizar(@PathVariable UUID id, @RequestBody List<Seleccion> selecciones) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(service.finalizar(id, selecciones));
    }

    @GetMapping("/{id}/resultado")
    public ResponseEntity<Resultado> resultado(@PathVariable UUID id) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(service.obtenerResultado(id));
    }

    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<ProblemDetail> noDisponible() {
        return error(HttpStatus.NOT_FOUND, "El resultado del intento no está disponible.");
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ProblemDetail> invalido(IllegalArgumentException ex) {
        return error(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ProblemDetail> conflicto(IllegalStateException ex) {
        return error(HttpStatus.CONFLICT, ex.getMessage());
    }

    private ResponseEntity<ProblemDetail> error(HttpStatus estado, String mensaje) {
        return ResponseEntity.status(estado).cacheControl(CacheControl.noStore())
                .body(ProblemDetail.forStatusAndDetail(estado, mensaje));
    }

}
