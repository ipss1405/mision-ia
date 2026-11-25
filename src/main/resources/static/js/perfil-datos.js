const CLAVE_INTENTO_ACTUAL = "misionIaIntentoActual";

function formatearPorcentajeGeneral(aciertos, total) {
    const porcentaje = aciertos * 100 / total;
    const umbralPendiente = aciertos * 10 < total * 7 ? 70 : aciertos < total ? 100 : Infinity;
    let decimales = 0;
    let escala = 1;
    let visible = Math.round(porcentaje);

    // Mostrar la primera precisión que no redondea hasta un trofeo aún no logrado.
    while (visible >= umbralPendiente * escala) {
        decimales++;
        escala *= 10;
        visible = Math.round(porcentaje * escala);
    }

    return new Intl.NumberFormat("es-CL", { maximumFractionDigits: decimales }).format(visible / escala);
}

function leerIntentoActual() {
    try {
        return sessionStorage.getItem(CLAVE_INTENTO_ACTUAL);
    } catch {
        return null;
    }
}

async function consultarResultadoIntento(id = leerIntentoActual()) {
    if (!id) {
        return null;
    }
    try {
        const respuesta = await fetch(`/api/intentos/${encodeURIComponent(id)}/resultado`, { cache: "no-store" });
        return respuesta.ok ? await respuesta.json() : null;
    } catch {
        return null;
    }
}
