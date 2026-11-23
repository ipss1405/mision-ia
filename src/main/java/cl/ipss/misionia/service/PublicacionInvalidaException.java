package cl.ipss.misionia.service;

public class PublicacionInvalidaException extends RuntimeException {

    private final String campo;

    public PublicacionInvalidaException(String campo, String mensaje) {
        super(mensaje);
        this.campo = campo;
    }

    public String getCampo() {
        return campo;
    }
}
