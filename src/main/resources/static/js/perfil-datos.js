const CLAVE_INTENTO_ACTUAL = "misionIaIntentoActual";

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
