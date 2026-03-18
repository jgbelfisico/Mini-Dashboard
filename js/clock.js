// clock.js — Módulo de fecha y hora
// Responsabilidad: mostrar la hora y fecha actual, actualizándose cada segundo.

function initClock() {
  // Buscamos los elementos del HTML donde vamos a escribir
  var elementoHora    = document.getElementById('clock-time');
  var elementoFecha   = document.getElementById('clock-date');
  var elementoSaludo  = document.getElementById('greeting');

  // Llamamos a actualizar una vez de inmediato para que no haya retraso visible
  actualizar();

  // Luego repetimos cada 1000 ms (1 segundo) de forma indefinida
  setInterval(actualizar, 1000);

  function actualizar() {
    var ahora = new Date(); // Captura el instante actual

    elementoHora.textContent   = formatearHora(ahora);
    elementoFecha.textContent  = formatearFecha(ahora);
    elementoSaludo.textContent = obtenerSaludo(ahora);
  }
}

// Devuelve la hora en formato HH:MM:SS — ej: "14:05:09"
function formatearHora(fecha) {
  var horas   = String(fecha.getHours()).padStart(2, '0');
  var minutos = String(fecha.getMinutes()).padStart(2, '0');
  var segundos = String(fecha.getSeconds()).padStart(2, '0');

  return horas + ':' + minutos + ':' + segundos;
}

// Devuelve el saludo según la hora del día
function obtenerSaludo(fecha) {
  var hora = fecha.getHours(); // número entre 0 y 23

  if (hora >= 6 && hora < 12)  return 'Buenos días';
  if (hora >= 12 && hora < 20) return 'Buenas tardes';
  return 'Buenas noches';
}

// Devuelve la fecha en formato largo en español — ej: "miércoles, 18 de marzo de 2026"
function formatearFecha(fecha) {
  return fecha.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}
