package cl.ipss.misionia.service;

import static cl.ipss.misionia.entity.Habilidad.*;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;
import cl.ipss.misionia.entity.Habilidad;
import cl.ipss.misionia.entity.IntentoDiagnostico;
import cl.ipss.misionia.entity.RespuestaIntento;
import cl.ipss.misionia.repository.IntentoDiagnosticoRepository;
import cl.ipss.misionia.repository.RespuestaIntentoRepository;

@Service
public class IntentoDiagnosticoService {

    private static final List<Map<Habilidad, Integer>> PESOS_ORIGINALES = List.of(
            Map.of(PENSAMIENTO_CRITICO, 2, RAZONAMIENTO_LOGICO, 1),
            Map.of(RAZONAMIENTO_LOGICO, 2, PENSAMIENTO_CRITICO, 1),
            Map.of(VERIFICACION_INFORMACION, 2, PENSAMIENTO_CRITICO, 1),
            Map.of(AUTONOMIA_IA, 2, RESOLUCION_PROBLEMAS, 1),
            Map.of(VERIFICACION_INFORMACION, 2, PENSAMIENTO_CRITICO, 1),
            Map.of(RESOLUCION_PROBLEMAS, 2, RAZONAMIENTO_LOGICO, 1),
            Map.of(PENSAMIENTO_CRITICO, 2, AUTONOMIA_IA, 1),
            Map.of(RAZONAMIENTO_LOGICO, 1, PENSAMIENTO_CRITICO, 1, VERIFICACION_INFORMACION, 1,
                    RESOLUCION_PROBLEMAS, 1, AUTONOMIA_IA, 1));
    private static final List<String> IDS_HABILIDAD = List.of("logica", "critico", "verificacion", "resolucion", "autonomia");
    private static final int PUNTOS_POR_ACIERTO = 350;

    private final IntentoDiagnosticoRepository intentos;
    private final RespuestaIntentoRepository respuestas;
    private final DesafioService desafios;
    private final ObjectMapper json;

    public IntentoDiagnosticoService(IntentoDiagnosticoRepository intentos,
            RespuestaIntentoRepository respuestas, DesafioService desafios, ObjectMapper json) {
        this.intentos = intentos;
        this.respuestas = respuestas;
        this.desafios = desafios;
        this.json = json;
    }

    @Transactional
    public IntentoCreado crear() {
        List<DesafioPublicado> participantes = desafios.listarDiagnostico().stream()
                .map(DesafioPublicado::desde).toList();
        if (participantes.isEmpty()) {
            throw new IllegalStateException("No hay misiones disponibles en este momento.");
        }
        if (participantes.stream().anyMatch(d -> d.orden() < 1 || d.habilidadPrincipal() == null ||
                d.puntaje() != PUNTOS_POR_ACIERTO || !opcionDisponible(d, d.respuestaCorrecta()))) {
            throw new IllegalStateException("La configuración del diagnóstico no es válida.");
        }
        UUID id = intentos.save(new IntentoDiagnostico(json.writeValueAsString(participantes))).getId();
        return new IntentoCreado(id, participantes);
    }

    @Transactional
    public Resultado finalizar(UUID id, List<Seleccion> selecciones) {
        IntentoDiagnostico intento = intentos.findOneById(id).orElseThrow();
        Map<Integer, String> porOrden = validarSelecciones(selecciones);
        List<DesafioPublicado> participantes = leerDesafios(intento);
        if (intento.isCompletado()) {
            List<RespuestaIntento> guardadas = respuestas.findAllByIntentoIdOrderByOrdenDesafioAsc(id);
            if (guardadas.size() != porOrden.size() || guardadas.stream().anyMatch(r ->
                    !r.getOpcionSeleccionada().equals(porOrden.get(r.getOrdenDesafio())))) {
                throw new IllegalStateException("El intento ya se completó con otras selecciones.");
            }
            return resumir(intento, guardadas, participantes);
        }

        if (participantes.isEmpty()) {
            throw new IllegalStateException("Este intento no conserva sus misiones. Inicia un diagnóstico nuevo.");
        }
        if (porOrden.size() != participantes.size() || participantes.stream().anyMatch(d -> !porOrden.containsKey(d.orden()))) {
            throw new IllegalArgumentException("Envía una selección para cada misión de este intento.");
        }
        List<RespuestaIntento> evaluadas = new ArrayList<>();
        Map<Habilidad, Integer> puntos = new EnumMap<>(Habilidad.class);
        int correctas = 0;
        int racha = 0;
        int mejorRacha = 0;
        for (DesafioPublicado desafio : participantes) {
            int orden = desafio.orden();
            String opcion = porOrden.get(orden);
            if (!opcionDisponible(desafio, opcion)) {
                throw new IllegalArgumentException("La opción seleccionada no está disponible en la misión " + orden + ".");
            }
            boolean correcta = opcion.equals(desafio.respuestaCorrecta());
            evaluadas.add(new RespuestaIntento(intento, orden, opcion, correcta));
            if (correcta) {
                correctas++;
                racha++;
                mejorRacha = Math.max(mejorRacha, racha);
                acumular(puntos, pesosDelDesafio(desafio));
            } else {
                racha = 0;
            }
        }
        respuestas.saveAll(evaluadas);
        intento.completar(correctas * PUNTOS_POR_ACIERTO, correctas, mejorRacha, puntos);
        return resumir(intento, evaluadas, participantes);
    }

