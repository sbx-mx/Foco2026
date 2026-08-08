# Auditoría de actualización — Semana 31

Fuente procesada: `input/Foco_2026.xlsx`  
Año detectado: 2026  
Semana más reciente: 31  
Mes inicial: Ago

## Cobertura real de S31

| Indicador | Registros con valor |
| --- | ---: |
| Segundas Cx | 950 |
| Variación de inventario | 1,021 |
| CTC tienda | 851 |
| Encuestas | 925 |
| NPS | 924 |
| Conexión | 924 |
| Desempeño operacional | 924 |
| Calidad de bebida | 923 |
| OMT | 0 — la fuente llega a S30 |
| IPLH/TPLH | 0 — la fuente llega a S30 |

El motor conserva los vacíos de OMT e IPLH/TPLH en S31. No se aplicó arrastre, promedio ni sustitución automática.

## Controles aprobados

- 968 filas únicas de directorio.
- 29,729 registros consolidados por CeCo y semana.
- 2,362 filas CTC por DM.
- Sin claves duplicadas en la salida consolidada.
- Valores S31 de CeCo 38101 contrastados directamente contra Segundas Cx, Costo, CTC_Tienda y Base_Qualtrics.
- Sintaxis validada en `data.js`, `app.js`, `slicers.js` y `sw.js`.
- Workflow válido con etapas de prueba, generación, auditoría y publicación.

El detalle técnico por pestaña está en `build/auditoria_datos.json` después de ejecutar el motor.

