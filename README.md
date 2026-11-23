# Misión IA

> Aprende a utilizar la inteligencia artificial sin dejar de pensar por ti mismo.

## Descripción

Misión IA es una plataforma educativa gamificada para estudiantes de educación superior. Propone desafíos sobre situaciones cotidianas para explorar el uso crítico y autónomo de la inteligencia artificial. Al terminar, el estudiante recibe un perfil inicial de habilidades, una fortaleza inicial, una prioridad de fortalecimiento cuando corresponde y una ruta de recomendaciones personalizada. NIA acompaña el recorrido.

## Habilidades evaluadas

- Razonamiento lógico
- Pensamiento crítico
- Verificación de información
- Resolución de problemas
- Autonomía en el uso de IA

Los indicadores resumen la evidencia obtenida en los desafíos del intento. Sirven como orientación educativa inicial y no constituyen una evaluación psicológica ni una medición científica de habilidades.

## Tecnologías

| Área | Tecnologías |
| --- | --- |
| Lenguaje y construcción | Java 21, Maven y Maven Wrapper |
| Aplicación web | Spring Boot 4.1.2, Spring MVC y Thymeleaf |
| Persistencia y validación | Spring Data JPA, Hibernate, H2 Database en archivo y Jakarta Bean Validation |
| Interfaz y voz | HTML, CSS, JavaScript y Web Speech API mediante `speechSynthesis` |

## Arquitectura

`Controller → Service → Repository → H2`

| Componente | Responsabilidad |
| --- | --- |
| `entity` | Modela los desafíos, intentos y respuestas que se guardan con JPA. |
| `controller` | Recibe las solicitudes HTTP, sirve las vistas MVC y expone la API JSON. |
| `service` | Valida publicaciones y selecciones, conserva la configuración del intento y calcula sus resultados. |
| `repository` | Consulta y persiste las entidades mediante Spring Data JPA. |
| DTO de la API | Define los datos que se intercambian, como los desafíos publicados, las selecciones y el resultado del intento. |
| `templates` | Contiene las vistas Thymeleaf del recorrido del estudiante y del Panel docente. |
| `static/js` | Gestiona la interacción de las vistas, consulta la API y activa la voz de NIA. |
| `static/css` | Define la presentación y la adaptación de las vistas a distintos tamaños de pantalla. |

## Flujo del estudiante

**Inicio → Diagnóstico → Perfil inicial → Ruta de fortalecimiento o profundización**

Desde la portada se inicia un nuevo diagnóstico. En cada misión, el estudiante selecciona una alternativa, recibe retroalimentación y puede consultar las respuestas previas con **Anterior**. El perfil resume el intento terminado y permite volver a revisar sus respuestas. La ruta ofrece recomendaciones para practicar por cuenta propia. Las recomendaciones son informativas y no se ejecutan dentro de la plataforma.

## NIA

NIA significa **Navegante de Inteligencia y Autonomía**. Acompaña los desafíos con mensajes orientadores, comenta el perfil y presenta la ruta. La síntesis de voz utiliza las voces disponibles en el navegador. Se activa solo al pulsar el botón de escucha de la vista correspondiente y no se reproduce automáticamente.

## Banco de desafíos y Panel docente

El acceso **Panel docente** de la portada abre el banco en `/admin/desafios`. Allí se pueden listar, crear, ver, editar, desactivar y reactivar desafíos. **Desactivar** aplica una desactivación lógica. El desafío permanece almacenado en H2 con su ID y sus datos, y puede reactivarse desde el Panel docente.

- **Activo** y **Publicado** son estados distintos. Un desafío puede estar activo y permanecer sin publicar. Solo los desafíos activos y publicados se incluyen en los nuevos intentos.
- El diagnóstico admite una cantidad variable de misiones. El docente puede incorporar nuevos desafíos al banco y hacerlos participar en nuevos intentos al publicarlos y activarlos. Al publicar debe asignar un orden entero positivo y único entre los desafíos publicados.
- La cantidad de misiones depende del banco activo al empezar el intento. Al desactivar un desafío, este deja de aparecer en nuevos intentos, las misiones visibles se renumeran consecutivamente y el orden interno se conserva. Al reactivarlo, vuelve a su posición relativa en los nuevos intentos.
- Si no quedan desafíos activos y publicados, el diagnóstico informa que no hay misiones disponibles.

