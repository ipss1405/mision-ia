package cl.ipss.misionia.service;

import java.sql.SQLException;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Objects;
import java.util.Optional;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cl.ipss.misionia.entity.Desafio;
import cl.ipss.misionia.repository.DesafioRepository;

@Service
@Transactional(readOnly = true)
public class DesafioService {

    private final DesafioRepository repository;

    public DesafioService(DesafioRepository repository) {
        this.repository = repository;
    }

    public List<Desafio> listarTodos() {
        return repository.findAllByOrderByIdAsc();
    }

    public List<Desafio> listarActivos() {
        return repository.findAllByActivoTrueOrderByIdAsc();
    }

    public List<Desafio> listarDiagnostico() {
        return repository.findAllByActivoTrueAndPublicadoDiagnosticoTrueOrderByOrdenDiagnosticoAsc();
    }

    public Desafio obtener(Long id) {
        return exigirDesafio(id, repository.findById(id));
    }

    @Transactional
    public void crear(Desafio datos) {
        datos.setActivo(true);
        aplicarPublicacion(datos, datos);
        guardar(datos);
    }

    @Transactional
    public void actualizar(Long id, Desafio datos) {
        Desafio desafio = exigirDesafio(id, repository.findOneById(id));
        aplicarPublicacion(desafio, datos);
        desafio.setTitulo(datos.getTitulo());
        desafio.setEnunciado(datos.getEnunciado());
        desafio.setOpcionA(datos.getOpcionA());
        desafio.setOpcionB(datos.getOpcionB());
        desafio.setOpcionC(datos.getOpcionC());
        desafio.setOpcionD(datos.getOpcionD());
        desafio.setRespuestaCorrecta(datos.getRespuestaCorrecta());
        desafio.setHabilidadPrincipal(datos.getHabilidadPrincipal());
        desafio.setHabilidadSecundaria(datos.getHabilidadSecundaria());
        desafio.setPuntajeJuego(datos.getPuntajeJuego());
        desafio.setFeedbackCorrecto(datos.getFeedbackCorrecto());
        desafio.setFeedbackIncorrecto(datos.getFeedbackIncorrecto());
        guardar(desafio);
    }

    @Transactional
    public void cambiarEstado(Long id, boolean activo) {
        Desafio desafio = exigirDesafio(id, repository.findOneById(id));
        desafio.setActivo(activo);
    }

    private void aplicarPublicacion(Desafio desafio, Desafio datos) {
        boolean publicar = datos.isPublicadoDiagnostico();
        Integer orden = datos.getOrdenDiagnostico();
        if (publicar) {
            if (orden == null || orden < 1) {
                throw new PublicacionInvalidaException("ordenDiagnostico", "Asigna una posición positiva para publicar.");
            }
            if (repository.findByOrdenDiagnostico(orden).stream().anyMatch(otro -> !Objects.equals(otro.getId(), desafio.getId()))) {
                throw ordenOcupado();
            }
            if (!Integer.valueOf(350).equals(datos.getPuntajeJuego())) {
                throw new PublicacionInvalidaException("puntajeJuego", "Cada desafío publicado otorga 350 puntos.");
            }
            if (orden == 5 && (sinTexto(datos.getOpcionC()) || sinTexto(datos.getOpcionD()))) {
                throw new PublicacionInvalidaException("ordenDiagnostico", "La misión 5 requiere cuatro fragmentos.");
            }
            if (orden == 6 && (!contieneBloque(datos.getEnunciado(), "Texto original:") ||
                    !contieneBloque(datos.getEnunciado(), "Resumen de IA:"))) {
                throw new PublicacionInvalidaException("enunciado",
                        "La misión 6 debe incluir los párrafos «Texto original:» y «Resumen de IA:», ambos con texto.");
            }
        }
        desafio.setPublicadoDiagnostico(publicar);
        desafio.setOrdenDiagnostico(publicar ? orden : null);
        desafio.setMensajeNia(datos.getMensajeNia());
    }

    private boolean contieneBloque(String enunciado, String prefijo) {
        for (String parrafo : enunciado.strip().split("\\R(?:[ \\t]*\\R)+")) {
            String texto = parrafo.strip();
            if (texto.startsWith(prefijo) && !texto.substring(prefijo.length()).isBlank()) {
                return true;
            }
        }
        return false;
    }

    private boolean sinTexto(String texto) {
        return texto == null || texto.isBlank();
    }

    private void guardar(Desafio desafio) {
        try {
            repository.saveAndFlush(desafio);
        } catch (DataIntegrityViolationException ex) {
            if (ex.getMostSpecificCause() instanceof SQLException sql && "23505".equals(sql.getSQLState())) {
                throw ordenOcupado();
            }
            throw ex;
        }
    }

    private PublicacionInvalidaException ordenOcupado() {
        return new PublicacionInvalidaException("ordenDiagnostico", "Ya hay un desafío publicado en esa posición.");
    }

    private Desafio exigirDesafio(Long id, Optional<Desafio> resultado) {
        return resultado.orElseThrow(() -> new NoSuchElementException("No se encontró el desafío #" + id + "."));
    }
}
