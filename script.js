// ============================================
// CONFIGURACIÓN DE LA API
// ============================================
const API_URL = "https://pp1-kbuk.onrender.com/api";

// ============================================
// FUNCIONES AUXILIARES
// ============================================

// Cambia entre pantallas ocultando todas y mostrando solo la indicada
function mostrarPantalla(id) {
  document.querySelectorAll(".container > div").forEach(div => div.classList.add("oculto"));
  document.getElementById(id).classList.remove("oculto");
}

// Navega entre pantallas
function irA(destino) {
  if (destino === "cursado") {
    cargarMateriasParaInscripcion();
  } else if (destino === "mesas") {
    mostrarPantalla("pantallaMesas");
  } else if (destino === "historial") {
    mostrarPantalla("pantallaHistorial");
  } else if (destino === "menu") {
    mostrarPantalla("pantallaMenu");
  } else if (destino === "dni") {
    // Limpiar datos al salir
    localStorage.clear();
    document.getElementById("dni").value = "";
    mostrarPantalla("pantallaDNI");
  }
}

// ============================================
// PASO 1: BUSCAR ALUMNO POR DNI
// ============================================

async function buscarAlumnoPorDNI() {
  const dni = document.getElementById("dni").value.trim();
  
  // Validar que el DNI sea numérico y tenga 7-8 dígitos
  if (!/^\d{7,8}$/.test(dni)) {
    alert("Por favor, ingrese un DNI válido (7-8 dígitos).");
    return;
  }

  // Mostrar indicador de carga
  const btnBuscar = document.getElementById("btnBuscarDNI");
  const loading = document.getElementById("loadingBusqueda");
  const inputDNI = document.getElementById("dni");
  
  btnBuscar.disabled = true;
  btnBuscar.textContent = "Buscando...";
  inputDNI.disabled = true;
  loading.classList.remove("oculto");

  try {
    // Timeout de 15 segundos
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Tiempo de espera agotado")), 15000)
    );

    // Llamada a la API para buscar el alumno por DNI
    const fetchPromise = fetch(`${API_URL}/alumnos/buscar-dni`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dni: dni })
    });

    const response = await Promise.race([fetchPromise, timeoutPromise]);

    // Ocultar indicador de carga
    loading.classList.add("oculto");
    btnBuscar.disabled = false;
    btnBuscar.textContent = "Ingresar";
    inputDNI.disabled = false;

    if (!response.ok) {
      if (response.status === 404) {
        alert("No se encontró ningún alumno con ese DNI.");
      } else {
        alert("Error al buscar el alumno. Intente nuevamente.");
      }
      return;
    }

    const alumno = await response.json();
    
    // Guardar los datos del alumno en localStorage para uso futuro
    localStorage.setItem("alumno", JSON.stringify(alumno));
    
    // Mostrar el nombre del alumno y sus carreras
    mostrarCarrerasDelAlumno(alumno);

  } catch (error) {
    // Ocultar indicador de carga
    loading.classList.add("oculto");
    btnBuscar.disabled = false;
    btnBuscar.textContent = "Ingresar";
    inputDNI.disabled = false;
    
    console.error("Error:", error);
    
    if (error.message === "Tiempo de espera agotado") {
      alert("⏱️ El servidor está tardando en responder.\n\nPor favor, verifique su conexión e intente nuevamente.");
    } else {
      alert("Error al conectar con el servidor. Verifique que esté corriendo.");
    }
  }
}

// ============================================
// PASO 2: MOSTRAR CARRERAS DEL ALUMNO
// ============================================

function mostrarCarrerasDelAlumno(alumno) {
  // Mostrar el nombre del alumno
  document.getElementById("nombreAlumno").textContent = `${alumno.nombre} ${alumno.apellido}`;
  
  const listaCarreras = document.getElementById("listaCarreras");
  listaCarreras.innerHTML = "";

  if (!alumno.carreras || alumno.carreras.length === 0) {
    listaCarreras.innerHTML = "<p>No tienes carreras asignadas.</p>";
    mostrarPantalla("pantallaSeleccionCarrera");
    return;
  }

  // Crear botones para cada carrera
  alumno.carreras.forEach(carrera => {
    const btn = document.createElement("button");
    btn.textContent = carrera.nombre;
    btn.onclick = () => seleccionarCarrera(carrera);
    listaCarreras.appendChild(btn);
  });

  mostrarPantalla("pantallaSeleccionCarrera");
}

// ============================================
// PASO 3: SELECCIONAR CARRERA Y VALIDAR PERIODO
// ============================================

