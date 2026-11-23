package cl.ipss.misionia.service;

import java.util.List;
import cl.ipss.misionia.entity.Desafio;
import cl.ipss.misionia.entity.Habilidad;

public record DesafioPublicado(
        int orden, String titulo, String enunciado, List<Opcion> opciones,
        String respuestaCorrecta, String feedbackCorrecto, String feedbackIncorrecto,
        String mensajeNia, int puntaje, Habilidad habilidadPrincipal, Habilidad habilidadSecundaria) {

    public static DesafioPublicado desde(Desafio desafio) {
        List<Opcion> opciones = List.of(
                new Opcion("A", desafio.getOpcionA()), new Opcion("B", desafio.getOpcionB()),
                new Opcion("C", desafio.getOpcionC()), new Opcion("D", desafio.getOpcionD()))
                .stream().filter(opcion -> opcion.texto() != null && !opcion.texto().isBlank()).toList();
        return new DesafioPublicado(desafio.getOrdenDiagnostico(), desafio.getTitulo(),
                desafio.getEnunciado(), opciones, desafio.getRespuestaCorrecta(), desafio.getFeedbackCorrecto(),
                desafio.getFeedbackIncorrecto(), desafio.getMensajeNia(), desafio.getPuntajeJuego(),
                desafio.getHabilidadPrincipal(), desafio.getHabilidadSecundaria());
    }
    public record Opcion(String id, String texto) {}
}
