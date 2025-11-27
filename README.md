# TalentoTech DSS

Aplicación Express que ofrece un DSS (Decision Support System) para evaluar proyectos de preinversión de pymes manufactureras en Bogotá. Incluye los módulos financieros, técnico-operativos, de mercado, riesgo/IA, reportes y administración descritos en el requerimiento.

## Características

- API REST (`/api/project/evaluate`) que calcula VAN, TIR, TIO, PRI e índice de rentabilidad con análisis de sensibilidad.
- Motor de simulación de Monte Carlo para flujos de caja y TIR, ideal para cuantificar escenarios de éxito/fracaso.
- Interfaz web estática (public/index.html) con formulario de evaluación rápida y resumen ejecutivo.
- Módulo de usuarios existente reutilizado bajo `/api/user`.

## Requisitos

- Node.js 18+
- Variables de entorno opcionales para MongoDB (el archivo usa actualmente una cadena de conexión embebida; reemplácela por la suya en `index.js`).

## Instalación

```bash
npm install
```

## Ejecución

```bash
node index.js
```

Luego visita `http://localhost:3000` para usar la interfaz DSS o consume el endpoint `POST http://localhost:3000/api/project/evaluate`.

### Ejemplo de payload

```json
{
  "financials": {
    "initialInvestment": 250000000,
    "discountRate": 0.18,
    "opportunityRate": 0.14,
    "workingCapital": 25000000,
    "horizonYears": 5,
    "fixedCosts": 52000000,
    "variableCostPerUnit": 22000
  },
  "production": {
    "capacityInstalled": 12000,
    "unitCost": 22000
  },
  "market": {
    "pricePerUnit": 45000,
    "demandGrowth": 0.07,
    "baseDemand": 10200
  },
  "simulation": {
    "volatility": 0.12,
    "iterations": 600
  }
}
```

La respuesta incluye los flujos proyectados, métricas financieras, sensibilidad y resultados del modelo probabilístico.
