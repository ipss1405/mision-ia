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

async function iniciarPerfil() {
    const resultado = await consultarResultadoIntento();
    if (!resultado) {
        return;
    }

    const { indicadores } = resultado;
    document.getElementById("perfilHabilidades").innerHTML = indicadores.map(({ nombre, porcentaje, nivel }) => `
        <li class="perfil-habilidad">
            <h3>${nombre}</h3>
            <div class="perfil-indicador">
                ${porcentaje === null ? "" : `<strong>${porcentaje} %</strong>`}
                <span>${nivel}</span>
            </div>
            ${porcentaje === null ? "" : `<progress value="${porcentaje}" max="100" aria-hidden="true"></progress>`}
        </li>
    `).join("");

    mostrarLecturaNia(resultado);
    mostrarMarcadorPerfil(resultado);
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
