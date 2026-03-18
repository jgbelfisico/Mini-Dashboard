# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Cómo correr el proyecto

No requiere instalación. Abrir `index.html` directamente en el navegador. Para evitar restricciones de CORS al consultar la API de clima, usar un servidor local:

```bash
python3 -m http.server 8000
# Luego abrir http://localhost:8000
```

## Arquitectura

Aplicación de una sola página (HTML + CSS + JS puro, sin frameworks ni backend).

**Principio central:** cada módulo es independiente. Se comunican únicamente a través del DOM usando `id` predefinidos en el HTML. El único archivo que conoce todos los módulos es `app.js`.

```
index.html   → estructura y IDs del DOM
css/style.css → estilos (dark theme, grid, tarjetas)
js/app.js    → inicializa los tres módulos al cargar el DOM
js/clock.js  → initClock(): reloj con setInterval cada 1s
js/tasks.js  → initTasks(): CRUD de tareas + localStorage
js/weather.js → initWeather(): geocoding + clima vía Open-Meteo
```

## Módulos

**`clock.js`** — sin dependencias externas. `formatearHora` y `formatearFecha` son funciones globales; `actualizar` es una función anidada (closure) que accede a los elementos del DOM capturados en `initClock`.

**`tasks.js`** — fuente de verdad: array `tareas` en memoria. Toda operación (agregar, completar, eliminar) modifica el array → llama `guardarTareas()` → llama `renderizarLista()` que reconstruye el DOM completo. Clave de localStorage: `'mini-dashboard-tareas'`.

**`weather.js`** — dos llamadas fetch encadenadas con `.then()`: primero geocoding (ciudad → coordenadas), luego clima (coordenadas → datos). Tres estados visuales exclusivos: `#weather-loading`, `#weather-result`, `#weather-error`. Clave de localStorage: `'mini-dashboard-ciudad'`.

## API de clima

Open-Meteo — gratuita, sin API key, sin registro.
- Geocoding: `https://geocoding-api.open-meteo.com/v1/search`
- Clima: `https://api.open-meteo.com/v1/forecast`

Los campos solicitados son `temperature_2m`, `weathercode` (estándar WMO) y `windspeed_10m`.
