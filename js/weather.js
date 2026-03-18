// weather.js — Módulo de clima
// Responsabilidad: obtener y mostrar el clima actual según una ciudad.
// Usa Open-Meteo (https://open-meteo.com) — gratuita, sin API key.
//
// Flujo:
//   nombre de ciudad → API de geocoding → coordenadas → API de clima → datos → DOM

// Clave para recordar la última ciudad buscada
var WEATHER_STORAGE_KEY = 'mini-dashboard-ciudad';

// Clave para guardar el historial de ciudades buscadas
var WEATHER_HISTORY_KEY = 'mini-dashboard-historial';

// Número máximo de ciudades que guardamos en el historial
var MAX_HISTORIAL = 5;

// Ciudad que se carga en la primera visita (cuando no hay ninguna guardada)
var CIUDAD_POR_DEFECTO = 'Madrid';

// URLs base de las dos APIs que usamos
var URL_GEOCODING = 'https://geocoding-api.open-meteo.com/v1/search';
var URL_CLIMA     = 'https://api.open-meteo.com/v1/forecast';

// Referencias a todos los elementos de la tarjeta (se asignan en initWeather)
var elLoading;
var elResultado;
var elError;
var elHistorial;
var elHistorialLista;
var elInput;
// Elementos dentro del panel de resultado
var elIcono;
var elTemp;
var elCiudad;
var elDesc;
var elViento;

function initWeather() {
  elInput          = document.getElementById('weather-input');
  elLoading        = document.getElementById('weather-loading');
  elResultado      = document.getElementById('weather-result');
  elError          = document.getElementById('weather-error');
  elHistorial      = document.getElementById('weather-history');
  elHistorialLista = document.getElementById('weather-history-list');
  elIcono          = document.getElementById('weather-icon');
  elTemp           = document.getElementById('weather-temp');
  elCiudad         = document.getElementById('weather-city');
  elDesc           = document.getElementById('weather-desc');
  elViento         = document.getElementById('weather-wind');

  var boton = document.getElementById('weather-btn');

  // Extraemos la lógica compartida a una función para no repetirla
  function manejarBusqueda() {
    var ciudad = elInput.value.trim();
    if (ciudad === '') return;
    buscarClima(ciudad);
  }

  boton.addEventListener('click', manejarBusqueda);

  // Permitimos buscar también con la tecla Enter dentro del input
  elInput.addEventListener('keydown', function (evento) {
    if (evento.key === 'Enter') manejarBusqueda();
  });

  // Cargamos la última ciudad buscada; si es la primera visita, usamos la ciudad por defecto
  var ciudadInicial = localStorage.getItem(WEATHER_STORAGE_KEY) || CIUDAD_POR_DEFECTO;
  elInput.value = ciudadInicial;
  buscarClima(ciudadInicial);

  // Mostramos el historial guardado al iniciar (si existe)
  renderizarHistorial();
}

// Orquesta el proceso completo: geocoding → clima → mostrar
function buscarClima(ciudad) {
  mostrarCargando();

  // Paso 1: convertir el nombre de la ciudad a coordenadas (lat, lon)
  obtenerCoordenadas(ciudad)
    .then(function (coordenadas) {
      // Paso 2: con las coordenadas, pedir los datos del clima
      return obtenerDatosClima(coordenadas.lat, coordenadas.lon, coordenadas.nombre);
    })
    .then(function (datos) {
      // Paso 3: mostrar los datos en la tarjeta
      mostrarResultado(datos);
      // Guardamos la ciudad para la próxima vez que se abra el dashboard
      localStorage.setItem(WEATHER_STORAGE_KEY, ciudad);
      // Añadimos la ciudad al historial solo si la búsqueda fue exitosa
      guardarHistorial(ciudad);
      renderizarHistorial();
    })
    .catch(function (error) {
      // Si cualquier paso falla, mostramos el mensaje de error
      mostrarError(error.message);
    });
}

// Llama a la API de geocoding y devuelve { lat, lon, nombre }
function obtenerCoordenadas(ciudad) {
  var url = URL_GEOCODING + '?name=' + encodeURIComponent(ciudad) + '&count=1&language=es&format=json';

  return fetch(url)
    .then(function (respuesta) {
      // fetch solo lanza error en fallos de red, no en errores HTTP (404, 500...).
      // Por eso verificamos manualmente que la respuesta sea exitosa.
      if (!respuesta.ok) {
        throw new Error('Error al conectar con el servicio de búsqueda. Intenta más tarde.');
      }
      return respuesta.json();
    })
    .then(function (datos) {
      // Si no hay resultados, la ciudad no existe o está mal escrita
      if (!datos.results || datos.results.length === 0) {
        throw new Error('Ciudad no encontrada. Verifica el nombre e intenta de nuevo.');
      }

      var lugar = datos.results[0];
      return {
        lat:    lugar.latitude,
        lon:    lugar.longitude,
        nombre: lugar.name + (lugar.country ? ', ' + lugar.country : '')
      };
    })
    .catch(function (error) {
      // Los errores de red llegan como TypeError (sin importar el navegador).
      // Los errores que nosotros lanzamos con "throw new Error(...)" no son TypeError,
      // así que los dejamos pasar sin modificar.
      if (error instanceof TypeError) {
        throw new Error('Sin conexión a internet. Verifica tu red e intenta de nuevo.');
      }
      throw error;
    });
}

