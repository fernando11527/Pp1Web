# Sistema de Inscripción - Terciario Urquiza

## 📋 Descripción del Proyecto

Este es un sistema web para gestionar inscripciones de alumnos a materias en el Instituto Terciario Urquiza. El proyecto está compuesto por:

- **Frontend**: HTML, CSS y JavaScript vanilla (sin frameworks)
- **Backend**: Node.js + Express + SQLite (en carpeta `Pp1`)

## 🚀 Cómo ejecutar el proyecto

### 1. Iniciar el Backend

Primero debes tener el servidor backend corriendo:

```bash
cd ruta del proyecto
npm install
npm start
```

El servidor estará disponible en `http://localhost:3000`

### 2. Abrir el Frontend

Simplemente abre el archivo `index.html` en tu navegador. Puedes:
- Hacer doble clic en el archivo
- Usar la extensión "Live Server" de VS Code
- O abrir directamente desde el navegador

## 📝 Flujo de Inscripción

### Paso 1: Ingresar DNI
El alumno ingresa su DNI (7-8 dígitos). El sistema hace una llamada a:
```
POST /api/alumnos/buscar-dni
Body: { "dni": "41342897" }
```

**Datos guardados en localStorage:**
- Información completa del alumno
- Carreras disponibles
- Materias aprobadas

### Paso 2: Seleccionar Carrera
El alumno ve las carreras en las que está inscripto y selecciona una. El sistema verifica si hay periodo activo:
```
GET /api/periodos/activo?carreraId={id}
```

**Validaciones:**
- Si no hay periodo activo → Mostrar mensaje de error
- Si hay periodo activo → Guardar en localStorage y continuar

### Paso 3: Menú Principal
El alumno selecciona "Inscripción a cursado"

### Paso 4: Seleccionar Materias
El sistema carga:
1. **Todas las materias de la carrera:**
   ```
   GET /api/carreras/{id}/materias
   ```

2. **Materias en las que se puede inscribir:**
   ```
   GET /api/alumnos/{id}/materias-posibles?carreraId={id}
   ```

**Lógica de habilitación:**
- Materias posibles: checkbox habilitado ✅
- Materias NO posibles: checkbox deshabilitado y texto gris ❌

### Paso 5: Confirmar Inscripción
Al confirmar, se envía:
```
POST /api/inscripciones
Body: {
  "alumnoId": 1,
  "carreraId": 2,
  "materiasIds": [44, 45],
  "periodoId": 1
}
```

El backend valida:
- Periodo activo
- Correlativas cumplidas
- No duplicar inscripciones
- Cupos disponibles

### Paso 6: Confirmación
Se muestra un resumen de la inscripción con:
- Fecha de inscripción
- Lista de materias inscriptas (con nombres)

## 🔑 Datos de Prueba

### Alumnos existentes:
- **DNI: 41342897** - Fernando Virgilio
- **DNI: 21044866** - Sergio Machado
- **DNI: 38136139** - Cristian Marchetti

### Carreras:
- ID 1: Infraestructura de Tecnología de la Información (ITI)
- ID 2: Desarrollo de Software (DS)
- ID 3: Análisis Funcional de Sistemas (AF)

### Ejemplo de prueba completo:
1. Ingresar DNI: `41342897`
2. Seleccionar carrera: "Desarrollo de Software"
3. Ver materias disponibles
4. Seleccionar materias habilitadas
5. Confirmar inscripción

## 🛠️ Tecnologías Utilizadas

### Frontend:
- HTML5
- CSS3 (con efectos de carrusel)
- JavaScript ES6+ (async/await, fetch API)
- localStorage para mantener estado

### Backend:
- Node.js
- Express.js
- SQLite3
- Arquitectura en capas (Controllers, Services, Repositories, Models)

## 📂 Estructura del Proyecto

```
Inscripci-n-del-alumnado-main/
├── index.html          # Estructura de las pantallas
├── style.css           # Estilos visuales
├── script.js           # Lógica de interacción con el backend
├── assets/
│   └── img/           # Imágenes del instituto y carreras
└── README.md          # Este archivo
```

## 🔍 localStorage - Datos que se guardan

El sistema usa `localStorage` para mantener el estado entre pantallas:

```javascript
// Datos del alumno
localStorage.getItem("alumno")
// { id, dni, nombre, apellido, email, carreras[], materiasAprobadas[] }

// Carrera seleccionada
localStorage.getItem("carreraSeleccionada")
// { id, nombre }

// Periodo activo
localStorage.getItem("periodoActivo")
// { id, fechaInicio, fechaFin, activo, cupoLimite, carreraId }
```

**Limpieza de datos:**
Al hacer clic en "Salir", se ejecuta `localStorage.clear()` para limpiar toda la sesión.

## ⚠️ Solución de Problemas

### Error: "No se puede conectar con el servidor"
- Verifica que el backend esté corriendo en `http://localhost:3000`
- Ejecuta `npm start` en la carpeta del backend

### Error: "DNI inválido"
- El DNI debe ser un string de 7-8 dígitos numéricos
- Ejemplo correcto: `"41342897"`

### Error: "No hay periodo activo"
- Verifica que exista un periodo activo para la carrera en la base de datos
- Puedes crear uno desde el panel admin del backend

### Las materias aparecen todas deshabilitadas
- Verifica que el alumno tenga materias aprobadas que habiliten las correlativas
- Revisa el endpoint `/api/alumnos/{id}/materias-posibles`

## 👨‍🎓 Autores

Proyecto desarrollado para la materia de Desarrollo de Software - Terciario Urquiza 2025

## 📞 Contacto

Instituto Terciario Urquiza  
📍 Bv. Oroño 690 - Rosario, Santa Fe
