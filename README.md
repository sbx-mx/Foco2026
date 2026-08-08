# FOCO 2026 — motor Python, auditoría y dashboard ejecutivo

Proyecto limpio que conserva las vistas RD, DM y Tienda, sus filtros, KPIs, rankings, objetivos, acciones y exportación a PDF. La actualización de datos deja de ser manual: `input/Foco_2026.xlsx` es la fuente y el motor Python genera `data.js` de forma determinista.

## Resultado de esta entrega

- Semana más reciente detectada automáticamente: **31**.
- Mes inicial: **Ago**, obtenido desde `Base_Mes_Semana`.
- **OMT S31: 890 valores; IPLH S31: 938; TPLH S31: 938.** El problema anterior era un `data.js` obsoleto, no la ausencia de datos en Excel.
- S31 se incorpora únicamente donde hay filas reales. El motor no rellena, inventa ni arrastra métricas faltantes.
- OMT se calcula como `ADT Real - ADT AA`.
- Segundas Cx se normaliza entre 7, igual que el reporte anterior.
- IPLH, TPLH, variación de inventario y CTC conservan su valor fuente.
- Qualtrics convierte porcentajes de texto a decimales, conserva NPS en escala 0–100 y consolida duplicados mediante promedio ponderado por encuestas.
- La vista ejecutiva muestra **IPLH / TPLH** conjuntamente; ambos valores siguen siendo métricas independientes.
- Cada generación registra SHA-256 del Excel y una segunda rutina reconcilia todos los valores fuente→salida.
- El tablero muestra la semana detectada y fuerza actualización de `data.js` para evitar datos antiguos en caché.

## Actualización local

Requiere Python 3.11 o superior.

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python actualizar_reporte.py
python -m engine.foco_engine.validator --excel input/Foco_2026.xlsx --data data.js --audit AUDITORIA_DATOS.json --report VALIDACION_DATOS.json
python -m unittest discover -s tests -v
python -m http.server 8000
```

Después abre `http://localhost:8000`.

Para exigir una semana concreta:

```bash
python -m engine.foco_engine \
  --excel input/Foco_2026.xlsx \
  --output data.js \
  --audit AUDITORIA_DATOS.json \
  --expected-week 31
```

El proceso detecta los encabezados por nombre en las primeras filas y falla claramente si falta una pestaña o columna obligatoria, si el año no existe, si el libro no alcanza la semana esperada o si OMT/IPLH/TPLH no tienen valores en la semana más reciente. `AUDITORIA_DATOS.json` registra cobertura, duplicados y huella del archivo. `VALIDACION_DATOS.json` compara de manera independiente cada métrica, además de Directorio, calendario y CTC_DM.

## Workflow de GitHub

El workflow `.github/workflows/actualizar-reporte.yml` ejecuta pruebas, lee todas las pestañas, genera los datos, reconcilia el resultado y publica el sitio en GitHub Pages. Si todo es correcto, también guarda automáticamente `data.js` y las dos auditorías en `main`; así el repositorio no vuelve a quedar con datos viejos.

Flujo semanal recomendado:

1. Reemplaza `input/Foco_2026.xlsx` con la nueva base, conservando el nombre.
2. Sube el cambio a `main`; el workflow se ejecutará automáticamente.
3. También puedes abrir **Actions → Actualizar y publicar FOCO → Run workflow** y escribir una semana mínima esperada.
4. Si una fuente crítica no trae la semana más reciente, el workflow se detiene. Para las demás fuentes, la auditoría muestra la cobertura exacta sin fabricar datos.

En **Settings → Pages**, selecciona **GitHub Actions** como fuente de publicación la primera vez.

## Estructura

```text
.
├── .github/workflows/actualizar-reporte.yml
├── engine/foco_engine/          # extracción, normalización y validación
├── input/Foco_2026.xlsx         # única fuente semanal
├── tests/                       # pruebas del motor
├── data.js                      # salida generada; no editar a mano
├── AUDITORIA_DATOS.json         # lectura y cobertura por pestaña
├── VALIDACION_DATOS.json        # reconciliación independiente
├── app.js / index.html / style.css
└── engine/package_site.py       # empaquetado de GitHub Pages
```

## Reglas de conservación

- No cambies los nombres de pestañas y encabezados del Excel sin actualizar el motor.
- No edites `data.js` manualmente.
- Los objetivos, acciones y valores manuales de Peak Hour continúan guardándose en el navegador del usuario.
- El Excel base permanece intacto; el motor solo lo lee.