// Llama a la API del clima con las coordenadas y devuelve los datos formateados
function obtenerDatosClima(lat, lon, nombreCiudad) {
  var url = URL_CLIMA
    + '?latitude='  + lat
    + '&longitude=' + lon
    + '&current=temperature_2m,weathercode,windspeed_10m'
    + '&timezone=auto';

  return fetch(url)
    .then(function (respuesta) {
      if (!respuesta.ok) {
        throw new Error('Error al conectar con el servicio de clima. Intenta más tarde.');
      }
      return respuesta.json();
    })
    .then(function (datos) {
      if (!datos.current) {
        throw new Error('No se pudo obtener el clima. Intenta más tarde.');
      }

      var actual = datos.current;
      return {
        ciudad:      nombreCiudad,
        temperatura: Math.round(actual.temperature_2m),
        viento:      Math.round(actual.windspeed_10m),
        icono:       obtenerIcono(actual.weathercode),
        descripcion: obtenerDescripcion(actual.weathercode)
      };
    });
}

// Lee el historial guardado en localStorage y lo devuelve como array
function cargarHistorial() {
  var datos = localStorage.getItem(WEATHER_HISTORY_KEY);
  if (datos === null) return [];
  try {
    return JSON.parse(datos);
  } catch (e) {
    return [];
  }
}

// Añade una ciudad al historial: sin duplicados, más reciente primero, máximo MAX_HISTORIAL
function guardarHistorial(ciudad) {
  var historial = cargarHistorial();

  // Si la ciudad ya estaba, la quitamos para reinsertarla al frente
  historial = historial.filter(function (c) { return c !== ciudad; });

  // La añadimos al principio (búsqueda más reciente = primera posición)
  historial.unshift(ciudad);

  // Recortamos al máximo permitido
  historial = historial.slice(0, MAX_HISTORIAL);

  localStorage.setItem(WEATHER_HISTORY_KEY, JSON.stringify(historial));
}

// Dibuja las píldoras del historial en el DOM
function renderizarHistorial() {
  var historial = cargarHistorial();

  // Si no hay historial, ocultamos toda la sección
  if (historial.length === 0) {
    elHistorial.classList.add('hidden');
    return;
  }

  // Limpiamos y reconstruimos la lista de píldoras
  elHistorialLista.innerHTML = '';

  historial.forEach(function (ciudad) {
    var boton = document.createElement('button');
    boton.type        = 'button';
    boton.className   = 'weather-history-item';
    boton.textContent = ciudad;

    // Al hacer click: rellenamos el input y lanzamos la búsqueda directamente
    boton.addEventListener('click', function () {
      elInput.value = ciudad;
      buscarClima(ciudad);
    });

    elHistorialLista.appendChild(boton);
  });

  elHistorial.classList.remove('hidden');
}

// Muestra un panel y oculta los otros dos.
// classList.toggle(clase, condición): añade la clase si la condición es true, la quita si es false.
function activarPanel(panelActivo) {
  [elLoading, elResultado, elError].forEach(function (panel) {
    panel.classList.toggle('hidden', panel !== panelActivo);
  });
}

function mostrarCargando() {
  activarPanel(elLoading);
}

function mostrarResultado(datos) {
  elIcono.textContent  = datos.icono;
  elTemp.textContent   = datos.temperatura + '°C';
  elCiudad.textContent = datos.ciudad;
  elDesc.textContent   = datos.descripcion;
  elViento.textContent = '💨 ' + datos.viento + ' km/h';

  activarPanel(elResultado);
}

function mostrarError(mensaje) {
  elError.textContent = mensaje;
  activarPanel(elError);
}

// Devuelve un emoji según el código WMO del clima
// Referencia de códigos: https://open-meteo.com/en/docs#weathervariables
function obtenerIcono(codigo) {
  if (codigo === 0)    return '☀️';  // Cielo despejado
  if (codigo <= 3)     return '⛅';  // Parcialmente nublado
  if (codigo <= 48)    return '🌫️'; // Niebla
  if (codigo <= 55)    return '🌦️'; // Llovizna
  if (codigo <= 65)    return '🌧️'; // Lluvia
  if (codigo <= 75)    return '🌨️'; // Nieve
  if (codigo <= 82)    return '🌦️'; // Chubascos
  if (codigo <= 99)    return '⛈️'; // Tormenta
  return '🌡️';
}

// Devuelve una descripción en español según el código WMO
function obtenerDescripcion(codigo) {
  if (codigo === 0)                   return 'Cielo despejado';
  if (codigo === 1)                   return 'Mayormente despejado';
  if (codigo === 2)                   return 'Parcialmente nublado';
  if (codigo === 3)                   return 'Nublado';
  if (codigo === 45 || codigo === 48) return 'Niebla';
  if (codigo >= 51 && codigo <= 55)   return 'Llovizna';
  if (codigo >= 61 && codigo <= 65)   return 'Lluvia';
  if (codigo >= 71 && codigo <= 75)   return 'Nieve';
  if (codigo === 77)                  return 'Granizo fino';
  if (codigo >= 80 && codigo <= 82)   return 'Chubascos';
  if (codigo === 85 || codigo === 86) return 'Chubascos de nieve';
  if (codigo === 95)                  return 'Tormenta';
  if (codigo === 96 || codigo === 99) return 'Tormenta con granizo';
  return 'Condición desconocida';
}
