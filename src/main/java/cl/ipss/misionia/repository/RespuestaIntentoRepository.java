package cl.ipss.misionia.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import cl.ipss.misionia.entity.RespuestaIntento;

public interface RespuestaIntentoRepository extends JpaRepository<RespuestaIntento, Long> {
    List<RespuestaIntento> findAllByIntentoIdOrderByOrdenDesafioAsc(UUID intentoId);
}
