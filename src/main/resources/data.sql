-- Compatibilidad con bases H2 que Hibernate creó antes de fijar los nombres opcion_a a opcion_d.
-- Si solo existe la columna anterior, renombrarla conserva los datos y sus restricciones.
-- Si ambas existen, quitar la anterior solo en tablas vacías. Con registros, recuperar
-- los valores faltantes y archivar la columna anterior para conservar cualquier diferencia.
EXECUTE IMMEDIATE CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'PUBLIC' AND table_name = 'DESAFIO' AND column_name = 'OPCIONA')
    THEN CASE
        WHEN NOT EXISTS (SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'PUBLIC' AND table_name = 'DESAFIO' AND column_name = 'OPCION_A')
        THEN 'ALTER TABLE desafio ALTER COLUMN opciona RENAME TO opcion_a'
        WHEN NOT EXISTS (SELECT 1 FROM desafio)
        THEN 'ALTER TABLE desafio DROP COLUMN opciona'
        ELSE 'UPDATE desafio SET opcion_a = opciona WHERE opcion_a IS NULL AND opciona IS NOT NULL'
    END
    ELSE 'UPDATE desafio SET titulo = titulo WHERE FALSE'
END;

EXECUTE IMMEDIATE CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'PUBLIC' AND table_name = 'DESAFIO' AND column_name = 'OPCIONB')
    THEN CASE
        WHEN NOT EXISTS (SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'PUBLIC' AND table_name = 'DESAFIO' AND column_name = 'OPCION_B')
        THEN 'ALTER TABLE desafio ALTER COLUMN opcionb RENAME TO opcion_b'
        WHEN NOT EXISTS (SELECT 1 FROM desafio)
        THEN 'ALTER TABLE desafio DROP COLUMN opcionb'
        ELSE 'UPDATE desafio SET opcion_b = opcionb WHERE opcion_b IS NULL AND opcionb IS NOT NULL'
    END
    ELSE 'UPDATE desafio SET titulo = titulo WHERE FALSE'
END;

EXECUTE IMMEDIATE CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'PUBLIC' AND table_name = 'DESAFIO' AND column_name = 'OPCIONC')
    THEN CASE
        WHEN NOT EXISTS (SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'PUBLIC' AND table_name = 'DESAFIO' AND column_name = 'OPCION_C')
        THEN 'ALTER TABLE desafio ALTER COLUMN opcionc RENAME TO opcion_c'
        WHEN NOT EXISTS (SELECT 1 FROM desafio)
        THEN 'ALTER TABLE desafio DROP COLUMN opcionc'
        ELSE 'UPDATE desafio SET opcion_c = opcionc WHERE opcion_c IS NULL AND opcionc IS NOT NULL'
    END
    ELSE 'UPDATE desafio SET titulo = titulo WHERE FALSE'
END;

EXECUTE IMMEDIATE CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'PUBLIC' AND table_name = 'DESAFIO' AND column_name = 'OPCIOND')
    THEN CASE
        WHEN NOT EXISTS (SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'PUBLIC' AND table_name = 'DESAFIO' AND column_name = 'OPCION_D')
        THEN 'ALTER TABLE desafio ALTER COLUMN opciond RENAME TO opcion_d'
        WHEN NOT EXISTS (SELECT 1 FROM desafio)
        THEN 'ALTER TABLE desafio DROP COLUMN opciond'
        ELSE 'UPDATE desafio SET opcion_d = opciond WHERE opcion_d IS NULL AND opciond IS NOT NULL'
    END
    ELSE 'UPDATE desafio SET titulo = titulo WHERE FALSE'
END;

-- Las columnas archivadas no deben bloquear altas ni volver a copiarse en el próximo arranque.
ALTER TABLE desafio ALTER COLUMN IF EXISTS opciona DROP NOT NULL;
ALTER TABLE desafio ALTER COLUMN IF EXISTS opcionb DROP NOT NULL;
ALTER TABLE desafio ALTER COLUMN IF EXISTS opciona RENAME TO opcion_a_legado;
ALTER TABLE desafio ALTER COLUMN IF EXISTS opcionb RENAME TO opcion_b_legado;
ALTER TABLE desafio ALTER COLUMN IF EXISTS opcionc RENAME TO opcion_c_legado;
ALTER TABLE desafio ALTER COLUMN IF EXISTS opciond RENAME TO opcion_d_legado;

