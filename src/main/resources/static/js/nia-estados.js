const niaImagen = document.querySelector(".nia-personaje img");

function cambiarEstadoNia(numeroDesafio, acierto) {

    if (!niaImagen) {
        return;
    }

    if (typeof acierto === "boolean") {
        niaImagen.src = acierto ? "/img/nia-celebra.png" : "/img/nia-alerta.png";
        return;
    }

    let imagen = "/img/nia.png";


    /* DESAFÍOS 1 Y 7:
       NIA acompaña de forma normal */
    if (numeroDesafio === 1 || numeroDesafio === 7) {
        imagen = "/img/nia.png";
    }


    /* DESAFÍOS 2, 3, 4 Y 6:
       NIA está pensando */
    if (
        numeroDesafio === 2 ||
        numeroDesafio === 3 ||
        numeroDesafio === 4 ||
        numeroDesafio === 6
    ) {
        imagen = "/img/nia-pensando.png";
    }


    /* DESAFÍO 5:
       NIA está en modo alerta */
    if (numeroDesafio === 5) {
        imagen = "/img/nia-alerta.png";
    }


    /* DESAFÍO 8:
       NIA celebra el último desafío */
    if (numeroDesafio === 8) {
        imagen = "/img/nia-celebra.png";
    }


    niaImagen.src = imagen;
}
