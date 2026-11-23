package cl.ipss.misionia.entity;

public enum Habilidad {
    RAZONAMIENTO_LOGICO("Razonamiento lógico"),
    PENSAMIENTO_CRITICO("Pensamiento crítico"),
    VERIFICACION_INFORMACION("Verificación de información"),
    RESOLUCION_PROBLEMAS("Resolución de problemas"),
    AUTONOMIA_IA("Autonomía en el uso de IA");

    private final String etiqueta;

    Habilidad(String etiqueta) {
        this.etiqueta = etiqueta;
    }

    public String getEtiqueta() {
        return etiqueta;
    }
}
