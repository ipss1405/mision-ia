package cl.ipss.misionia.entity;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;

@Entity
public class IntentoDiagnostico {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    private LocalDateTime fechaInicio = LocalDateTime.now();
    private LocalDateTime fechaFin;
    private boolean completado;
    private int puntajeJuego;
    private int respuestasCorrectas;
    private int mejorRacha;
    private int razonamientoLogico;
    private int pensamientoCritico;
    private int verificacionInformacion;
    private int resolucionProblemas;
    private int autonomiaIa;
    @Lob
    private String desafiosJson;

    protected IntentoDiagnostico() {}

    public IntentoDiagnostico(String desafiosJson) {
        this.desafiosJson = desafiosJson;
    }

    public UUID getId() { return id; }
    public boolean isCompletado() { return completado; }
    public int getPuntajeJuego() { return puntajeJuego; }
    public int getRespuestasCorrectas() { return respuestasCorrectas; }
    public int getMejorRacha() { return mejorRacha; }
    public String getDesafiosJson() { return desafiosJson; }

    public int puntos(Habilidad habilidad) {
        return switch (habilidad) {
            case RAZONAMIENTO_LOGICO -> razonamientoLogico;
            case PENSAMIENTO_CRITICO -> pensamientoCritico;
            case VERIFICACION_INFORMACION -> verificacionInformacion;
            case RESOLUCION_PROBLEMAS -> resolucionProblemas;
            case AUTONOMIA_IA -> autonomiaIa;
        };
    }

    public void completar(int puntaje, int correctas, int racha, Map<Habilidad, Integer> puntos) {
        puntajeJuego = puntaje;
        respuestasCorrectas = correctas;
        mejorRacha = racha;
        razonamientoLogico = puntos.getOrDefault(Habilidad.RAZONAMIENTO_LOGICO, 0);
        pensamientoCritico = puntos.getOrDefault(Habilidad.PENSAMIENTO_CRITICO, 0);
        verificacionInformacion = puntos.getOrDefault(Habilidad.VERIFICACION_INFORMACION, 0);
        resolucionProblemas = puntos.getOrDefault(Habilidad.RESOLUCION_PROBLEMAS, 0);
        autonomiaIa = puntos.getOrDefault(Habilidad.AUTONOMIA_IA, 0);
        fechaFin = LocalDateTime.now();
        completado = true;
    }
}