    @Transactional(readOnly = true)
    public Resultado obtenerResultado(UUID id) {
        IntentoDiagnostico intento = intentos.findById(id)
                .filter(IntentoDiagnostico::isCompletado).orElseThrow(NoSuchElementException::new);
        return resumir(intento, respuestas.findAllByIntentoIdOrderByOrdenDesafioAsc(id), leerDesafios(intento));
    }

    private Map<Integer, String> validarSelecciones(List<Seleccion> selecciones) {
        if (selecciones == null || selecciones.isEmpty()) {
            throw new IllegalArgumentException("Envía las selecciones de este diagnóstico.");
        }
        Map<Integer, String> porOrden = new HashMap<>();
        for (Seleccion seleccion : selecciones) {
            if (seleccion == null || seleccion.ordenDesafio() == null || seleccion.ordenDesafio() < 1 ||
                    seleccion.opcionSeleccionada() == null ||
                    !seleccion.opcionSeleccionada().matches("[A-D]") ||
                    porOrden.putIfAbsent(seleccion.ordenDesafio(), seleccion.opcionSeleccionada()) != null) {
                throw new IllegalArgumentException("Cada misión debe tener una sola selección válida.");
            }
        }
        return porOrden;
    }

    private boolean opcionDisponible(DesafioPublicado desafio, String opcion) {
        return desafio.opciones().stream().anyMatch(alternativa -> alternativa.id().equals(opcion));
    }

    private List<DesafioPublicado> leerDesafios(IntentoDiagnostico intento) {
        // Los intentos anteriores a la captura conservan sus respuestas y resultados.
        return intento.getDesafiosJson() == null ? List.of()
                : json.readValue(intento.getDesafiosJson(), new TypeReference<List<DesafioPublicado>>() {});
    }

    private Map<Habilidad, Integer> pesosDelDesafio(DesafioPublicado desafio) {
        if (desafio.orden() <= PESOS_ORIGINALES.size()) {
            return PESOS_ORIGINALES.get(desafio.orden() - 1);
        }
        Map<Habilidad, Integer> pesos = new EnumMap<>(Habilidad.class);
        pesos.put(desafio.habilidadPrincipal(), 2);
        if (desafio.habilidadSecundaria() != null) {
            pesos.merge(desafio.habilidadSecundaria(), 1, Integer::sum);
        }
        return pesos;
    }

    private void acumular(Map<Habilidad, Integer> totales, Map<Habilidad, Integer> pesos) {
        pesos.forEach((habilidad, peso) -> totales.merge(habilidad, peso, Integer::sum));
    }

    private Resultado resumir(IntentoDiagnostico intento, List<RespuestaIntento> guardadas,
            List<DesafioPublicado> participantes) {
        Map<Habilidad, Integer> maximos = new EnumMap<>(Habilidad.class);
        if (participantes.isEmpty()) {
            // Los resultados sin captura son anteriores a la ampliación del banco.
            guardadas.forEach(r -> acumular(maximos, PESOS_ORIGINALES.get(r.getOrdenDesafio() - 1)));
        } else {
            participantes.forEach(d -> acumular(maximos, pesosDelDesafio(d)));
        }
        List<Indicador> indicadores = new ArrayList<>();
        for (Habilidad habilidad : Habilidad.values()) {
            int maximo = maximos.getOrDefault(habilidad, 0);
            int puntos = intento.puntos(habilidad);
            Integer porcentaje = maximo == 0 ? null : (int) Math.round(puntos * 100.0 / maximo);
            String nivel = porcentaje == null ? "Sin evidencia suficiente"
                    : porcentaje < 40 ? "Prioridad de fortalecimiento"
                    : porcentaje < 70 ? "En desarrollo" : "Fortaleza inicial";
            indicadores.add(new Indicador(IDS_HABILIDAD.get(habilidad.ordinal()), habilidad.getEtiqueta(),
                    puntos, maximo, porcentaje, nivel));
        }
        List<Indicador> conEvidencia = indicadores.stream().filter(i -> i.maximo() > 0).toList();
        boolean equilibrado = conEvidencia.stream().allMatch(i -> i.porcentaje() == 100);
        Comparator<Indicador> porPorcentaje = Comparator.comparingInt(Indicador::porcentaje);
        return new Resultado(intento.getRespuestasCorrectas(), intento.getPuntajeJuego(), intento.getMejorRacha(),
                guardadas.size() * PUNTOS_POR_ACIERTO, indicadores,
                conEvidencia.stream().max(porPorcentaje).orElseThrow(),
                equilibrado ? null : conEvidencia.stream().min(porPorcentaje).orElseThrow(),
                equilibrado, guardadas.stream().map(r ->
                        new SeleccionEvaluada(r.getOrdenDesafio(), r.getOpcionSeleccionada(), r.isCorrecta())).toList(),
                participantes);
    }

    public record Seleccion(Integer ordenDesafio, String opcionSeleccionada) {}
    public record SeleccionEvaluada(int ordenDesafio, String opcionSeleccionada, boolean correcta) {}
    public record IntentoCreado(UUID intentoId, List<DesafioPublicado> desafios) {}
    public record Indicador(String id, String nombre, int puntos, int maximo, Integer porcentaje, String nivel) {}
    public record Resultado(int respuestasCorrectas, int puntajeJuego, int mejorRacha, int puntajeMaximo,
            List<Indicador> indicadores, Indicador fortaleza, Indicador prioridad, boolean equilibrado,
            List<SeleccionEvaluada> respuestas, List<DesafioPublicado> desafios) {}
}
