function mostrarLecturaNia({ fortaleza, prioridad, equilibrado, indicadores }) {
    const mensajeFortaleza = document.getElementById("perfilFortaleza");
    const mensajePrioridad = document.getElementById("perfilPrioridad");
    const medidos = indicadores.filter(i => i.porcentaje !== null).length;

    if (equilibrado) {
        mensajeFortaleza.textContent = medidos === indicadores.length
            ? "Perfil equilibrado. Alcanzaste el nivel máximo en los cinco indicadores de esta misión."
            : "Alcanzaste el nivel máximo en las habilidades con evidencia.";
        mensajePrioridad.textContent = "No se detectó una prioridad de fortalecimiento en este diagnóstico.";
        return;
    }

    if (medidos > 1 && fortaleza.porcentaje === prioridad.porcentaje) {
        mensajeFortaleza.textContent = "Los indicadores con evidencia tienen el mismo resultado.";
        mensajePrioridad.textContent = `Puedes empezar por fortalecer ${prioridad.nombre} (${prioridad.porcentaje} %).`;
        return;
    }

    mensajeFortaleza.textContent = `Tu indicador más alto en esta misión es ${fortaleza.nombre} (${fortaleza.porcentaje} %).`;
    mensajePrioridad.textContent = `Te sugiero empezar por fortalecer ${prioridad.nombre} (${prioridad.porcentaje} %).`;
}

function mostrarMarcadorPerfil({ respuestasCorrectas, respuestas, puntajeJuego, puntajeMaximo, mejorRacha }) {
    const formatoPuntos = new Intl.NumberFormat("es-CL", { useGrouping: true });
    document.getElementById("perfilAciertos").textContent = `${respuestasCorrectas} de ${respuestas.length}`;
    document.getElementById("perfilPuntaje").textContent = `${formatoPuntos.format(puntajeJuego)} / ${formatoPuntos.format(puntajeMaximo)}`;
    document.getElementById("perfilRacha").textContent = `x${mejorRacha}`;
}

function mostrarLogrosPerfil({ respuestasCorrectas, respuestas, indicadores }) {
    const total = respuestas.length;
    if (total === 0 || !Number.isInteger(respuestasCorrectas) ||
        respuestasCorrectas < 0 || respuestasCorrectas > total) {
        return;
    }

    const perfecto = respuestasCorrectas === total;
    const plata = respuestasCorrectas * 10 >= total * 7;
    const trofeo = perfecto ? "Oro" : plata ? "Plata" : "Bronce";
    const porcentaje = formatearPorcentajeGeneral(respuestasCorrectas, total);
    const tarjeta = document.getElementById("perfilTrofeo");
    tarjeta.dataset.trofeo = trofeo.toLowerCase();
    document.getElementById("perfilTrofeoNombre").textContent = `Trofeo de ${trofeo}`;
    document.getElementById("perfilTrofeoPorcentaje").textContent = `${porcentaje} %`;

    const verificacion = indicadores.find(indicador => indicador.id === "verificacion")?.porcentaje;
    const guardianes = [
        { nombre: "Pixel", desbloqueado: true, condicion: "Completa el diagnóstico." },
        { nombre: "Lumi", desbloqueado: typeof verificacion === "number" && verificacion >= 70,
            condicion: "Alcanza al menos 70 % en Verificación de información." },
        { nombre: "Chispa", desbloqueado: perfecto, condicion: "Acierta en todas las misiones del diagnóstico." }
    ];

    document.getElementById("perfilGuardianes").innerHTML = guardianes.map(({ nombre, desbloqueado, condicion }) => `
        <li class="perfil-guardian ${desbloqueado ? "es-desbloqueado" : ""}">
            <details>
                <summary aria-label="${nombre}, ${desbloqueado ? "Desbloqueado" : "Bloqueado"}. Consultar requisito">
                    <img src="/img/${nombre.toLowerCase()}.webp" alt="" width="60" height="60">
                    <strong>${nombre}</strong>
                    <span class="perfil-guardian-estado"><span aria-hidden="true">${desbloqueado ? "✦" : "🔒"}</span>
                        ${desbloqueado ? "Desbloqueado" : "Bloqueado"}</span>
                    <span class="perfil-guardian-info" aria-hidden="true">i</span>
                </summary>
                <p>${condicion}</p>
            </details>
        </li>
    `).join("");

    tarjeta.hidden = false;
    document.getElementById("perfilColeccion").hidden = false;
}

async function iniciarPerfil() {
    const intentoId = leerIntentoActual();
    const resultado = await consultarResultadoIntento(intentoId);
    if (!resultado || intentoId !== leerIntentoActual()) {
        return;
    }

    const { indicadores } = resultado;
    const tarjetas = indicadores.map(({ id, nombre, porcentaje, nivel }) => `
        <li class="perfil-habilidad" data-habilidad="${id}">
            <h3>${nombre}</h3>
            <div class="perfil-indicador">
                ${porcentaje === null ? "" : `<strong>${porcentaje} %</strong>`}
                <span>${nivel}</span>
            </div>
            ${porcentaje === null ? "" : `<progress value="${porcentaje}" max="100" aria-hidden="true"></progress>`}
        </li>
    `).join("");

    document.getElementById("perfilColeccion").insertAdjacentHTML("beforebegin", tarjetas);

    mostrarLecturaNia(resultado);
    mostrarMarcadorPerfil(resultado);
    mostrarLogrosPerfil(resultado);
    if ("speechSynthesis" in window) {
        const botonVoz = document.getElementById("perfilEscucharNia");
        botonVoz.addEventListener("click", () => {
            const fortaleza = document.getElementById("perfilFortaleza").textContent;
            const prioridad = document.getElementById("perfilPrioridad").textContent;
            hablarNia(`${fortaleza} ${prioridad}`);
        });
        botonVoz.hidden = false;
    }
    document.getElementById("perfilSinResultados").hidden = true;
    document.getElementById("perfilResultados").hidden = false;
}

iniciarPerfil();


window.addEventListener("pageshow", (evento) => {
    if (evento.persisted) window.location.reload();
});
