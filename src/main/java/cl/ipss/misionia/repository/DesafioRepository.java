package cl.ipss.misionia.repository;

import java.util.List;
import java.util.Optional;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;

import cl.ipss.misionia.entity.Desafio;

public interface DesafioRepository extends JpaRepository<Desafio, Long> {

    List<Desafio> findAllByOrderByIdAsc();

    List<Desafio> findAllByActivoTrueOrderByIdAsc();

    List<Desafio> findAllByActivoTrueAndPublicadoDiagnosticoTrueOrderByOrdenDiagnosticoAsc();

    Optional<Desafio> findByOrdenDiagnostico(Integer orden);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Desafio> findOneById(Long id);
}