async function seleccionarCarrera(carrera) {
  // Guardar la carrera seleccionada en localStorage
  localStorage.setItem("carreraSeleccionada", JSON.stringify(carrera));

  try {
    // Verificar si hay un periodo activo para esta carrera
    const response = await fetch(`${API_URL}/periodos/activo?carreraId=${carrera.id}`);

    if (!response.ok) {
      alert(`No hay periodo de inscripción activo para ${carrera.nombre}`);
      return;
    }

    const periodo = await response.json();
    
    // Guardar el periodo en localStorage
    localStorage.setItem("periodoActivo", JSON.stringify(periodo));

    // Mostrar el menú principal
    mostrarPantalla("pantallaMenu");

  } catch (error) {
    console.error("Error:", error);
    alert("Error al verificar el periodo de inscripción.");
  }
}

// ============================================
// PASO 4: CARGAR MATERIAS PARA INSCRIPCIÓN
// ============================================

async function cargarMateriasParaInscripcion() {
  const alumno = JSON.parse(localStorage.getItem("alumno"));
  const carrera = JSON.parse(localStorage.getItem("carreraSeleccionada"));
  const periodo = JSON.parse(localStorage.getItem("periodoActivo"));

  if (!alumno || !carrera || !periodo) {
    alert("Error: datos no encontrados. Vuelva a ingresar.");
    irA("dni");
    return;
  }

  // IMPORTANTE: Verificar si el alumno ya está inscripto en este periodo
  try {
    const responseVerificar = await fetch(
      `${API_URL}/inscripciones/verificar?alumnoId=${alumno.id}&periodoId=${periodo.id}`
    );
    const verificacion = await responseVerificar.json();

    if (verificacion.yaInscripto) {
      alert("Ya tienes una inscripción registrada en este período. No puedes inscribirte nuevamente.");
      irA("menu");
      return;
    }
  } catch (error) {
    console.error("Error al verificar inscripción:", error);
    alert("Error al verificar tu inscripción. Intenta nuevamente.");
    return;
  }

  // Mostrar el nombre de la carrera en la pantalla
  document.getElementById("nombreCarreraActual").textContent = carrera.nombre;

  // Mostrar pantalla y el indicador de carga
  mostrarPantalla("pantallaCursado");
  const loading = document.getElementById("loadingMaterias");
  loading.classList.remove("oculto");

  try {
    // Timeout de 20 segundos
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Tiempo de espera agotado")), 20000)
    );

    // Obtener TODAS las materias de la carrera
    const fetchMaterias = fetch(`${API_URL}/carreras/${carrera.id}/materias`);
    const responseTodasMaterias = await Promise.race([fetchMaterias, timeoutPromise]);
    const todasMaterias = await responseTodasMaterias.json();

    // Obtener las materias en las que el alumno PUEDE inscribirse
    const fetchPosibles = fetch(`${API_URL}/alumnos/${alumno.id}/materias-posibles?carreraId=${carrera.id}`);
    const responsePosibles = await Promise.race([fetchPosibles, timeoutPromise]);
    const materiasPosibles = await responsePosibles.json();

    // Ocultar indicador de carga
    loading.classList.add("oculto");

    // Crear un Set con los IDs de materias posibles para búsqueda rápida
    const idsPosibles = new Set(materiasPosibles.map(m => m.id));

    // Renderizar las materias agrupadas por año
    renderizarMaterias(todasMaterias, idsPosibles);

  } catch (error) {
    // Ocultar indicador de carga
    loading.classList.add("oculto");
    
    console.error("Error:", error);
    
    if (error.message === "Tiempo de espera agotado") {
      alert("⏱️ Error al cargar las materias.\n\nEl servidor está tardando en responder.");
    } else {
      alert("Error al cargar las materias.");
    }
    
    irA("menu");
  }
}

// ============================================
// RENDERIZAR MATERIAS EN EL FORMULARIO
// ============================================

function renderizarMaterias(materias, idsPosibles) {
  const form = document.getElementById("formMaterias");
  form.innerHTML = "";

  // Agrupar materias por año
  const materiasPorAnio = {};
  materias.forEach(materia => {
    if (!materiasPorAnio[materia.anio]) {
      materiasPorAnio[materia.anio] = [];
    }
    materiasPorAnio[materia.anio].push(materia);
  });

  // Renderizar cada año y sus materias
  Object.keys(materiasPorAnio).sort().forEach(anio => {
    const titulo = document.createElement("h4");
    titulo.textContent = `${anio}° Año`;
    form.appendChild(titulo);

    materiasPorAnio[anio].forEach(materia => {
      const div = document.createElement("div");

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = `materia_${materia.id}`;
      checkbox.name = "materias";
      checkbox.value = materia.id;

      // Si la materia NO está en las posibles, deshabilitar el checkbox
      if (!idsPosibles.has(materia.id)) {
        checkbox.disabled = true;
      }

      const label = document.createElement("label");
      label.htmlFor = checkbox.id;
      label.textContent = materia.nombre;
      
      // Agregar estilo visual para materias deshabilitadas
      if (checkbox.disabled) {
        label.style.color = "#999";
      }

      div.appendChild(checkbox);
      div.appendChild(label);
      form.appendChild(div);
    });
  });
}

