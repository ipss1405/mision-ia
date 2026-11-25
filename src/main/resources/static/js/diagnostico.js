const misionCard = document.querySelector(".mision-card");
const misionIntroduccion = misionCard.querySelector(".mision-introduccion");
const misionContenido = misionCard.querySelector(".mision-contenido");
const misionPanel = document.querySelector(".mision-panel");
const veloDiagnostico = document.querySelector(".diagnostico-velo");
const progresoDiagnostico = document.getElementById("progresoDiagnostico");
const mensajeNia = document.querySelector(".nia-message");
const btnEscucharNia = document.getElementById("btnEscucharNia");
const PUNTOS_POR_ACIERTO = 350;
const GUARDIANES = ["Pixel", "Lumi", "Chispa"];
let intentoId;

// El orden fija el formato visual y la referencia metodológica del perfil.
const PRESENTACION_POR_ORDEN = [
    { tipo: "decision", icono: "⚠" },
    { tipo: "decision", icono: "🔎" },
    { tipo: "duelo", icono: "⚔️" },
    { tipo: "fuentes", icono: "🔗" },
    { tipo: "alucinacion", icono: "🕵️" },
    { tipo: "resumen", icono: "📝" },
    { tipo: "prompt", icono: "💬" },
    { tipo: "ruta", icono: "🚀" }
];

const PRESENTACION_GENERAL = { tipo: "decision", icono: "✦" };
let desafios = [];
let desafioActual = 0;
const respuestas = [];