`ID` es el identificador técnico generado por la base de datos y puede presentar saltos. `ORDEN_DIAGNOSTICO` indica la posición pedagógica de la misión en el recorrido del estudiante. Por ejemplo, un desafío puede tener `ID` 41 y `ORDEN_DIAGNOSTICO` 9.

Para editar el enunciado, separa la situación, las citas y la pregunta con líneas en blanco. La posición 5 utiliza cuatro fragmentos. La posición 6 compara dos párrafos con los prefijos «Texto original:» y «Resumen de IA:». En otros formatos, una alternativa puede usar `título - explicación` para mostrar ambos elementos por separado.

## Puntaje e intentos

Cada acierto suma **350 puntos de juego** y cada error suma cero. El máximo depende del total de misiones del intento. Por ejemplo, ocho misiones permiten obtener **2.800 puntos** y nueve permiten obtener **3.150 puntos**. El backend también calcula la mejor racha de aciertos consecutivos. El puntaje del juego y los indicadores de habilidades se calculan por separado.

Cada diagnóstico nuevo genera un **UUID** independiente y guarda una copia de los desafíos participantes. Al finalizar, el backend valida las selecciones contra esa copia, calcula el resultado oficial y lo persiste en H2. Las entidades `IntentoDiagnostico` y `RespuestaIntento` separan las respuestas y resultados de cada ejecución.

`sessionStorage` guarda solo la referencia al intento actual para navegar en la pestaña. El perfil y la ruta consultan el mismo resultado oficial. Los cambios posteriores en el banco no alteran la evaluación de un intento que ya comenzó.

## Perfil de habilidades

El backend calcula cada indicador dividiendo los puntos de evidencia obtenidos por el máximo disponible para esa habilidad en el intento, y redondea el porcentaje al entero más cercano. Las posiciones originales 1 a 8 conservan su matriz pedagógica. Desde la posición 9, un acierto aporta dos puntos internos a la habilidad principal y uno a la secundaria, si está asignada.

| Indicador | Interpretación |
| --- | --- |
| 0–39 % | Prioridad de fortalecimiento |
| 40–69 % | En desarrollo |
| 70–100 % | Fortaleza inicial |
| Sin evidencia suficiente | Ninguna misión participante aporta evidencia para esa habilidad. Se omite su porcentaje y queda fuera de la selección de fortaleza y prioridad. |

## Ruta personalizada

La ruta distingue el **resultado general**, calculado como aciertos sobre el total real de misiones del intento, del **indicador de la habilidad prioritaria**. También presenta la fortaleza inicial y tres recomendaciones relacionadas con la habilidad seleccionada.

La prioridad se elige entre las habilidades que tienen evidencia y corresponde al indicador más bajo. Cuando los cinco indicadores alcanzan el 100 %, aparece **Perfil equilibrado** y se ofrece una **Ruta de profundización** sin asignar una prioridad de fortalecimiento. Si solo se evaluó un subconjunto y todos sus indicadores alcanzan el máximo, la profundización se basa en una habilidad con evidencia.

## Base de datos H2

La ejecución normal usa una base H2 persistente que conserva los desafíos, los intentos de diagnóstico y sus respuestas entre reinicios. Los datos se guardan en `data/misionia.mv.db`, relativo al directorio desde el que se inicia la aplicación. Ejecuta el proyecto desde su raíz para reutilizar la misma base en los siguientes arranques.

