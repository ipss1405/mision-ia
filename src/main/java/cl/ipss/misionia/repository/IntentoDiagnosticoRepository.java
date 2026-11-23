package cl.ipss.misionia.repository;

import java.util.Optional;
import java.util.UUID;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import cl.ipss.misionia.entity.IntentoDiagnostico;

public interface IntentoDiagnosticoRepository extends JpaRepository<IntentoDiagnostico, UUID> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<IntentoDiagnostico> findOneById(UUID id);
}