function textoSeguro(texto) {
    const entidades = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return texto.replace(/[&<>"']/g, (caracter) => entidades[caracter]);
}

function adaptarDesafio(datos, indice) {
    const presentacion = PRESENTACION_POR_ORDEN[datos.orden - 1] ?? PRESENTACION_GENERAL;
    if (!Number.isInteger(datos.orden) || datos.orden < 1 || datos.puntaje !== PUNTOS_POR_ACIERTO ||
        typeof datos.titulo !== "string" || !datos.titulo.trim() ||
        typeof datos.enunciado !== "string" || !datos.enunciado.trim() ||
        !Array.isArray(datos.opciones) || datos.opciones.length < 2 || datos.opciones.length > 4 ||
        datos.opciones.some(({ id, texto }) => typeof id !== "string" || !/^[A-D]$/.test(id) ||
            typeof texto !== "string" || !texto.trim())) {
        throw new Error(`Datos inválidos para la misión ${indice + 1}.`);
    }

    const ids = new Set(datos.opciones.map(({ id }) => id));
    if (ids.size !== datos.opciones.length || !ids.has("A") || !ids.has("B") ||
        !ids.has(datos.respuestaCorrecta) || (presentacion.tipo === "alucinacion" && ids.size !== 4)) {
        throw new Error(`Alternativas inválidas para la misión ${datos.orden}.`);
    }

    const parrafos = datos.enunciado.trim().split(/\r?\n(?:[ \t]*\r?\n)+/).map((parrafo) => parrafo.trim());
    let original;
    let resumen;
    const consigna = parrafos.filter((parrafo) => {
        if (presentacion.tipo === "resumen" && parrafo.startsWith("Texto original:")) {
            original ||= parrafo.slice("Texto original:".length).trim();
            return false;
        }
        if (presentacion.tipo === "resumen" && parrafo.startsWith("Resumen de IA:")) {
            resumen ||= parrafo.slice("Resumen de IA:".length).trim();
            return false;
        }
        return true;
    });
    if (presentacion.tipo === "resumen" && (!original || !resumen)) {
        throw new Error(`Falta el contenido de la misión ${datos.orden}.`);
    }

    const [titulo = datos.titulo, ...resto] = consigna;
    const pregunta = resto.pop() ?? "";
    const citas = resto.map((parrafo) => {
        const separador = parrafo.indexOf(": ");
        return separador > 0
            ? { fuente: textoSeguro(parrafo.slice(0, separador)), texto: textoSeguro(parrafo.slice(separador + 2)) }
            : { texto: textoSeguro(parrafo) };
    });

    return {
        ...presentacion,
        orden: datos.orden,
        numero: indice + 1,
        puntaje: datos.puntaje,
        etiqueta: textoSeguro(datos.titulo),
        titulo: textoSeguro(titulo),
        pregunta: textoSeguro(pregunta),
        citas,
        original: textoSeguro(original ?? ""),
        resumen: textoSeguro(resumen ?? ""),
        mensajeNia: textoSeguro(datos.mensajeNia?.trim() || "Lee la misión antes de responder."),
        correcta: datos.respuestaCorrecta,
        explicacion: textoSeguro(datos.feedbackCorrecto ?? ""),
        explicacionError: datos.feedbackIncorrecto?.trim() ? textoSeguro(datos.feedbackIncorrecto) : undefined,
        opciones: datos.opciones.map(({ id, texto }) => {
            const esFragmento = presentacion.tipo === "alucinacion";
            const separador = esFragmento ? -1 : texto.indexOf(" - ");
            return {
                id,
                titulo: textoSeguro(separador < 0 ? texto : texto.slice(0, separador)),
                texto: textoSeguro(separador < 0 ? (esFragmento ? texto : "") : texto.slice(separador + 3))
            };
        })
    };
}

function crearOpciones(desafio) {

    /* DESAFÍO 5 */
    if (desafio.tipo === "alucinacion") {

        const fragmentos = desafio.opciones
            .map((opcion) => {

                return `
                    <button
                        type="button"
                        class="fragmento-ia accion-card"
                        data-respuesta="${opcion.id}">

                        <span class="fragmento-numero">
                            ${opcion.id}
                        </span>

                        <span class="fragmento-texto">
                            ${opcion.texto ?? ""}
                        </span>

                    </button>
                `;

            })
            .join("");


        return `
            <section class="respuesta-ia">

                <div class="respuesta-ia-header">

                    <span class="respuesta-ia-icono">
                        🤖
                    </span>

                    <div>

                        <strong>
                            COMPROBACIONES POSIBLES
                        </strong>

                        <span>
                            Analiza antes de confiar
                        </span>

                    </div>

                </div>


                <div class="fragmentos-ia">

                    ${fragmentos}

                </div>


                <p class="respuesta-ia-ayuda">
                    🔎 Selecciona una comprobación
                </p>

            </section>
        `;
    }


    /* DESAFÍO 6 */
    if (desafio.tipo === "resumen") {

        const opcionesResumen = desafio.opciones
            .map((opcion) => {

                return `
                    <button
                        type="button"
                        class="accion-card resumen-opcion"
                        data-respuesta="${opcion.id}">

                        <span class="accion-icono">
                            ${opcion.id}
                        </span>

                        <strong>
                            ${opcion.titulo}
                        </strong>

                        <span>
                            ${opcion.texto ?? ""}
                        </span>

                    </button>
                `;

            })
            .join("");


        return `
            <section class="comparacion-resumen">

                <div class="texto-comparacion">

                    <span class="comparacion-etiqueta">
                        📄 NECESIDADES DE COMPRA
                    </span>

                    <p>
                        ${desafio.original}
                    </p>

                </div>


                <div class="texto-comparacion">

                    <span class="comparacion-etiqueta">
                        🤖 RECOMENDACIÓN DE IA
                    </span>

                    <p>
                        ${desafio.resumen}
                    </p>

                </div>

            </section>


            <div class="resumen-opciones">

                ${opcionesResumen}

            </div>
        `;
    }


    /* RESTO */
    return desafio.opciones
        .map((opcion) => {

            let claseTipo = "";

            if (desafio.tipo === "duelo") {
                claseTipo = "duelo-card";
            }

            if (desafio.tipo === "fuentes") {
                claseTipo = "fuente-card";
            }

            if (desafio.tipo === "prompt") {
                claseTipo = "prompt-card";
            }

            if (desafio.tipo === "ruta") {
                claseTipo = "ruta-card";
            }


            return `
                <button
                    type="button"
                    class="accion-card ${claseTipo}"
                    data-respuesta="${opcion.id}">

                    <span class="accion-icono">
                        ${opcion.id}
                    </span>

                    <strong>
                        ${opcion.titulo}
                    </strong>

                    <span>
                        ${opcion.texto ?? ""}
                    </span>

                </button>
            `;

        })
        .join("");
}



function actualizarMarcador() {
    let puntos = 0;
    let racha = 0;

    respuestas.forEach((respuesta, indice) => {
        if (respuesta === null) {
            return;
        }

        if (respuesta === desafios[indice].correcta) {
            puntos += desafios[indice].puntaje;
            racha++;
        } else {
            racha = 0;
        }
    });

    document.querySelector("#puntajeDiagnostico").textContent = puntos;
    document.querySelector("#rachaDiagnostico").textContent = "x" + racha;
}

function mostrarProgreso(numeroActual) {
    const completadas = respuestas.filter((respuesta) => respuesta !== null).length;
    if (desafios.length > 12) {
        progresoDiagnostico.textContent = `${completadas} de ${desafios.length}`;
    } else {
        progresoDiagnostico.innerHTML = desafios.map(({ numero }) => {
            const estado = respuestas[numero - 1] !== null ? " es-completada" : "";
            const actual = numero === numeroActual ? " es-actual" : "";
            return `<span class="mision-nodo${estado}${actual}" aria-hidden="true"></span>`;
        }).join("");
    }
    const actual = numeroActual ? `. Misión actual ${numeroActual}` : "";
    progresoDiagnostico.setAttribute("aria-label", `${completadas} de ${desafios.length} misiones completadas${actual}`);
}

function animarMision() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
    }

    const transicion = { duration: 300, easing: "cubic-bezier(.2,.7,.2,1)" };
    misionPanel.getAnimations().forEach((animacion) => animacion.cancel());
    misionPanel.animate([
        { opacity: 0.68, transform: "translateY(10px) scale(.99)" },
        { opacity: 1, transform: "translateY(0) scale(1)" }
    ], transicion);
    veloDiagnostico.getAnimations().forEach((animacion) => animacion.cancel());
    veloDiagnostico.animate([{ opacity: 0 }, { opacity: 1 }], transicion);
}

