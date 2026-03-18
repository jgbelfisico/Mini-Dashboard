// app.js — Punto de entrada de la aplicación
// Responsabilidad: inicializar todos los módulos cuando el DOM esté listo.

document.addEventListener('DOMContentLoaded', function () {
  initTheme();
  initClock();
  initWeather();
  initTasks();
});
