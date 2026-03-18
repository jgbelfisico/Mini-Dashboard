# Mini Dashboard

Dashboard personal minimalista que muestra la hora, el clima y tu lista de tareas en una sola página — sin frameworks, sin backend, sin dependencias externas.

## Tecnologías

- HTML5
- CSS3 (Grid, variables de color, modo claro/oscuro)
- JavaScript puro (sin librerías)
- API de [Open-Meteo](https://open-meteo.com) para el clima (gratuita, sin API key)
- `localStorage` para persistencia de tareas e historial

## Cómo ejecutar localmente

No requiere instalación ni build. Tienes dos opciones:

**Opción 1 — abrir directamente:**
```
Doble click en index.html → se abre en tu navegador
```

**Opción 2 — servidor local** (recomendado para que el clima funcione sin restricciones):
```bash
python3 -m http.server 8000
```
Luego abre `http://localhost:8000` en tu navegador.

## Cómo usar el dashboard

**Reloj y fecha**
Se actualiza solo cada segundo. El saludo cambia según la hora del día.

**Clima**
Escribe el nombre de cualquier ciudad y pulsa **Buscar** o **Enter**. Las últimas ciudades buscadas aparecen como accesos rápidos debajo del buscador.

**Tareas**
Escribe una tarea y pulsa **Agregar** o **Enter**. Haz click en el texto (o en el checkbox) para marcarla como completada. Pulsa **✕** para eliminarla. Las tareas se guardan automáticamente y sobreviven a recargas de página.

**Tema**
Pulsa el botón ☀️ / 🌙 en la esquina del encabezado para cambiar entre modo oscuro y claro. La preferencia se recuerda.

## Demo en vivo

🔗 [Ver demo](https://jgbelfisico.github.io/Mini-Dashboard/)

## Despliegue en GitHub Pages

1. Sube el repositorio a GitHub
2. Ve a **Settings → Pages**
3. En **Source**, selecciona rama `main` y carpeta `/ (root)`
4. Pulsa **Save** — en menos de un minuto tendrás la URL pública

No se necesita ningún paso de build.

## Posibles mejoras futuras

- [ ] Soporte para múltiples zonas horarias
- [ ] Notificaciones de tareas con fecha límite
- [ ] Posibilidad de reordenar tareas con drag & drop
- [ ] Más widgets (noticias, calculadora, notas rápidas)
- [ ] Exportar e importar tareas en JSON

## Estructura

```
├── index.html        ← página principal
├── css/
│   └── style.css     ← estilos del dashboard
└── js/
    ├── app.js        ← inicializa los módulos
    ├── theme.js      ← módulo de tema claro/oscuro
    ├── clock.js      ← módulo de fecha y hora
    ├── weather.js    ← módulo de clima
    └── tasks.js      ← módulo de tareas
```