-- Retirar solo el CHECK de orden heredado del banco de ocho misiones.
EXECUTE IMMEDIATE COALESCE((
    SELECT 'ALTER TABLE desafio DROP CONSTRAINT "' || REPLACE(t.constraint_name, '"', '""') || '"'
    FROM information_schema.table_constraints t
    JOIN information_schema.check_constraints c
        USING (constraint_catalog, constraint_schema, constraint_name)
    WHERE t.table_schema = 'PUBLIC' AND t.table_name = 'DESAFIO'
      AND REGEXP_REPLACE(c.check_clause, '[^A-Z0-9_<>=]', '') IN
          ('ORDEN_DIAGNOSTICO>=1ANDORDEN_DIAGNOSTICO<=8', 'ORDEN_DIAGNOSTICO<=8ANDORDEN_DIAGNOSTICO>=1',
           'ORDEN_DIAGNOSTICO<=8')
    FETCH FIRST 1 ROW ONLY
), 'UPDATE desafio SET titulo = titulo WHERE FALSE');
ALTER TABLE desafio ADD CONSTRAINT IF NOT EXISTS ck_desafio_orden_positivo CHECK (orden_diagnostico >= 1);

-- Carga inicial del banco administrativo.
INSERT INTO desafio (titulo, enunciado, opcion_a, opcion_b, opcion_c, opcion_d, respuesta_correcta,
    habilidad_principal, habilidad_secundaria, feedback_correcto, feedback_incorrecto, puntaje_juego, activo)
SELECT titulo, enunciado, opcion_a, opcion_b, opcion_c, opcion_d, respuesta_correcta,
    habilidad_principal, habilidad_secundaria, feedback_correcto, feedback_incorrecto, 350, TRUE
