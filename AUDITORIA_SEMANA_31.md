# Auditoría de actualización — Semana 31

Fuente procesada: `input/Foco_2026.xlsx`  
Año detectado: 2026  
Semana más reciente: 31  
Mes inicial: Ago

## Cobertura real de S31

| Indicador | Registros con valor |
| --- | ---: |
| OMT | 890 |
| Segundas Cx | 950 |
| IPLH | 938 |
| TPLH | 938 |
| Variación de inventario | 1,020 |
| CTC tienda | 851 |
| Encuestas | 925 |
| NPS | 924 |
| Conexión | 924 |
| Desempeño operacional | 924 |
| Calidad de bebida | 923 |

El Excel sí contiene OMT e IPLH/TPLH en S31. El vacío observado en el tablero provenía de un `data.js` generado con una versión anterior del libro. El motor v2 vincula cada salida con el SHA-256 del Excel, exige cobertura crítica y la reconciliación independiente bloquea la publicación ante diferencias.

## Controles aprobados

- 968 filas únicas de directorio.
- 29,725 registros consolidados por CeCo y semana.
- 2,362 filas CTC por DM.
- Sin claves duplicadas en la salida consolidada.
- 11 métricas reconciliadas contra el Excel para todas las claves CeCo/semana: OMT, Segundas, IPLH, TPLH, Costo, CTC, Encuestas, NPS, Conexión, Desempeño y Bebida.
- Directorio, Base_Mes_Semana y CTC_DM comparados estructuralmente.
- Sintaxis validada en `data.js`, `app.js`, `slicers.js` y `sw.js`.
- Workflow válido con etapas de prueba, generación, auditoría y publicación.

El detalle técnico está en `AUDITORIA_DATOS.json` y `VALIDACION_DATOS.json`.
