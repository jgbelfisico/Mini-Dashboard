// theme.js — Módulo de tema
// Responsabilidad: cambiar entre modo oscuro y claro, recordar la preferencia en localStorage.
//
// Estrategia:
//   Modo oscuro = comportamiento por defecto (sin clase en <body>)
//   Modo claro  = clase "light" en <body>, los estilos de style.css la detectan

var THEME_STORAGE_KEY = 'mini-dashboard-tema';

// Referencia al botón (se asigna en initTheme y se reutiliza en aplicarTema)
var botonTema;

function initTheme() {
  botonTema = document.getElementById('theme-btn');

  // Leemos la preferencia guardada; si es la primera visita, usamos 'dark'
  var temaGuardado = localStorage.getItem(THEME_STORAGE_KEY) || 'dark';
  aplicarTema(temaGuardado);

  botonTema.addEventListener('click', function () {
    // Detectamos el tema actual leyendo la clase del body
    var esClaro   = document.body.classList.contains('light');
    var temaNuevo = esClaro ? 'dark' : 'light';

    aplicarTema(temaNuevo);
    localStorage.setItem(THEME_STORAGE_KEY, temaNuevo);
  });
}

// Aplica el tema al DOM y actualiza el icono del botón
function aplicarTema(tema) {
  if (tema === 'light') {
    document.body.classList.add('light');
    botonTema.textContent = '🌙'; // en modo claro → click lleva al oscuro
    botonTema.title       = 'Cambiar a modo oscuro';
  } else {
    document.body.classList.remove('light');
    botonTema.textContent = '☀️'; // en modo oscuro → click lleva al claro
    botonTema.title       = 'Cambiar a modo claro';
  }
}