| Parámetro | Valor |
| --- | --- |
| URL JDBC | `jdbc:h2:file:./data/misionia` |
| Usuario | `sa` |
| Contraseña | Vacía |
| Consola H2 | [http://localhost:8080/h2-console](http://localhost:8080/h2-console) |
| Driver | `org.h2.Driver` |
| Actualización de esquema | Hibernate con `spring.jpa.hibernate.ddl-auto=update` |

Spring ejecuta `data.sql` después de inicializar JPA. La carga inicial inserta el banco base solo si la tabla está vacía. Las pruebas de Maven usan una base en memoria separada, `jdbc:h2:mem:misionia-test`.

Las tablas principales son `DESAFIO`, `INTENTO_DIAGNOSTICO`, `RESPUESTA_INTENTO` y `MISION_IA_MIGRACION`.

### Estado de la base de demostración

- Se conservaron **3 intentos completos** de diagnóstico y **25 respuestas** asociadas.
- Hay **8 desafíos activos** que participan en el diagnóstico.
- Hay **1 desafío adicional de prueba** en estado inactivo, utilizado para verificar el CRUD docente y la desactivación lógica.

## Rutas principales

| Método y ruta | Propósito |
| --- | --- |
| `GET /` | Portada y acceso al diagnóstico o al Panel docente |
| `GET /diagnostico` | Misiones del intento |
| `GET /perfil` | Perfil inicial de habilidades |
| `GET /ruta` | Recomendaciones personalizadas |
| `GET /admin/desafios` | Banco de desafíos |
| `/h2-console` | Consola local de H2 |
| `GET /api/desafios/diagnostico` | Lista los desafíos activos y publicados en su orden original |
| `POST /api/intentos` | Crea un intento y devuelve su UUID y las misiones participantes |
| `POST /api/intentos/{id}/finalizar` | Recibe las selecciones por orden original y guarda el resultado validado |
| `GET /api/intentos/{id}/resultado` | Devuelve el resultado oficial de un intento completado |

## Ejecución en Windows

Instala el **JDK 21** y abre PowerShell en la raíz del proyecto. Ejecuta:

```powershell
.\mvnw.cmd spring-boot:run
```

Cuando arranque Spring Boot, abre [http://localhost:8080](http://localhost:8080). Desde la portada puedes entrar al diagnóstico o al Panel docente.

En macOS o Linux, el comando equivalente es `./mvnw spring-boot:run`.

## Documentación

El proyecto cuenta con un dashboard técnico HTML como apoyo para su presentación. Explica el funcionamiento de Misión IA, la arquitectura MVC, la estructura de carpetas, los comandos y las rutas de la aplicación. También cubre los flujos del estudiante y del docente, el perfil de habilidades, la ruta personalizada, la persistencia con JPA y H2, las pruebas, el diseño adaptable y la relación del proyecto con los criterios de evaluación.

## Pruebas y diseño adaptable

Ejecuta la prueba automatizada desde la raíz del proyecto:

```powershell
.\mvnw.cmd test
```

`MisionIaApplicationTests.contextLoads` comprueba que el contexto de Spring Boot se inicializa con H2 en memoria. Las verificaciones funcionales complementarias cubrieron el flujo del estudiante, la navegación, el CRUD docente, los intentos independientes, la activación y desactivación, y los diagnósticos con distinta cantidad de misiones. La voz bajo demanda también se comprobó con síntesis simulada.

Las vistas principales se adaptan a escritorio y móvil. La prueba manual a **375 px** cubrió la portada, el diagnóstico, el perfil, la ruta personalizada y el Panel docente.

- Las tarjetas y los contenidos se ajustaron al ancho sin desplazamiento horizontal.
- Los textos y botones quedaron visibles, y la navegación se pudo utilizar.
- Las alternativas del diagnóstico se apilaron correctamente.
- NIA y sus controles se adaptaron al ancho móvil.

## Limitaciones actuales

- El sistema aún no tiene autenticación de usuarios. El Panel docente no está protegido por roles y está pensado para una demostración local.
- Los intentos son anónimos e independientes mediante UUID. Todavía no se asocian a una cuenta de estudiante.
- La ruta entrega recomendaciones. Las actividades de fortalecimiento ejecutables y un historial de progreso quedan para una etapa posterior.

## Mejoras futuras

Para una etapa posterior se prevén las siguientes mejoras.

- Registro e inicio de sesión mediante Spring Security y almacenamiento de contraseñas con BCrypt.
- Roles `ESTUDIANTE` y `DOCENTE`, con protección del Panel docente.
- Asociación de intentos a usuarios, historial de progreso y comparación de intentos.
- Actividades interactivas de fortalecimiento.