FROM (VALUES
    ('LA RESPUESTA IMPOSIBLE', 'Un estudiante le pregunta a una IA: «¿Puedes decirme si aprobaré el examen de mañana?»

Respuesta de la IA: Sí. Como has estudiado seis horas esta semana, tienes un 92 % de probabilidad de aprobar.

¿Qué parte de la respuesta presenta el principal problema?', 'El 92 % no se puede deducir de las horas de estudio.', 'Seis horas representan poca preparación para ese examen.', 'La estimación debería expresarse como un rango de probabilidades.', 'La respuesta debería indicar si las seis horas fueron consecutivas.', 'A', 'PENSAMIENTO_CRITICO', 'RAZONAMIENTO_LOGICO', 'Seis horas de estudio, por sí solas, no permiten calcular una probabilidad de aprobación. Expresar el 92 % como un rango tampoco le daría respaldo.', 'Seis horas de estudio, por sí solas, no permiten calcular una probabilidad de aprobación. Expresar el 92 % como un rango tampoco le daría respaldo.'),
    ('DATO O CONCLUSIÓN', 'De 200 estudiantes encuestados, 136 usan herramientas de IA al menos una vez por semana para estudiar.

Conclusión de la IA: Esto demuestra que los estudiantes que usan IA obtienen mejores calificaciones.

¿Cuál es el problema principal de esa conclusión?', 'Hace falta saber si la muestra representa al conjunto de estudiantes.', 'La encuesta mide uso de IA, pero no compara calificaciones.', 'Habría que distinguir el uso semanal del uso diario de IA.', 'Primero hay que separar las respuestas según la herramienta utilizada.', 'B', 'RAZONAMIENTO_LOGICO', 'PENSAMIENTO_CRITICO', 'El dato mide la frecuencia de uso. Sin calificaciones de ambos grupos no se puede establecer una diferencia. Incluso si se observara una diferencia, eso por sí solo no demostraría que la IA la causó.', 'El dato mide la frecuencia de uso. Sin calificaciones de ambos grupos no se puede establecer una diferencia. Incluso si se observara una diferencia, eso por sí solo no demostraría que la IA la causó.'),
    ('DUELO DE IA', '¿Las bebidas energéticas mejoran el rendimiento académico?

IA A: Sí. Contienen cafeína, por lo que mejoran la concentración y hacen que los estudiantes rindan mejor.

IA B: La cafeína puede aumentar temporalmente el estado de alerta, pero eso no permite concluir por sí solo que mejore el rendimiento académico. Habría que considerar evidencia, dosis, sueño y otros factores.

¿Cuál de las dos respuestas está mejor fundamentada y por qué?', 'IA A - La concentración explica por qué mejoraría el rendimiento.', 'IA B - Separa un posible efecto inmediato del resultado académico.', 'IA A - Identifica un ingrediente concreto que se puede verificar.', 'Ambas por igual - Mencionan la cafeína y ninguna presenta estudios.', 'B', 'PENSAMIENTO_CRITICO', 'VERIFICACION_INFORMACION', 'La IA B limita su conclusión a lo que puede sostener. Identificar la cafeína o un posible cambio de alerta no demuestra una mejora del rendimiento académico.', 'La IA B limita su conclusión a lo que puede sostener. Identificar la cafeína o un posible cambio de alerta no demuestra una mejora del rendimiento académico.'),
    ('BUSCA LA EVIDENCIA', 'Necesitas comprobar una afirmación antes de incluirla en un informe.

Afirmación de la IA: Una nueva norma permite que las instituciones de educación superior utilicen reconocimiento facial obligatorio para registrar asistencia.

¿Qué fuente tendría mayor peso para comprobar qué permite la norma?', 'Publicación comentada - Un hilo donde varias instituciones comentan cómo aplicarían la medida.', 'Análisis especializado - Una columna técnica que interpreta los cambios de la norma.', 'Publicación oficial - El texto vigente publicado por el organismo competente.', 'Síntesis de noticias - Una revisión de prensa elaborada por otra IA que coincide con la afirmación.', 'C', 'VERIFICACION_INFORMACION', 'RESOLUCION_PROBLEMAS', 'El texto oficial permite revisar qué dice la norma, a quién se aplica y en qué condiciones. Las interpretaciones y resúmenes sirven para orientarse o localizar la fuente.', 'El texto oficial permite revisar qué dice la norma, a quién se aplica y en qué condiciones. Las interpretaciones y resúmenes sirven para orientarse o localizar la fuente.'),
    ('ATRAPA LA ALUCINACIÓN', 'Una IA presenta cuatro afirmaciones sobre seguridad digital.

¿Cuál afirmación requiere una verificación especial antes de aceptarla como un hecho?', 'Las contraseñas largas y difíciles de predecir ofrecen mayor resistencia frente a intentos de adivinarlas.', 'La autenticación en dos pasos añade una segunda comprobación de identidad después de ingresar la contraseña.', 'Los servicios pueden recomendar cambiar la contraseña cuando sospechan que las credenciales de una cuenta se han filtrado.', 'Una norma internacional exige a las plataformas renovar automáticamente las contraseñas de sus usuarios cada 30 días.', 'D', 'VERIFICACION_INFORMACION', 'PENSAMIENTO_CRITICO', 'Buena detección. El fragmento atribuye a una norma internacional una obligación general con un plazo concreto. Antes de darla por cierta, hay que identificar la norma y comprobar a quién se aplica y qué exige.', 'La afirmación que elegiste puede ser razonable. Busca el fragmento que presenta una obligación general con un plazo concreto sin identificar la norma que la establece.'),
    ('RESUMEN ALTERADO', 'Compara lo que afirma el estudio con el resumen de la IA.

Texto original: Un estudio encontró una asociación entre dormir menos de seis horas y un menor rendimiento promedio en una muestra de estudiantes. Los investigadores señalaron que los resultados no permiten afirmar que dormir poco sea la única causa del menor rendimiento.

Resumen de IA: El estudio demostró que dormir menos de seis horas provoca un menor rendimiento académico.

¿Qué cambió en el significado del resumen?', 'El nivel de detalle - Se acortó la descripción y se mantuvo la fuerza de la conclusión.', 'La fuerza de la conclusión - Una asociación observada pasó a presentarse como causa demostrada.', 'El criterio de comparación - El límite de seis horas pasó a incluir a quienes durmieron exactamente seis.', 'La medida del rendimiento - El resumen reemplaza el promedio por el resultado de un examen.', 'B', 'RAZONAMIENTO_LOGICO', 'PENSAMIENTO_CRITICO', 'El original describe una asociación observada. El resumen dice que dormir poco «provoca» el menor rendimiento y convierte esa observación en una afirmación causal.', 'El original describe una asociación observada. El resumen dice que dormir poco «provoca» el menor rendimiento y convierte esa observación en una afirmación causal.'),
    ('PREGUNTA MEJOR', 'Una estudiante necesita entender por qué dos artículos llegan a conclusiones distintas sobre el mismo tema.

Prompt inicial: Hazme el trabajo y dime cuál artículo tiene razón.

¿Qué revisión le ayuda a entender la diferencia y llegar a su propia conclusión?', 'Comparar los estudios - Muéstrame cómo investigó cada artículo y qué pruebas aporta. Hazme preguntas para que yo saque mi conclusión.', 'Revisar una conclusión - Dime cuál está mejor respaldado, escribe una conclusión y explícame luego cómo llegaste a ella.', 'Ordenar las ideas - Resume las ideas principales en una tabla y señala cuál de los dos artículos te parece más convincente.', 'Aclarar los textos - Explícame los artículos en palabras más sencillas y elige cuál usarías para responder al trabajo.', 'A', 'AUTONOMIA_IA', 'RESOLUCION_PROBLEMAS', 'Comparar cómo se hizo cada estudio y qué evidencia aporta ayuda a entender la discrepancia. Las preguntas guían a la estudiante para que formule su propia conclusión.', 'Comparar cómo se hizo cada estudio y qué evidencia aporta ayuda a entender la discrepancia. Las preguntas guían a la estudiante para que formule su propia conclusión.'),
    ('MISIÓN FINAL', 'Un estudiante consulta a una IA si debería apagar por completo el celular mientras estudia.

Respuesta de la IA: Un estudio demuestra que usar el celular mientras se estudia reduce la memoria un 40 %. Por eso todos los estudiantes deberían apagar completamente su teléfono durante cualquier sesión de estudio. La investigación fue compartida en un blog de productividad que cita un estudio universitario, pero no incluye enlace al estudio original.

¿Qué evaluación distingue mejor el respaldo de la cifra y el alcance de la recomendación?', 'Usar la cifra con atribución - El porcentaje y la mención de una universidad permiten citar el 40 % como estimación, siempre que se indique que proviene del blog.', 'Aplicar la recomendación - La cifra necesita respaldo, pero como las distracciones afectan al estudio, apagar el teléfono puede proponerse como regla general.', 'Esperar otra publicación - Conviene dejar de lado la cifra y la recomendación hasta que aparezcan juntas en una publicación que no use IA.', 'Contrastar el estudio - El efecto es plausible. Hay que buscar el estudio, revisar de dónde sale el 40 % y ver a qué situaciones se pueden aplicar sus resultados.', 'D', 'RESOLUCION_PROBLEMAS', 'PENSAMIENTO_CRITICO', 'El blog no permite comprobar el origen del 40 %, qué se midió ni en qué condiciones. La recomendación para todos exige evidencia que respalde ese alcance.', 'El blog no permite comprobar el origen del 40 %, qué se midió ni en qué condiciones. La recomendación para todos exige evidencia que respalde ese alcance.')
) AS inicial (titulo, enunciado, opcion_a, opcion_b, opcion_c, opcion_d, respuesta_correcta,
    habilidad_principal, habilidad_secundaria, feedback_correcto, feedback_incorrecto)
WHERE NOT EXISTS (SELECT 1 FROM desafio);

-- Publicar una sola vez las ocho misiones originales por titulo, nunca por el ID como orden.
MERGE INTO desafio d
USING (
    SELECT MIN(banco.id) AS id, inicial.orden, inicial.mensaje_nia
    FROM (VALUES
        (1, 'LA RESPUESTA IMPOSIBLE', 'Compara la información disponible con lo que afirma la respuesta.'),
        (2, 'DATO O CONCLUSIÓN', 'Separa lo que se midió de lo que afirma la conclusión.'),
        (3, 'DUELO DE IA', 'Compara cómo pasa cada respuesta de una observación a su conclusión.'),
        (4, 'BUSCA LA EVIDENCIA', 'Compara qué permite comprobar cada fuente por sí misma.'),
        (5, 'ATRAPA LA ALUCINACIÓN', 'Lee los cuatro fragmentos y compara lo que afirma cada uno.'),
        (6, 'RESUMEN ALTERADO', 'Compara los verbos que describen el resultado en ambos textos.'),
        (7, 'PREGUNTA MEJOR', 'Fíjate en qué trabajo haría la IA y qué trabajo quedaría en manos de la estudiante.'),
        (8, 'MISIÓN FINAL', 'Evalúa por separado el 40 % y la recomendación para todos los estudiantes.')
    ) AS inicial (orden, titulo, mensaje_nia)
    JOIN desafio banco ON UPPER(TRIM(banco.titulo)) = inicial.titulo
    WHERE banco.publicado_diagnostico IS NULL
      AND NOT EXISTS (SELECT 1 FROM desafio publicado WHERE publicado.orden_diagnostico = inicial.orden)
    GROUP BY inicial.orden, inicial.mensaje_nia
) fuente ON d.id = fuente.id
WHEN MATCHED THEN UPDATE SET publicado_diagnostico = TRUE,
    orden_diagnostico = fuente.orden, mensaje_nia = fuente.mensaje_nia;

-- NULL identifica solo registros anteriores a la migracion; no republicar tras despublicar.
UPDATE desafio SET publicado_diagnostico = FALSE WHERE publicado_diagnostico IS NULL;

-- Renovación transversal. Se aplica una sola vez a un banco completo y conserva sus ocho filas.
CREATE TABLE IF NOT EXISTS mision_ia_migracion (
    clave VARCHAR(80) PRIMARY KEY
);

MERGE INTO desafio destino
USING (
    SELECT *
    FROM (VALUES
        (
            1,
            'UNA CONDUCTA, UNA CONCLUSIÓN',
            'Camila evita realizar una exposición frente al curso.

Conclusión de la IA: Camila evita exponer porque tiene baja autoestima.

¿Cuál es el principal problema de esa conclusión?',
            'Una conducta aislada admite varias causas y no permite establecer cuál explica lo que hizo Camila.',
            'Antes de concluir, habría que contar cuántas veces ha evitado exponer. Si se repite, la explicación gana fuerza suficiente.',
            'Como la conducta ocurre frente al curso, conviene atribuirla primero a la presión del grupo.',
            'Sería más preciso hablar de nervios que de autoestima, porque los nervios se relacionan directamente con exponer.',
            'A',
            'PENSAMIENTO_CRITICO',
            'RAZONAMIENTO_LOGICO',
            'Evitar una exposición es lo observado. La baja autoestima es una explicación posible, pero esa conducta por sí sola también encaja con otras causas.',
            'Repetir o renombrar una observación no identifica su causa. Pregúntate qué sabes de Camila y qué está suponiendo la IA.',
            'Separa lo que Camila hizo de la causa que propone la IA.'
        ),
        (
            2,
            'EL DESCUENTO ENGAÑOSO',
            'Un producto cuesta $80.000. Primero sube un 25 % y luego la tienda aplica un descuento del 25 % sobre el nuevo precio.

Afirmación de la IA: Como subió 25 % y después bajó 25 %, volvió a costar $80.000.

¿Es correcto el razonamiento? Elige el precio final y la explicación que lo respalda.',
            '$80.000 - Los dos cambios tienen la misma tasa. El descuento quita el mismo monto que se agregó al inicio.',
            '$60.000 - El descuento equivale a $20.000. Ese monto se resta del precio original para hallar el precio final.',
            '$75.000 - El alza lleva el precio a $100.000. El descuento es $25.000 porque se calcula sobre ese nuevo precio.',
            '$95.000 - La diferencia entre los dos cambios es $5.000. Ese monto se resta de los $100.000 alcanzados con el alza.',
            'C',
            'RAZONAMIENTO_LOGICO',
            'PENSAMIENTO_CRITICO',
            'El 25 % de $80.000 es $20.000 y el precio sube a $100.000. El 25 % de ese nuevo precio es $25.000, por lo que el precio final queda en $75.000.',
            'Revisa sobre qué monto se aplica cada cambio. El alza parte de $80.000 y el descuento se aplica al precio que resulta después.',
            'Haz los dos cambios en el mismo orden en que ocurrieron.'
        ),
        (
            3,
            'SE HIZO VIRAL, ¿ES VERDAD?',
            'Un video en redes sociales afirma que un alimento mejora la memoria en un 40 %.

Respuesta de la IA: Encontré varias publicaciones que repiten ese dato, así que la cifra parece confirmada.

¿Qué comprobación sería más apropiada antes de aceptar el 40 %?',
            'Comparar publicaciones de distintos medios y contar cuántas atribuyen el mismo porcentaje a la investigación.',
            'Pedir a otra IA que explique la cifra y contrastar si ambas respuestas describen un efecto parecido.',
            'Revisar quién publicó el video y comprobar si suele citar a especialistas en otras publicaciones sobre el tema.',
            'Rastrear la investigación original y revisar cómo midió la memoria y de qué comparación salió el 40 %.',
            'D',
            'VERIFICACION_INFORMACION',
            'PENSAMIENTO_CRITICO',
            'Varias publicaciones pueden repetir la misma fuente. El estudio original permite comprobar qué se midió, frente a qué se comparó y si el 40 % corresponde a ese resultado.',
            'Las coincidencias y la reputación sirven para orientar la búsqueda. Para confirmar la cifra, necesitas evidencia que muestre de dónde salió y qué significa.',
            'Pregúntate qué podría confirmar el origen de la cifra.'
        ),
        (
            4,
            'AYÚDAME, PERO NO LO HAGAS POR MÍ',
            'Un estudiante tiene un borrador y debe escribir la conclusión de un trabajo. Quiere usar IA para revisar sus argumentos y sostener su propia postura.

¿Qué solicitud aprovecha mejor la IA como apoyo y mantiene la decisión en manos del estudiante?',
            'Redacta una conclusión a partir de mi borrador y explica cómo la conectaste con los argumentos. Yo revisaré si me representa.',
            'Compara mis argumentos, señala los puntos débiles y hazme preguntas para que yo formule y defienda mi conclusión.',
            'Elige la postura que mejor se sostiene con mi borrador y dame razones para que yo escriba la conclusión con mis palabras.',
            'Reescribe el trabajo para que los argumentos lleven a una postura clara. Luego redactaré la conclusión a partir de esa versión.',
            'B',
            'AUTONOMIA_IA',
            'RESOLUCION_PROBLEMAS',
            'La IA ayuda a revisar la evidencia y a detectar debilidades. El estudiante conserva la decisión sobre qué sostiene su trabajo y cómo justificarlo.',
            'Revisa quién toma la decisión de fondo. Poder editar el resultado o redactarlo con tus palabras no equivale a construir tu propia postura.',
            'Fíjate en qué decisión queda en manos del estudiante.'
        ),
        (
            5,
            'LA MAYORÍA PIENSA ASÍ',
            'Una cuenta de Instagram encuesta a sus seguidores. Responden 2.000 personas y el 70 % dice que usa IA para estudiar.

Conclusión de la IA: El 70 % de todos los jóvenes de Chile utiliza inteligencia artificial para estudiar.

¿Qué habría que verificar primero para saber si ese resultado puede aplicarse a todos los jóvenes de Chile?',
            'Si las 2.000 respuestas corresponden a personas distintas y se recibieron durante el mismo periodo de la encuesta.',
            'Si la pregunta explicaba qué significa usar IA para estudiar y todos los participantes entendieron lo mismo.',
            'Si el 70 % se calculó sobre las respuestas válidas y el resultado se mantuvo al retirar las respuestas incompletas.',
            'Si las personas que siguieron la cuenta y decidieron responder representan a jóvenes de distintos contextos en Chile.',
            'D',
            'VERIFICACION_INFORMACION',
            'PENSAMIENTO_CRITICO',
            'Aunque el 70 % esté bien calculado, proviene de seguidores que decidieron participar. Para generalizarlo hace falta comprobar que ese grupo representa a la población sobre la que se habla.',
            'La revisión que elegiste puede mejorar la calidad de la encuesta. La generalización depende además de quién tuvo la oportunidad de participar y quién respondió.',
            'Distingue a quienes respondieron de quienes aparecen en la conclusión.'
        ),
        (
            6,
            '¿CUÁL ES REALMENTE EL MEJOR?',
            'Una persona busca un teléfono y le pide a una IA que recomiende la mejor compra.

Texto original: Necesita usar WhatsApp, tomar fotografías y tener batería para el día. Tiene un presupuesto que no quiere superar.

Resumen de IA: Recomiendo el modelo más caro porque tiene mayor rendimiento y más almacenamiento que los otros.

¿Qué comparación le serviría más para decidir?',
            'Ordenar los modelos dentro del presupuesto por almacenamiento y elegir el primero para guardar más fotos a largo plazo.',
            'Filtrar por presupuesto y comparar fotos, autonomía de batería y uso de WhatsApp entre los modelos que cumplen esas condiciones.',
            'Comparar las reseñas generales de los modelos que puede comprar y elegir el que reciba mejores valoraciones de sus usuarios.',
            'Medir cuánto rendimiento técnico ofrece cada modelo por su precio y elegir el que tenga la mejor relación.',
            'B',
            'RESOLUCION_PROBLEMAS',
            'RAZONAMIENTO_LOGICO',
            'La comparación útil parte del presupuesto y de los usos prioritarios. La memoria, las reseñas y el rendimiento ayudan si se interpretan en función de esas necesidades.',
            'Un modelo puede destacar en una característica y seguir siendo una mala compra para esa persona. Revisa qué requisitos deben cumplirse juntos.',
            'Compara cada opción con el uso que realmente se le dará.'
        ),
        (
            7,
            'SUENA SEGURO, ¿ENTONCES ES CIERTO?',
            'Una estudiante quiere saber si le conviene salir más tarde para llegar a tiempo a su primera clase.

Respuesta A: Sal a las 7:45. Llegarás en 25 minutos incluso en hora punta. Ese recorrido es regular y puedes planificar con ese margen.

Respuesta B: Conozco el recorrido, pero no el horario real del bus ni las demoras de hoy. Revisa la frecuencia oficial y el estado del recorrido antes de decidir a qué hora salir.

¿Cuál respuesta merece mayor confianza para planificar el viaje y por qué?',
            'La A, porque entrega una estimación concreta que permite organizar la salida y comprobarla cuando se haga el viaje.',
            'La B, porque evita prometer una hora de llegada, lo que por sí solo hace más sólida su recomendación.',
            'La B, porque distingue lo que sabe de lo que falta y propone comprobaciones que pueden cambiar la decisión.',
            'Las dos por igual, porque se refieren al mismo recorrido y ninguna muestra un registro de demoras del día.',
            'C',
            'PENSAMIENTO_CRITICO',
            'AUTONOMIA_IA',
            'La B hace visibles sus límites y propone cómo comprobar datos relevantes antes de salir. Una respuesta firme también puede ser confiable si muestra evidencia que respalde su precisión.',
            'No decidas solo por el tono ni porque una respuesta dé un número concreto. Compara si puedes comprobar la información que necesitas antes de actuar.',
            '¿Qué dato comprobarías antes de fijar la hora de salida?'
        ),
        (
            8,
            'LA RECOMENDACIÓN PERFECTA',
            'Un estudiante considera cambiar su forma de estudiar después de leer una recomendación de IA.

Afirmación de la IA: Estudiar escuchando música aumenta el rendimiento académico en un 30 %, por lo que todos los estudiantes deberían hacerlo.

Fuente citada: Un artículo divulgativo menciona un estudio universitario, pero no enlaza el estudio original.

¿Cuál plan permite evaluar tanto el 30 % como la recomendación para todos antes de aplicarla?',
            'Buscar el estudio original, comprobar cómo midió el 30 % y a quién estudió, y considerar en qué personas o tareas probar la música antes de generalizar.',
            'Rastrear el estudio, comprobar que informa el 30 % y aplicar la recomendación a quienes estudien una materia parecida a la de los participantes.',
            'Buscar otras investigaciones sobre música y concentración. Si varias encuentran un efecto favorable, recomendar la música sin depender de la cifra exacta.',
            'Probar sesiones con y sin música, comparar la comprensión personal y usar esa comparación para recomendarla a estudiantes con hábitos similares.',
            'A',
            'RESOLUCION_PROBLEMAS',
            'PENSAMIENTO_CRITICO',
            'El estudio permite verificar la cifra, qué se midió y a quién se estudió. Luego hay que revisar si los resultados se trasladan a otros estudiantes y tareas. Una prueba personal puede orientar tu decisión sin justificar una regla para todos.',
            'Comprueba por separado dos cosas: de dónde sale el 30 % y a quién podría aplicarse. Repetir la cifra, sumar estudios similares o probarlo por tu cuenta cubre solo una parte.',
            'Distingue verificar una cifra de decidir a quién recomendarle un cambio.'
        )
    ) AS contenido (orden, titulo, enunciado, opcion_a, opcion_b, opcion_c, opcion_d,
        respuesta_correcta, habilidad_principal, habilidad_secundaria, feedback_correcto, feedback_incorrecto, mensaje_nia)
    WHERE NOT EXISTS (SELECT 1 FROM mision_ia_migracion WHERE clave = 'contenido-transversal-v1')
      AND 8 = (SELECT COUNT(*) FROM desafio
          WHERE publicado_diagnostico = TRUE AND orden_diagnostico BETWEEN 1 AND 8)
) renovacion ON destino.publicado_diagnostico = TRUE AND destino.orden_diagnostico = renovacion.orden
WHEN MATCHED THEN UPDATE SET
    titulo = renovacion.titulo,
    enunciado = renovacion.enunciado,
    opcion_a = renovacion.opcion_a,
    opcion_b = renovacion.opcion_b,
    opcion_c = renovacion.opcion_c,
    opcion_d = renovacion.opcion_d,
    respuesta_correcta = renovacion.respuesta_correcta,
    habilidad_principal = renovacion.habilidad_principal,
    habilidad_secundaria = renovacion.habilidad_secundaria,
    feedback_correcto = renovacion.feedback_correcto,
    feedback_incorrecto = renovacion.feedback_incorrecto,
    mensaje_nia = renovacion.mensaje_nia;

-- Los próximos arranques mantienen las ediciones del docente.
INSERT INTO mision_ia_migracion (clave)
SELECT 'contenido-transversal-v1'
WHERE NOT EXISTS (SELECT 1 FROM mision_ia_migracion WHERE clave = 'contenido-transversal-v1')
  AND 8 = (SELECT COUNT(*) FROM desafio
          WHERE publicado_diagnostico = TRUE AND orden_diagnostico BETWEEN 1 AND 8);

-- Ajuste puntual de la misión 1. No volver a aplicar después de una edición docente.
UPDATE desafio
SET enunciado = REPLACE(enunciado, 'Camila', 'Valentina'),
    opcion_a = REPLACE(opcion_a, 'Camila', 'Valentina'),
    opcion_b = REPLACE(opcion_b, 'Camila', 'Valentina'),
    opcion_c = REPLACE(opcion_c, 'Camila', 'Valentina'),
    opcion_d = REPLACE(opcion_d, 'Camila', 'Valentina'),
    feedback_correcto = REPLACE(feedback_correcto, 'Camila', 'Valentina'),
    feedback_incorrecto = REPLACE(feedback_incorrecto, 'Camila', 'Valentina'),
    mensaje_nia = REPLACE(mensaje_nia, 'Camila', 'Valentina')
WHERE orden_diagnostico = 1
  AND titulo = 'UNA CONDUCTA, UNA CONCLUSIÓN'
  AND NOT EXISTS (SELECT 1 FROM mision_ia_migracion WHERE clave = 'nombre-valentina-mision-1');

INSERT INTO mision_ia_migracion (clave)
SELECT 'nombre-valentina-mision-1'
WHERE EXISTS (SELECT 1 FROM desafio WHERE orden_diagnostico = 1 AND titulo = 'UNA CONDUCTA, UNA CONCLUSIÓN')
  AND NOT EXISTS (SELECT 1 FROM mision_ia_migracion WHERE clave = 'nombre-valentina-mision-1');

-- Distinguir las propuestas del escenario de las letras de las alternativas.
UPDATE desafio
SET enunciado = REPLACE(REPLACE(enunciado, 'Respuesta A:', 'Propuesta 1:'), 'Respuesta B:', 'Propuesta 2:'),
    opcion_a = REPLACE(opcion_a, 'La A, porque', 'La propuesta 1, porque'),
    opcion_b = REPLACE(opcion_b, 'La B, porque', 'La propuesta 2, porque'),
    opcion_c = REPLACE(opcion_c, 'La B, porque', 'La propuesta 2, porque'),
    feedback_correcto = REPLACE(feedback_correcto, 'La B hace visibles', 'La propuesta 2 hace visibles')
WHERE orden_diagnostico = 7
  AND titulo = 'SUENA SEGURO, ¿ENTONCES ES CIERTO?'
  AND NOT EXISTS (SELECT 1 FROM mision_ia_migracion WHERE clave = 'rotulos-propuestas-mision-7');

INSERT INTO mision_ia_migracion (clave)
SELECT 'rotulos-propuestas-mision-7'
WHERE EXISTS (SELECT 1 FROM desafio WHERE orden_diagnostico = 7 AND titulo = 'SUENA SEGURO, ¿ENTONCES ES CIERTO?')
  AND NOT EXISTS (SELECT 1 FROM mision_ia_migracion WHERE clave = 'rotulos-propuestas-mision-7');
