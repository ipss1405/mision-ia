const RECOMENDACIONES_POR_HABILIDAD = {
    logica: [
        ["Dato o inferencia", "Distingue qué información está realmente presente y qué conclusión fue agregada."],
        ["Encuentra el salto", "Detecta conclusiones que no se desprenden de los antecedentes disponibles."],
        ["Construye la conclusión", "Selecciona la conclusión mejor respaldada por la información disponible."]
    ],
    critico: [
        ["No todo lo convincente es correcto", "Analiza una respuesta de IA antes de aceptarla por su seguridad o redacción."],
        ["Compara argumentos", "Evalúa dos explicaciones y determina cuál está mejor fundamentada."],
        ["Decide con evidencia", "Construye una conclusión propia a partir de argumentos y antecedentes."]
    ],
    verificacion: [
        ["Busca la fuente", "Distingue entre una afirmación y una fuente que permite comprobarla."],
        ["Rastrea el dato", "Identifica el origen de una cifra o afirmación específica."],
        ["Antes de confiar", "Aplica un proceso completo de verificación antes de aceptar una respuesta de IA."]
    ],
    resolucion: [
        ["Define el problema", "Separa el problema real de la información secundaria."],
        ["Compara alternativas", "Evalúa distintas soluciones considerando sus ventajas y limitaciones."],
        ["Elige y justifica", "Selecciona una solución y explica por qué responde mejor al problema."]
    ],
    autonomia: [
        ["Pregunta con propósito", "Formula una consulta que apoye tu razonamiento en lugar de reemplazarlo."],
        ["IA como apoyo", "Decide qué parte del trabajo puede apoyar la IA y cuál requiere tu propio criterio."],
        ["Tu decisión final", "Utiliza información generada por IA y formula una conclusión propia."]
    ]
};

const ORIENTACION_POR_HABILIDAD = {
    logica: "Organizar la información y comprobar si una conclusión se desprende realmente de los datos.",
    critico: "Analizar argumentos, detectar supuestos y evaluar una respuesta antes de aceptarla.",
    verificacion: "Verificar fuentes, rastrear el origen de los datos y comprobar la información antes de confiar en una respuesta de IA.",
    resolucion: "Definir correctamente el problema, comparar alternativas y justificar la solución elegida.",
    autonomia: "Utilizar la IA como apoyo manteniendo tus propias decisiones, argumentos y conclusiones."
};

async function iniciarRuta() {
    const resultado = await consultarResultadoIntento();
    if (!resultado) {
        return;
    }

    const { fortaleza, prioridad, equilibrado, indicadores, respuestasCorrectas, respuestas } = resultado;
    const conEvidencia = indicadores.filter(i => i.porcentaje !== null);
    const empateGeneral = !equilibrado && conEvidencia.length > 1 && fortaleza.porcentaje === prioridad.porcentaje;
    const mensaje = document.getElementById("rutaMensajeNia");
    const habilidadRuta = prioridad ?? conEvidencia[0];
    const alcance = conEvidencia.length === indicadores.length ? "los cinco indicadores" : "las habilidades con evidencia";

    document.getElementById("rutaPrioridad").textContent = habilidadRuta.nombre;
    const porcentajeGeneral = formatearPorcentajeGeneral(respuestasCorrectas, respuestas.length);
    document.getElementById("rutaResultadoGeneral").textContent =
        `${respuestasCorrectas} de ${respuestas.length} · ${porcentajeGeneral} %`;
    document.getElementById("rutaEtiquetaIndicador").textContent = `Indicador en ${habilidadRuta.nombre}:`;
    document.getElementById("rutaIndicador").textContent = `${habilidadRuta.porcentaje} %`;
    document.getElementById("rutaFortaleza").textContent = equilibrado
        ? `Perfil equilibrado · ${fortaleza.porcentaje} % en ${alcance}`
        : empateGeneral
        ? `Mismo resultado en ${alcance} · ${fortaleza.porcentaje} %`
        : `${fortaleza.nombre} · ${fortaleza.porcentaje} %`;
    document.getElementById("rutaPrioridadResumen").textContent = prioridad
        ? `${prioridad.nombre} · ${prioridad.porcentaje} %`
        : "Sin prioridad detectada";
    if (!equilibrado) {
        document.getElementById("rutaDescripcionHabilidad").textContent = ORIENTACION_POR_HABILIDAD[habilidadRuta.id];
        document.getElementById("rutaOrientacion").hidden = false;
    }
    mensaje.textContent = equilibrado
        ? `Alcanzaste el nivel máximo en ${alcance}. No se detectó una prioridad de fortalecimiento.`
        : empateGeneral
        ? `Las habilidades con evidencia tienen el mismo indicador. Te sugiero practicar ${prioridad.nombre}.`
        : `Según tu desempeño, te sugiero fortalecer ${prioridad.nombre}.`;

    if (equilibrado) {
        document.getElementById("tituloRuta").textContent = "Ruta de profundización";
        document.getElementById("rutaTipo").textContent = "Profundización";
        document.getElementById("rutaGuiaNia").textContent = `Si quieres profundizar en ${habilidadRuta.nombre}, puedes aplicar estas sugerencias por tu cuenta.`;
    }

    const recomendaciones = RECOMENDACIONES_POR_HABILIDAD[habilidadRuta.id];
    document.getElementById("rutaRecomendaciones").innerHTML = recomendaciones.map(([titulo, descripcion], indice) => `
        <li class="ruta-recomendacion">
            <p class="ruta-recomendacion-etiqueta">Recomendación ${indice + 1}</p>
            <h3>${titulo}</h3>
            <p>${descripcion}</p>
        </li>
    `).join("");

    if ("speechSynthesis" in window) {
        const botonVoz = document.getElementById("rutaEscucharNia");
        botonVoz.addEventListener("click", () => {
            const guia = document.getElementById("rutaGuiaNia").textContent;
            hablarNia(`${mensaje.textContent} ${guia}`);
        });
        botonVoz.hidden = false;
    }

    document.getElementById("rutaSinResultados").hidden = true;
    document.getElementById("rutaResultados").hidden = false;
}

iniciarRuta();

window.addEventListener("pageshow", (evento) => {
    if (evento.persisted) window.location.reload();
});
