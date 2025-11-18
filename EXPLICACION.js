// ============================================
// EXPLICACIÓN DEL FLUJO COMPLETO
// ============================================

/*
Este archivo contiene explicaciones detalladas del flujo de inscripción
para facilitar la presentación del proyecto en la facultad.

==============================================
ARQUITECTURA GENERAL
==============================================

Frontend (HTML + CSS + JS)
    ↓
  fetch() - llamadas HTTP
    ↓
Backend (Node.js + Express)
    ↓
SQLite (base de datos)

==============================================
FLUJO COMPLETO PASO A PASO
==============================================

1. PANTALLA INICIAL - DNI
   - El usuario ingresa su DNI
   - Se valida formato (7-8 dígitos)
   - Se llama a: POST /api/alumnos/buscar-dni
   - Si existe: guarda datos en localStorage y continúa
   - Si NO existe: muestra error

2. SELECCIÓN DE CARRERA
   - Se muestran las carreras del alumno (de la respuesta anterior)
   - El usuario selecciona una carrera
   - Se valida periodo activo: GET /api/periodos/activo?carreraId=X
   - Si hay periodo activo: guarda en localStorage y continúa
   - Si NO hay periodo: muestra error

3. MENÚ PRINCIPAL
   - Opciones: Inscripción a cursar | Mesas | Historial
   - El usuario selecciona "Inscripción a cursar"

4. CARGA DE MATERIAS
   - Se hacen 2 llamadas simultáneas:
     a) GET /api/carreras/{id}/materias (todas las materias)
     b) GET /api/alumnos/{id}/materias-posibles (solo las habilitadas)
   
   - Se cruzan ambas listas:
     * Materias habilitadas → checkbox activo
     * Materias NO habilitadas → checkbox deshabilitado + texto gris

5. SELECCIÓN Y CONFIRMACIÓN
   - El usuario marca las materias que desea cursar
   - Al confirmar: POST /api/inscripciones con:
     * alumnoId
     * carreraId
     * materiasIds (array)
     * periodoId
   
   - El backend valida TODO nuevamente (seguridad)
   - Si OK: crea la inscripción y devuelve confirmación
   - Si error: muestra el mensaje

6. PANTALLA DE CONFIRMACIÓN
   - Muestra fecha de inscripción
   - Lista de materias inscriptas (con nombres legibles)

==============================================
USO DE localStorage
==============================================

localStorage es una API del navegador que permite guardar datos
de forma permanente (hasta que se limpie el navegador o se haga logout).

¿Por qué lo usamos?
- Para no perder los datos al cambiar de pantalla
- Para evitar hacer las mismas llamadas varias veces
- Para mantener la "sesión" del usuario

Datos que guardamos:
1. alumno: objeto completo con toda la info del alumno
2. carreraSeleccionada: la carrera que eligió
3. periodoActivo: el periodo de inscripción vigente

Se limpia al hacer "Salir" con localStorage.clear()

==============================================
VALIDACIONES IMPORTANTES
==============================================

EN EL FRONTEND:
- DNI: formato numérico 7-8 dígitos
- Materias: al menos 1 seleccionada
- Periodo activo: antes de mostrar materias

EN EL BACKEND:
- Alumno existe
- Periodo está activo para esa carrera
- Materias pertenecen a la carrera
- Alumno cumple correlativas
- No está inscripto ya en esas materias
- Hay cupo disponible

==============================================
TECNOLOGÍAS CLAVE
==============================================

1. fetch() API
   - Permite hacer llamadas HTTP desde JavaScript
   - Devuelve Promises
   - Se usa con async/await para código más legible

2. async/await
   - Permite escribir código asíncrono de forma sincrónica
   - await "espera" que la Promise se resuelva
   - Hace el código más fácil de leer y mantener

3. localStorage
   - API del navegador para almacenamiento local
   - Guarda strings (por eso usamos JSON.stringify/parse)
   - Persiste entre recargas de página

4. DOM manipulation
   - createElement: crea elementos HTML desde JS
   - appendChild: agrega elementos al DOM
   - querySelector: selecciona elementos

==============================================
MANEJO DE ERRORES
==============================================

try {
  // Código que puede fallar
  const response = await fetch(url);
  if (!response.ok) {
    // Si el servidor responde pero con error (404, 400, etc)
    alert("Error del servidor");
    return;
  }
  const data = await response.json();
  // Procesar data...
} catch (error) {
  // Si hay error de red o el servidor no responde
  console.error("Error:", error);
  alert("Error de conexión");
}

==============================================
DIFERENCIA ENTRE FRONTEND Y BACKEND
==============================================

FRONTEND:
- Corre en el navegador del usuario
- Se encarga de la interfaz visual
- Valida datos básicos (formato, campos requeridos)
- NO tiene acceso directo a la base de datos
- Hace peticiones HTTP al backend

BACKEND:
- Corre en un servidor (en este caso localhost:3000)
- Se encarga de la lógica de negocio
- Valida datos complejos (correlativas, reglas de inscripción)
- Tiene acceso a la base de datos
- Responde a las peticiones del frontend

==============================================
ENDPOINTS PRINCIPALES
==============================================

POST /api/alumnos/buscar-dni
  → Busca un alumno por DNI
  → Devuelve: alumno completo con carreras y materias aprobadas

GET /api/periodos/activo?carreraId={id}
  → Verifica si hay periodo activo para una carrera
  → Devuelve: periodo activo o error 404

GET /api/carreras/{id}/materias
  → Trae todas las materias de una carrera
  → Devuelve: array de materias con correlativas

GET /api/alumnos/{id}/materias-posibles?carreraId={id}
  → Calcula qué materias puede cursar el alumno
  → Devuelve: array de materias habilitadas

POST /api/inscripciones
  → Crea una inscripción nueva
  → Body: { alumnoId, carreraId, materiasIds[], periodoId }
  → Devuelve: inscripción creada con datos completos

==============================================
PREGUNTAS FRECUENTES
==============================================

P: ¿Por qué usar localStorage y no cookies?
R: localStorage es más simple y no se envía en cada request.
   Para un proyecto académico es suficiente.

P: ¿Por qué async/await y no .then()?
R: async/await es más moderno y legible.
   Es la forma recomendada actualmente.

P: ¿Qué pasa si el usuario recarga la página?
R: Si está en pantallas posteriores a la de DNI, los datos
   seguirán en localStorage. Pero es mejor volver al inicio.

P: ¿Por qué validar en frontend Y backend?
R: Frontend: para UX (experiencia de usuario)
   Backend: para seguridad (no confiar en el cliente)

P: ¿Cómo se comunican frontend y backend?
R: A través de HTTP. Frontend hace requests (fetch),
   backend responde con JSON.

==============================================
PARA AMPLIAR EL PROYECTO
==============================================

Ideas para mejorar:
1. Agregar autenticación con JWT
2. Implementar mesas de examen
3. Mostrar historial académico completo
4. Agregar sistema de notificaciones por email
5. Crear panel de administración
6. Agregar certificados descargables
7. Implementar pagos online
8. Sistema de encuestas de satisfacción

==============================================
CONCLUSIÓN
==============================================

Este proyecto demuestra:
✅ Integración frontend-backend
✅ Uso de APIs REST
✅ Manejo de estado con localStorage
✅ Validaciones en múltiples capas
✅ Programación asíncrona con async/await
✅ Manipulación del DOM
✅ Arquitectura de capas (MVC)

Es un proyecto completo que puede servir como base
para sistemas más complejos en el futuro.

*/