let miniSplash;
let temporizadorMiniSplash;

function cerrarMiniSplash(devolverFoco = false) {
    if (!miniSplash) {
        return;
    }

    clearTimeout(temporizadorMiniSplash);
    const focoEnCierre = miniSplash.contains(document.activeElement);
    miniSplash.remove();
    miniSplash = null;
    if (devolverFoco && focoEnCierre) {
        document.getElementById("feedbackDiagnostico").focus({ preventScroll: true });
    }
}

function mostrarMiniSplash(desafio, acierto) {
    const guardian = GUARDIANES[(desafio.numero - 1) % GUARDIANES.length];
    const titulo = acierto ? "¡MISIÓN SUPERADA!" : "¡Ánimo!";
    const mensaje = acierto
        ? `<p class="mision-splash-puntos">¡Ganaste ${desafio.puntaje} puntos!</p><p>¡Excelente decisión!</p>`
        : "<p>Esta vez no sumaste puntos, pero aprendiste algo nuevo. ¡Sigamos!</p>";

    miniSplash = document.createElement("div");
    miniSplash.className = acierto ? "mision-splash es-celebracion" : "mision-splash";
    miniSplash.innerHTML = `
        <div class="mision-splash-panel">
            <button type="button" class="mision-splash-cierre" aria-label="Cerrar aviso">×</button>
            <img src="/img/${guardian.toLowerCase()}.webp" alt="" width="70" height="70">
            <div role="status">
                <strong>${titulo}</strong>
                ${mensaje}
            </div>
        </div>
    `;
    miniSplash.querySelector("button").addEventListener("click", () => cerrarMiniSplash(true));
    document.body.append(miniSplash);
    temporizadorMiniSplash = setTimeout(() => cerrarMiniSplash(true), 2000);
}

