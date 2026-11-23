package cl.ipss.misionia.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(uniqueConstraints = @UniqueConstraint(columnNames = {"intento_id", "orden_desafio"}))
public class RespuestaIntento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "intento_id", nullable = false)
    private IntentoDiagnostico intento;

    @Column(name = "orden_desafio", nullable = false)
    private int ordenDesafio;

    @Column(nullable = false, length = 1)
    private String opcionSeleccionada;

    private boolean correcta;

    protected RespuestaIntento() {
    }

    public RespuestaIntento(IntentoDiagnostico intento, int orden, String opcion, boolean correcta) {
        this.intento = intento;
        this.ordenDesafio = orden;
        this.opcionSeleccionada = opcion;
        this.correcta = correcta;
    }

    public int getOrdenDesafio() { return ordenDesafio; }
    public String getOpcionSeleccionada() { return opcionSeleccionada; }
    public boolean isCorrecta() { return correcta; }
}
