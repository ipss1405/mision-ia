let vocesNia = [];


/* =========================
   CARGAR VOCES DEL NAVEGADOR
   ========================= */

function cargarVocesNia() {

    if (!("speechSynthesis" in window)) {
        return;
    }

    vocesNia = window.speechSynthesis.getVoices();
}


/* Algunos navegadores cargan las voces
   unos instantes después de abrir la página */
cargarVocesNia();

if ("speechSynthesis" in window) {

    window.speechSynthesis.onvoiceschanged = () => {
        cargarVocesNia();
    };
}


/* =========================
   BUSCAR VOZ DE NIA
   ========================= */

function obtenerVozNia() {

    if (vocesNia.length === 0) {
        cargarVocesNia();
    }


    /*
     * Primero buscamos voces femeninas
     * conocidas en español.
     */
    const nombresFemeninos = [
        "Catalina",
        "Dalia",
        "Elvira",
        "Helena",
        "Sabina",
        "Monica",
        "Mónica",
        "Paulina",
        "Conchita",
        "Luciana",
        "Laura",
        "Sofia",
        "Sofía"
    ];


    /* PRIORIDAD 1:
       voz femenina + español de Chile */
    let voz = vocesNia.find((vozDisponible) => {

        const esChile =
            vozDisponible.lang
                .toLowerCase()
                .startsWith("es-cl");

        const pareceFemenina =
            nombresFemeninos.some((nombre) =>
                vozDisponible.name
                    .toLowerCase()
                    .includes(nombre.toLowerCase())
            );

        return esChile && pareceFemenina;
    });


    /* PRIORIDAD 2:
       cualquier voz de español de Chile */
    if (!voz) {

        voz = vocesNia.find((vozDisponible) =>
            vozDisponible.lang
                .toLowerCase()
                .startsWith("es-cl")
        );
    }


    /* PRIORIDAD 3:
       voz femenina en cualquier español */
    if (!voz) {

        voz = vocesNia.find((vozDisponible) => {

            const esEspanol =
                vozDisponible.lang
                    .toLowerCase()
                    .startsWith("es");

            const pareceFemenina =
                nombresFemeninos.some((nombre) =>
                    vozDisponible.name
                        .toLowerCase()
                        .includes(nombre.toLowerCase())
                );

            return esEspanol && pareceFemenina;
        });
    }


    /* PRIORIDAD 4:
       cualquier voz en español */
    if (!voz) {

        voz = vocesNia.find((vozDisponible) =>
            vozDisponible.lang
                .toLowerCase()
                .startsWith("es")
        );
    }


    return voz;
}


/* =========================
   HACER HABLAR A NIA
   ========================= */

function hablarNia(texto) {

    if (!("speechSynthesis" in window)) {

        console.warn(
            "El navegador no admite síntesis de voz."
        );

        return;
    }


    /* Detener una lectura anterior */
    window.speechSynthesis.cancel();


    const mensaje =
        new SpeechSynthesisUtterance(texto);


    /* Español de Chile */
    mensaje.lang = "es-CL";


    /*
     * Ajustes de personalidad de NIA:
     *
     * rate:
     * un poco más pausada.
     *
     * pitch:
     * ligeramente más aguda,
     * pero sin exagerar.
     */
    mensaje.rate = 0.90;
    mensaje.pitch = 1.10;
    mensaje.volume = 1;


    const vozNia =
        obtenerVozNia();


    if (vozNia) {

        mensaje.voice = vozNia;

        console.log(
            "Voz de NIA:",
            vozNia.name,
            vozNia.lang
        );
    }


    window.speechSynthesis.speak(mensaje);
}