function mostrarDesafio(enfocar = false) {
    cerrarMiniSplash();
    const desafio = desafios[desafioActual];
    const esUltimo = desafio.numero === desafios.length;
    const contenedores = {
        alucinacion: "contenido-alucinacion",
        resumen: "contenido-resumen"
    };

    misionIntroduccion.innerHTML = `
        <div class="mision-encabezado">
            <span class="mision-numero">MISIÓN ${desafio.numero} DE ${desafios.length}</span>
            <span class="mision-activada">Misión activada</span>
        </div>

        <div class="mision-situacion">
            <span class="mision-icono">${desafio.icono}</span>
            <div class="diagnostico-consigna">
                <p class="mision-etiqueta">${desafio.etiqueta}</p>
                <h2 id="tituloMision" tabindex="-1">${desafio.titulo}</h2>
                ${desafio.citas.map(({ fuente, texto }) =>
                    fuente ? `<p><strong>${fuente}</strong> · «${texto}»</p>` : `<p>${texto}</p>`
                ).join("")}
                ${desafio.pregunta ? `<p>${desafio.pregunta}</p>` : ""}
            </div>
        </div>

    `;

    misionContenido.innerHTML = `
        <div class="${contenedores[desafio.tipo] ?? "acciones-grid"}">
            ${crearOpciones(desafio)}
        </div>

        <div class="diagnostico-feedback" id="feedbackDiagnostico" tabindex="-1"></div>

        <p id="avisoIntento" role="status" hidden></p>
        <div class="mision-continuar">
            <button type="button" class="btn-anterior" id="btnAnterior"
                ${desafioActual === 0 ? "disabled" : ""}>← Anterior</button>
            <button type="button" class="btn-primary" id="btnContinuar" disabled>
                ${esUltimo ? "Descubrir mi perfil →" : "Continuar misión →"}
            </button>
        </div>
    `;

    const tarjetas = misionCard.querySelectorAll(".accion-card");
    const btnAnterior = document.getElementById("btnAnterior");
    const btnContinuar = document.getElementById("btnContinuar");
    const feedback = document.getElementById("feedbackDiagnostico");

    function mostrarRespuesta(respuesta, enfocarFeedback) {
        const acierto = respuesta === desafio.correcta;
        const titulo = acierto ? "✓ Respuesta correcta" : "⚠ Respuesta incorrecta";
        const ultimoError = respuestas.slice(0, desafioActual + 1)
            .findLastIndex((opcion, indice) => opcion !== desafios[indice].correcta);
        const resultado = acierto
            ? `+${desafio.puntaje} puntos · Racha x${desafioActual - ultimoError}`
            : "Racha x0";

        feedback.classList.add(acierto ? "es-acierto" : "es-error");
        const explicacion = acierto ? desafio.explicacion : (desafio.explicacionError ?? desafio.explicacion);
        feedback.innerHTML = `
            <div class="mision-resultado"><strong>${titulo}</strong><span>${resultado}</span></div>
            <p>${explicacion}</p>
        `;
        cambiarEstadoNia(desafio.orden, acierto);
        mensajeNia.innerHTML = "<strong>NIA</strong>";

        tarjetas.forEach((tarjeta) => {
            tarjeta.disabled = true;
            const opcion = tarjeta.dataset.respuesta;
            if (opcion === respuesta) {
                tarjeta.classList.add("seleccionada");
            }
            if (opcion === desafio.correcta) {
                tarjeta.classList.add("opcion-correcta");
                tarjeta.insertAdjacentHTML("beforeend", '<small class="mision-distintivo"><span aria-hidden="true">✓</span> Opción correcta</small>');
            } else if (opcion === respuesta) {
                tarjeta.classList.add("opcion-elegida-error");
                tarjeta.insertAdjacentHTML("beforeend", '<small class="mision-distintivo">Tu respuesta · Incorrecta</small>');
            }
        });
        btnContinuar.disabled = false;

        if (enfocarFeedback) {
            feedback.focus();
        }
    }

    const respuestaGuardada = respuestas[desafioActual];
    if (respuestaGuardada !== null) {
        mostrarRespuesta(respuestaGuardada, false);
    } else {
        cambiarEstadoNia(desafio.orden);
        mensajeNia.innerHTML = `<strong>NIA</strong><p>${desafio.mensajeNia}</p>`;
        tarjetas.forEach((tarjeta) => {
            tarjeta.addEventListener("click", () => {
                if (respuestas[desafioActual] !== null) {
                    return;
                }

                const respuesta = tarjeta.dataset.respuesta;
                respuestas[desafioActual] = respuesta;
                actualizarMarcador();
                mostrarProgreso(desafio.numero);
                mostrarRespuesta(respuesta, true);
                mostrarMiniSplash(desafio, respuesta === desafio.correcta);
            });
        });
    }

    btnAnterior.addEventListener("click", () => {
        if (desafioActual > 0) {
            desafioActual--;
            mostrarDesafio(true);
        }
    });

    btnContinuar.addEventListener("click", () => {
        if (respuestas[desafioActual] === null) {
            return;
        }

        if (esUltimo) {
            cerrarMiniSplash();
            abrirPerfil();
        } else {
            desafioActual++;
            mostrarDesafio(true);
        }
    });

    mostrarProgreso(desafio.numero);
    animarMision();
    if (enfocar) {
        misionCard.querySelector("h2").focus();
    }
}

async function abrirPerfil() {
    const continuar = document.getElementById("btnContinuar");
    const anterior = document.getElementById("btnAnterior");
    continuar.disabled = true;
    anterior.disabled = true;
    try {
        const selecciones = respuestas.map((opcionSeleccionada, indice) => ({
            ordenDesafio: desafios[indice].orden, opcionSeleccionada
        }));
        const respuesta = await fetch(`/api/intentos/${encodeURIComponent(intentoId)}/finalizar`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(selecciones)
        });
        if (!respuesta.ok) {
            throw new Error(`Error HTTP ${respuesta.status} al finalizar el intento.`);
        }
        if (leerIntentoActual() === intentoId) {
            window.location.assign("/perfil");
        } else {
            window.location.assign("/");
        }
    } catch (error) {
        console.error("No se pudo finalizar el diagn?stico:", error);
        continuar.disabled = false;
        anterior.disabled = false;
        const aviso = document.getElementById("avisoIntento");
        aviso.hidden = false;
        aviso.textContent = "No se pudo guardar el resultado. Puedes volver a intentarlo.";
    }
}

