# FOCO 2026 — motor Python y dashboard ejecutivo

Proyecto limpio que conserva las vistas RD, DM y Tienda, sus filtros, KPIs, rankings, objetivos, acciones y exportación a PDF. La actualización de datos deja de ser manual: `input/Foco_2026.xlsx` es la fuente y el motor Python genera `data.js` de forma determinista.

## Resultado de esta entrega

- Semana más reciente detectada automáticamente: **31**.
- Mes inicial: **Ago**, obtenido desde `Base_Mes_Semana`.
- S31 se incorpora únicamente donde hay filas reales. El motor no rellena ni arrastra métricas faltantes.
- OMT se calcula como `ADT Real - ADT AA`.
- Segundas Cx se normaliza entre 7, igual que el reporte anterior.
- IPLH, TPLH, variación de inventario y CTC conservan su valor fuente.
- Qualtrics convierte porcentajes de texto a decimales y conserva NPS en escala 0–100.
- El tablero muestra la semana detectada y fuerza actualización de `data.js` para evitar datos antiguos en caché.

## Actualización local

Requiere Python 3.11 o superior.

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python actualizar_reporte.py
python -m unittest discover -s tests -v
python -m http.server 8000
```

Después abre `http://localhost:8000`.

Para exigir una semana concreta:

```bash
python -m engine.foco_engine \
  --excel input/Foco_2026.xlsx \
  --output data.js \
  --audit build/auditoria_datos.json \
  --expected-week 31
```

El proceso falla claramente si falta una pestaña o columna obligatoria, si el año no existe o si el libro no alcanza la semana esperada. `build/auditoria_datos.json` registra cobertura y duplicados por fuente.

## Workflow de GitHub

El workflow `.github/workflows/actualizar-reporte.yml` ejecuta pruebas, genera los datos, crea una auditoría y publica el sitio en GitHub Pages.

Flujo semanal recomendado:

1. Reemplaza `input/Foco_2026.xlsx` con la nueva base, conservando el nombre.
2. Sube el cambio a `main`; el workflow se ejecutará automáticamente.
3. También puedes abrir **Actions → Actualizar y publicar FOCO → Run workflow** y escribir una semana mínima esperada.
4. Si una fuente todavía no trae la semana más reciente, su indicador queda vacío; la auditoría mostrará la cobertura exacta.

En **Settings → Pages**, selecciona **GitHub Actions** como fuente de publicación la primera vez.

## Estructura

```text
.
├── .github/workflows/actualizar-reporte.yml
├── engine/foco_engine/          # extracción, normalización y validación
├── input/Foco_2026.xlsx         # única fuente semanal
├── tests/                       # pruebas del motor
├── data.js                      # salida generada; no editar a mano
├── app.js / index.html / style.css
└── build/auditoria_datos.json   # informe generado localmente
```

## Reglas de conservación

- No cambies los nombres de pestañas y encabezados del Excel sin actualizar el motor.
- No edites `data.js` manualmente.
- Los objetivos, acciones y valores manuales de Peak Hour continúan guardándose en el navegador del usuario.
- El Excel base permanece intacto; el motor solo lo lee.

