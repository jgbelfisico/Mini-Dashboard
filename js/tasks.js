// tasks.js — Módulo de tareas
// Responsabilidad: gestionar la lista de tareas (agregar, completar, eliminar).
// Las tareas se persisten en localStorage para sobrevivir a recargas de página.

// Clave que usamos para guardar y leer en localStorage
var STORAGE_KEY = 'mini-dashboard-tareas';

// Array en memoria que contiene todas las tareas.
// Cada tarea es un objeto: { id, text, done }
var tareas = [];

// Referencias a los elementos del DOM (se asignan en initTasks)
var elLista;
var elVacio;
var elContador;

function initTasks() {
  var formulario = document.getElementById('tasks-form');
  var input      = document.getElementById('tasks-input');

  elLista    = document.getElementById('tasks-list');
  elVacio    = document.getElementById('tasks-empty');
  elContador = document.getElementById('tasks-counter');

  // Escuchamos el evento "submit" del formulario (botón Agregar o tecla Enter)
  formulario.addEventListener('submit', function (evento) {
    // Evitamos que el formulario recargue la página (comportamiento por defecto)
    evento.preventDefault();

    var texto = input.value.trim(); // Quitamos espacios al inicio y al final

    // No hacemos nada si el campo está vacío
    if (texto === '') return;

    agregarTarea(texto);

    input.value = ''; // Limpiamos el campo después de agregar
    input.focus();    // Devolvemos el foco para que el usuario pueda seguir escribiendo
  });

  // Cargamos las tareas guardadas y las mostramos al iniciar
  tareas = cargarTareas();
  renderizarLista();
}

// Crea una tarea nueva y la agrega al array
function agregarTarea(texto) {
  var tarea = {
    id:   Date.now(), // Número único basado en la hora actual (ej: 1742300000000)
    text: texto,
    done: false
  };

  tareas.push(tarea);
  guardarTareas();
  renderizarLista();
}

// Cambia el estado de una tarea entre completada y pendiente
function toggleTarea(id) {
  var tarea = tareas.find(function (t) { return t.id === id; });

  if (tarea) {
    tarea.done = !tarea.done; // Si era false pasa a true, y viceversa
    guardarTareas();
    renderizarLista();
  }
}

// Elimina una tarea del array por su id
function eliminarTarea(id) {
  // filter devuelve un nuevo array sin la tarea que queremos borrar
  tareas = tareas.filter(function (t) { return t.id !== id; });
  guardarTareas();
  renderizarLista();
}

// Dibuja la lista completa en el DOM a partir del array `tareas`
function renderizarLista() {
  elLista.innerHTML = '';

  // Actualizamos el contador de tareas pendientes (done === false)
  var pendientes = tareas.filter(function (t) { return !t.done; }).length;
  if (pendientes > 0) {
    elContador.textContent = pendientes + ' pendiente' + (pendientes === 1 ? '' : 's');
    elContador.classList.remove('hidden');
  } else {
    elContador.classList.add('hidden');
  }

  // Mostramos el mensaje de lista vacía solo si no hay tareas
  if (tareas.length === 0) {
    elVacio.classList.remove('hidden');
    return;
  }

  elVacio.classList.add('hidden');

  // Creamos un elemento <li> por cada tarea
  tareas.forEach(function (tarea) {
    elLista.appendChild(crearElementoTarea(tarea));
  });
}

// Convierte el array `tareas` a texto JSON y lo guarda en localStorage
function guardarTareas() {
  // JSON.stringify convierte el array de objetos en una cadena de texto
  // Ejemplo: '[{"id":1,"text":"Comprar leche","done":false}]'
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tareas));
}

// Lee el texto guardado en localStorage y lo convierte de vuelta a un array
function cargarTareas() {
  var datos = localStorage.getItem(STORAGE_KEY);

  // Si no hay nada guardado todavía, devolvemos un array vacío
  if (datos === null) return [];

  // Usamos try/catch por si los datos guardados están corruptos.
  // En ese caso descartamos todo y empezamos con una lista vacía.
  try {
    return JSON.parse(datos);
  } catch (e) {
    return [];
  }
}

// Construye y devuelve el elemento <li> para una tarea
function crearElementoTarea(tarea) {
  var li = document.createElement('li');
  li.className = 'task-item' + (tarea.done ? ' done' : '');

  // Checkbox para marcar como completada
  var checkbox = document.createElement('input');
  checkbox.type      = 'checkbox';
  checkbox.className = 'task-checkbox';
  checkbox.checked   = tarea.done;
  checkbox.addEventListener('change', function () {
    toggleTarea(tarea.id);
  });

  // Texto de la tarea
  var span = document.createElement('span');
  span.className   = 'task-text';
  span.textContent = tarea.text;

  // Botón para eliminar
  var botonEliminar = document.createElement('button');
  botonEliminar.type      = 'button';
  botonEliminar.className = 'task-delete';
  botonEliminar.textContent = '✕';
  botonEliminar.title       = 'Eliminar tarea';
  botonEliminar.addEventListener('click', function () {
    eliminarTarea(tarea.id);
  });

  li.appendChild(checkbox);
  li.appendChild(span);
  li.appendChild(botonEliminar);

  return li;
}