btnEscucharNia.addEventListener("click", () => {
    const feedback = document.getElementById("feedbackDiagnostico")?.innerText;
    const consigna = [...misionCard.querySelectorAll(".diagnostico-consigna, .fragmentos-ia, .comparacion-resumen")]
        .map((bloque) => bloque.innerText)
        .join("\n");
    hablarNia(feedback || consigna || mensajeNia.innerText);
});

function recuperarRespuestasParaRevision(resultado) {
    const guardadas = resultado.respuestas;
    const vigente = guardadas.length === desafios.length && desafios.every(({ orden, opciones, correcta }, indice) => {
        const guardada = guardadas[indice];
        return guardada.ordenDesafio === orden &&
            opciones.some(({ id }) => id === guardada.opcionSeleccionada) &&
            (correcta === guardada.opcionSeleccionada) === guardada.correcta;
    });
    if (vigente) {
        respuestas.splice(0, desafios.length, ...guardadas.map(r => r.opcionSeleccionada));
        desafioActual = desafios.length - 1;
        actualizarMarcador();
    }
    return vigente;
}

function mostrarDiagnosticoNoDisponible(contenido, enlace) {
    misionIntroduccion.innerHTML = `
        <div class="mision-situacion">
            <div class="diagnostico-consigna">
                <h2 id="tituloMision">${contenido}</h2>
            </div>
        </div>
    `;
    misionContenido.innerHTML = `<div class="mision-continuar">${enlace}</div>`;
}

async function iniciarDiagnostico() {
    const revisar = new URLSearchParams(window.location.search).get("revisar") === "1";
    const regreso = window.performance.getEntriesByType("navigation")[0]?.type === "back_forward";
    try {
        if (!revisar && !regreso) {
            sessionStorage.removeItem(CLAVE_INTENTO_ACTUAL);
            sessionStorage.removeItem("mision-ia:resultado-diagnostico:v1");
        }
        intentoId = leerIntentoActual();
        const resultado = revisar || regreso ? await consultarResultadoIntento(intentoId) : null;
        if (revisar && !resultado) {
            mostrarDiagnosticoNoDisponible("El intento no está disponible para revisión.",
                '<a class="btn-primary" href="/perfil">Volver al perfil</a>');
            return;
        }
        let datos = resultado?.desafios;
        if (!resultado) {
            sessionStorage.removeItem(CLAVE_INTENTO_ACTUAL);
            const inicio = await fetch("/api/intentos", { method: "POST" });
            if (inicio.status === 409) {
                const problema = await inicio.json();
                mostrarDiagnosticoNoDisponible(textoSeguro(problema.detail),
                    '<a class="btn-primary" href="/">Volver al inicio</a>');
                return;
            }
            if (!inicio.ok) {
                throw new Error(`Error HTTP ${inicio.status} al crear el intento.`);
            }
            ({ intentoId, desafios: datos } = await inicio.json());
            sessionStorage.setItem(CLAVE_INTENTO_ACTUAL, intentoId);
        } else if (!datos?.length) {
            // Compatibilidad con intentos terminados antes de guardar la copia de sus desafíos.
            const respuesta = await fetch("/api/desafios/diagnostico");
            if (!respuesta.ok) throw new Error(`Error HTTP ${respuesta.status} al cargar las misiones.`);
            datos = await respuesta.json();
        }
        if (!Array.isArray(datos) || datos.some((dato, i) => i > 0 && dato.orden <= datos[i - 1].orden)) {
            throw new Error("Lista de misiones no válida.");
        }
        desafios = datos.map(adaptarDesafio);
        respuestas.push(...desafios.map(() => null));
        if (resultado && !recuperarRespuestasParaRevision(resultado)) {
            mostrarDiagnosticoNoDisponible("El diagnóstico cambió desde tu intento.",
                '<a class="btn-primary" href="/diagnostico">Realizar el diagnóstico actualizado</a>');
            return;
        }
        document.getElementById("maximoDiagnostico").textContent = ` / ${desafios.length * PUNTOS_POR_ACIERTO}`;
    } catch (error) {
        console.error("No fue posible cargar el diagnóstico:", error);
        mostrarDiagnosticoNoDisponible("No fue posible cargar la misión en este momento.",
            '<a class="btn-primary" href="/">Volver al inicio</a>');
        return;
    }

    document.querySelector(".mision-nia").hidden = false;
    mostrarDesafio();
}

window.addEventListener("pageshow", (evento) => {
    if (evento.persisted && intentoId !== leerIntentoActual()) {
        window.location.replace("/");
    }
});

iniciarDiagnostico();

