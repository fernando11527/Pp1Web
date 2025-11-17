# Comandos de Prueba - Sistema de Inscripción

## 🧪 Pruebas desde la Consola (PowerShell/CMD)

### 1. Verificar que el servidor esté corriendo
```powershell
curl http://localhost:3000/api/carreras
```
**Resultado esperado:** Lista de las 3 carreras disponibles

---

### 2. Buscar alumno por DNI
```powershell
curl -X POST http://localhost:3000/api/alumnos/buscar-dni -H "Content-Type: application/json" -d "{\"dni\":\"41342897\"}"
```
**Resultado esperado:** 
- Datos del alumno Fernando Virgilio
- Lista de carreras asociadas
- Materias aprobadas

---

### 3. Verificar periodo activo para Desarrollo de Software (carreraId=2)
```powershell
curl "http://localhost:3000/api/periodos/activo?carreraId=2"
```
**Resultado esperado:** 
- Periodo activo con fechas de inscripción
- cupoLimite: 200

---

### 4. Ver materias de la carrera Desarrollo de Software
```powershell
curl http://localhost:3000/api/carreras/2/materias
```
**Resultado esperado:** 
- Lista completa de materias (primer, segundo y tercer año)
- Con correlativas

---

### 5. Ver materias posibles para Fernando Virgilio (alumnoId=1)
```powershell
curl "http://localhost:3000/api/alumnos/1/materias-posibles?carreraId=2"
```
**Resultado esperado:** 
- Solo las materias que puede cursar
- Basado en correlativas y materias aprobadas

---

### 6. Crear inscripción de prueba
```powershell
curl -X POST http://localhost:3000/api/inscripciones -H "Content-Type: application/json" -d "{\"alumnoId\":1,\"carreraId\":2,\"materiasIds\":[35,36],\"periodoId\":1}"
```
**Resultado esperado:**
- Inscripción creada exitosamente
- Con nombre de las materias inscriptas
- Fecha de inscripción

---

## 🎯 Casos de Prueba Completos

### Caso 1: Inscripción Exitosa
1. DNI: `41342897` (Fernando Virgilio)
2. Carrera: Desarrollo de Software (id: 2)
3. Materias sugeridas: [35, 36] (segundo año)
4. **Resultado:** ✅ Inscripción exitosa

### Caso 2: DNI No Existente
1. DNI: `99999999`
2. **Resultado:** ❌ Error 404 - Alumno no encontrado

### Caso 3: Sin Periodo Activo
1. Probar con carreraId inexistente o sin periodo activo
2. **Resultado:** ❌ Error - No hay periodo activo

### Caso 4: Materias sin cumplir correlativas
1. Intentar inscribirse a materias de 3er año sin haber aprobado las de 2do
2. **Resultado:** ❌ Las materias aparecen deshabilitadas en el frontend

---

## 🔄 Flujo de Prueba Manual (Frontend)

### Test 1: Flujo Completo Exitoso
1. Abrir `index.html`
2. Ingresar DNI: `41342897`
3. Clic en "Ingresar"
4. Seleccionar "Desarrollo de Software"
5. Clic en "Inscripción a cursar"
6. Marcar 2-3 materias habilitadas
7. Clic en "Confirmar inscripción"
8. Verificar pantalla de confirmación

**Checkpoints:**
- ✅ Nombre del alumno visible
- ✅ Solo una carrera seleccionable a la vez
- ✅ Materias deshabilitadas en gris
- ✅ Confirmación muestra nombres de materias

---

### Test 2: Validación de DNI
1. Ingresar DNI inválido: `abc123`
2. Clic en "Ingresar"
3. **Resultado esperado:** Alerta "Por favor, ingrese un DNI válido"

---

### Test 3: Sin Materias Seleccionadas
1. Completar flujo hasta pantalla de materias
2. NO marcar ninguna materia
3. Clic en "Confirmar inscripción"
4. **Resultado esperado:** Alerta "Debe seleccionar al menos una materia"

---

### Test 4: Verificar localStorage
1. Completar flujo hasta selección de carrera
2. Abrir DevTools (F12) → Console
3. Ejecutar:
```javascript
JSON.parse(localStorage.getItem("alumno"))
JSON.parse(localStorage.getItem("carreraSeleccionada"))
JSON.parse(localStorage.getItem("periodoActivo"))
```
4. **Resultado esperado:** Ver datos guardados correctamente

---

## 🐛 Debugging - Comandos Útiles

### Ver todos los alumnos (admin)
```powershell
curl http://localhost:3000/api/admin/alumnos
```

### Ver todos los periodos (admin)
```powershell
curl http://localhost:3000/api/admin/periodos
```

### Ver inscripciones existentes
```powershell
curl http://localhost:3000/api/inscripciones
```

### Crear un nuevo periodo de prueba
```powershell
curl -X POST http://localhost:3000/api/admin/periodos -H "Content-Type: application/json" -d "{\"carreraId\":2,\"fechaInicio\":\"2025-11-01\",\"fechaFin\":\"2026-04-30\",\"activo\":1,\"cupoLimite\":200}"
```

---

## 📊 Datos de Prueba Disponibles

### Alumnos:
| DNI | Nombre | Carrera | Materias Aprobadas |
|-----|--------|---------|-------------------|
| 41342897 | Fernando Virgilio | DS | 1er año completo excepto UDI y Matemática + algunas de 2do |
| 21044866 | Sergio Machado | DS | Algunas materias de 1er y 2do año |
| 38136139 | Cristian Marchetti | DS | Pocas materias aprobadas |

### IDs de Materias comunes (Desarrollo de Software):
- 26-34: Primer año
- 35-43: Segundo año
- 44-50: Tercer año

---

## ✅ Checklist de Prueba

Antes de presentar, verificar:

- [ ] Backend corriendo en puerto 3000
- [ ] Frontend abre correctamente en el navegador
- [ ] Búsqueda por DNI funciona
- [ ] Aparece la lista de carreras del alumno
- [ ] Validación de periodo activo funciona
- [ ] Materias se cargan correctamente
- [ ] Materias posibles están habilitadas
- [ ] Materias no posibles están deshabilitadas
- [ ] Inscripción se crea correctamente
- [ ] Pantalla de confirmación muestra datos correctos
- [ ] Botón "Salir" limpia localStorage
- [ ] Console del navegador sin errores

---

## 🎓 Para la Presentación

### Demostración sugerida:
1. Mostrar el código del `script.js` explicando el flujo
2. Abrir DevTools para mostrar las llamadas a la API (pestaña Network)
3. Ejecutar un caso de prueba completo
4. Mostrar localStorage para ver los datos guardados
5. Explicar la lógica de habilitación/deshabilitación de materias

### Puntos clave a explicar:
- Uso de `async/await` para llamadas asíncronas
- `localStorage` para mantener estado entre pantallas
- Validaciones en frontend y backend
- Arquitectura: separación frontend/backend
- Manejo de errores con try/catch

---

¡Buena suerte con la presentación! 🚀
