package cl.ipss.misionia.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

@Entity
public class Desafio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Ingresa un título.")
    @Size(max = 160)
    @Column(nullable = false, length = 160)
    private String titulo;

    @NotBlank(message = "Ingresa el enunciado.")
    @Size(max = 5000)
    @Column(nullable = false, length = 5000)
    private String enunciado;

    @NotBlank(message = "Ingresa el texto de la opción A.")
    @Size(max = 1000)
    @Column(name = "opcion_a", nullable = false, length = 1000)
    private String opcionA;

    @NotBlank(message = "Ingresa el texto de la opción B.")
    @Size(max = 1000)
    @Column(name = "opcion_b", nullable = false, length = 1000)
    private String opcionB;

    @Size(max = 1000)
    @Column(name = "opcion_c", length = 1000)
    private String opcionC;

    @Size(max = 1000)
    @Column(name = "opcion_d", length = 1000)
    private String opcionD;

    @NotBlank(message = "Selecciona la alternativa correcta.")
    @Pattern(regexp = "[A-D]", message = "Selecciona A, B, C o D.")
    @Column(nullable = false, length = 1)
    private String respuestaCorrecta;

    @NotNull(message = "Selecciona la habilidad principal.")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private Habilidad habilidadPrincipal;

    @Enumerated(EnumType.STRING)
    @Column(length = 32)
    private Habilidad habilidadSecundaria;

    @NotNull(message = "Ingresa el puntaje.")
    @Positive(message = "El puntaje debe ser mayor que cero.")
    @Column(nullable = false)
    private Integer puntajeJuego = 350;

    @Size(max = 2000)
    @Column(length = 2000)
    private String feedbackCorrecto;

    @Size(max = 2000)
    @Column(length = 2000)
    private String feedbackIncorrecto;

    @Column(nullable = false)
    private boolean activo = true;

    @Column(name = "publicado_diagnostico")
    private Boolean publicadoDiagnostico = false;

    @Min(value = 1, message = "El orden debe ser un entero positivo.")
    @Column(name = "orden_diagnostico", unique = true)
    private Integer ordenDiagnostico;

    @Size(max = 500)
    @Column(name = "mensaje_nia", length = 500)
    private String mensajeNia;

    public boolean isPublicadoDiagnostico() {
        return Boolean.TRUE.equals(publicadoDiagnostico);
    }

    public void setPublicadoDiagnostico(boolean publicadoDiagnostico) {
        this.publicadoDiagnostico = publicadoDiagnostico;
    }

    public Integer getOrdenDiagnostico() {
        return ordenDiagnostico;
    }

    public void setOrdenDiagnostico(Integer ordenDiagnostico) {
        this.ordenDiagnostico = ordenDiagnostico;
    }

    public String getMensajeNia() {
        return mensajeNia;
    }

    public void setMensajeNia(String mensajeNia) {
        this.mensajeNia = mensajeNia;
    }

    @AssertTrue(message = "La alternativa correcta debe tener texto.")
    public boolean isRespuestaDisponible() {
        if ("C".equals(respuestaCorrecta)) {
            return opcionC != null && !opcionC.isBlank();
        }
        if ("D".equals(respuestaCorrecta)) {
            return opcionD != null && !opcionD.isBlank();
        }
        return true;
    }

    public Long getId() {
        return id;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getEnunciado() {
        return enunciado;
    }

    public void setEnunciado(String enunciado) {
        this.enunciado = enunciado;
    }

    public String getOpcionA() {
        return opcionA;
    }

    public void setOpcionA(String opcionA) {
        this.opcionA = opcionA;
    }

    public String getOpcionB() {
        return opcionB;
    }

    public void setOpcionB(String opcionB) {
        this.opcionB = opcionB;
    }

    public String getOpcionC() {
        return opcionC;
    }

    public void setOpcionC(String opcionC) {
        this.opcionC = opcionC;
    }

    public String getOpcionD() {
        return opcionD;
    }

    public void setOpcionD(String opcionD) {
        this.opcionD = opcionD;
    }

    public String getRespuestaCorrecta() {
        return respuestaCorrecta;
    }

    public void setRespuestaCorrecta(String respuestaCorrecta) {
        this.respuestaCorrecta = respuestaCorrecta;
    }

    public Habilidad getHabilidadPrincipal() {
        return habilidadPrincipal;
    }

    public void setHabilidadPrincipal(Habilidad habilidadPrincipal) {
        this.habilidadPrincipal = habilidadPrincipal;
    }

    public Habilidad getHabilidadSecundaria() {
        return habilidadSecundaria;
    }

    public void setHabilidadSecundaria(Habilidad habilidadSecundaria) {
        this.habilidadSecundaria = habilidadSecundaria;
    }

    public Integer getPuntajeJuego() {
        return puntajeJuego;
    }

    public void setPuntajeJuego(Integer puntajeJuego) {
        this.puntajeJuego = puntajeJuego;
    }

    public String getFeedbackCorrecto() {
        return feedbackCorrecto;
    }

    public void setFeedbackCorrecto(String feedbackCorrecto) {
        this.feedbackCorrecto = feedbackCorrecto;
    }

    public String getFeedbackIncorrecto() {
        return feedbackIncorrecto;
    }

    public void setFeedbackIncorrecto(String feedbackIncorrecto) {
        this.feedbackIncorrecto = feedbackIncorrecto;
    }

    public boolean isActivo() {
        return activo;
    }

    public void setActivo(boolean activo) {
        this.activo = activo;
    }
}