// ============================================
// PASO 5: ENVIAR INSCRIPCIÓN
// ============================================

async function enviarInscripcion() {
  const alumno = JSON.parse(localStorage.getItem("alumno"));
  const carrera = JSON.parse(localStorage.getItem("carreraSeleccionada"));
  const periodo = JSON.parse(localStorage.getItem("periodoActivo"));

  // Obtener los IDs de las materias seleccionadas
  const materiasSeleccionadas = Array.from(
    document.querySelectorAll("input[name='materias']:checked")
  ).map(el => parseInt(el.value));

  if (materiasSeleccionadas.length === 0) {
    alert("Debe seleccionar al menos una materia.");
    return;
  }

  // ADVERTENCIA IMPORTANTE: Confirmar antes de inscribirse
  const confirmar = confirm(
    "⚠️ ATENCIÓN: Una vez confirmada la inscripción, NO podrás modificarla ni cancelarla.\n\n" +
    "Por favor, verifica que hayas seleccionado correctamente todas las materias.\n\n" +
    "¿Deseas confirmar la inscripción?"
  );

  if (!confirmar) {
    return; // El usuario canceló
  }

  // Mostrar indicador de carga
  const btnConfirmar = document.getElementById("btnConfirmarInscripcion");
  const loading = document.getElementById("loadingInscripcion");
  
  btnConfirmar.disabled = true;
  btnConfirmar.textContent = "Procesando...";
  loading.classList.remove("oculto");

  try {
    // Timeout de 30 segundos
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Tiempo de espera agotado")), 30000)
    );

    // Enviar la inscripción al backend con timeout
    const fetchPromise = fetch(`${API_URL}/inscripciones`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        alumnoId: alumno.id,
        carreraId: carrera.id,
        materiasIds: materiasSeleccionadas,
        periodoId: periodo.id
      })
    });

    const response = await Promise.race([fetchPromise, timeoutPromise]);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.message || "Error desconocido");
    }

    const resultado = await response.json();
    
    // Ocultar indicador de carga
    loading.classList.add("oculto");
    btnConfirmar.disabled = false;
    btnConfirmar.textContent = "Confirmar inscripción";
    
    // Mostrar confirmación con los nombres de las materias
    mostrarConfirmacion(resultado);

  } catch (error) {
    // Ocultar indicador de carga
    loading.classList.add("oculto");
    btnConfirmar.disabled = false;
    btnConfirmar.textContent = "Confirmar inscripción";
    
    console.error("Error:", error);
    
    if (error.message === "Tiempo de espera agotado") {
      alert("⏱️ La operación está tardando más de lo esperado.\n\n" +
            "Esto puede deberse a:\n" +
            "• Conexión lenta con el servidor\n" +
            "• Envío de email en proceso\n\n" +
            "Por favor, espere un momento y verifique su inscripción en el historial.");
    } else {
      alert(`Error al inscribirse: ${error.message}`);
    }
  }
}

// ============================================
// MOSTRAR CONFIRMACIÓN DE INSCRIPCIÓN
// ============================================

function mostrarConfirmacion(resultado) {
  const detalle = document.getElementById("detalleInscripcion");
  detalle.innerHTML = `
    <p><strong>Inscripción realizada con éxito</strong></p>
    <p>Fecha: ${new Date(resultado.inscripcion.fechaInscripcion).toLocaleDateString()}</p>
    <p><strong>Materias inscriptas:</strong></p>
    <ul>
      ${resultado.inscripcion.materias.map(m => `<li>${m.nombre}</li>`).join("")}
    </ul>
  `;
  
  mostrarPantalla("pantallaConfirmacion");
}

document.addEventListener("DOMContentLoaded", function() {
  const slides = document.querySelectorAll(".carrusel .slide");
  let index = 0;

  function mostrarSlide(i) {
    slides.forEach(slide => slide.classList.remove("activo"));
    slides[i].classList.add("activo");
  }

  function siguienteSlide() {
    index = (index + 1) % slides.length;
    mostrarSlide(index);
  }

  // Mostrar el primer slide
  mostrarSlide(index);

  // Cambiar cada 4 segundos
  setInterval(siguienteSlide, 4000);
});
