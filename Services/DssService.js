const DEFAULT_ITERATIONS = 500;

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const buildCashFlowSeries = (financials = {}, production = {}, market = {}) => {
  const providedCashFlows = Array.isArray(financials.cashFlows)
    ? financials.cashFlows.filter((value) => typeof value === 'number')
    : [];

  if (providedCashFlows.length) {
    return providedCashFlows;
  }

  const horizon = financials.horizonYears || financials.revenueProjections?.length || 5;
  const unitPrice = toNumber(market.pricePerUnit ?? market.price ?? 0);
  const growth = toNumber(market.demandGrowth, 0);
  const baseUnits = toNumber(production.expectedUnits ?? production.capacityInstalled ?? market.baseDemand, 0);
  const variableCost = toNumber(financials.variableCostPerUnit ?? production.unitCost ?? 0);
  const fixedCosts = toNumber(financials.fixedCosts, 0);
  const workingCapital = toNumber(financials.workingCapital, 0);

  let demand = baseUnits;
  const cashFlows = [];

  for (let year = 0; year < horizon; year += 1) {
    const revenue = toNumber(financials.revenueProjections?.[year], demand * unitPrice);
    const variableExpenses = toNumber(financials.variableCosts?.[year], demand * variableCost);
    let annualCashFlow = revenue - variableExpenses - fixedCosts;

    if (year === 0) {
      annualCashFlow -= workingCapital;
    }

    if (year === horizon - 1) {
      annualCashFlow += workingCapital; // Recuperamos capital de trabajo al final.
    }

    cashFlows.push(annualCashFlow);
    demand *= 1 + growth;
  }

  return cashFlows;
};

const calculateNPV = (initialInvestment, cashFlows, discountRate) => {
  const rate = toNumber(discountRate, 0) || 0;
  return cashFlows.reduce(
    (acc, cashFlow, index) => acc + cashFlow / (1 + rate) ** (index + 1),
    -toNumber(initialInvestment, 0)
  );
};

const calculateIRR = (initialInvestment, cashFlows, guess = 0.1) => {
  const maxIterations = 100;
  const precision = 1e-7;
  let rate = guess;

  for (let i = 0; i < maxIterations; i += 1) {
    let npv = -initialInvestment;
    let derivative = 0;

    cashFlows.forEach((cashFlow, index) => {
      const period = index + 1;
      const denominator = (1 + rate) ** period;
      npv += cashFlow / denominator;
      derivative -= (period * cashFlow) / ((1 + rate) ** (period + 1));
    });

    if (Math.abs(derivative) < precision) {
      break;
    }

    const newRate = rate - npv / derivative;

    if (Math.abs(newRate - rate) < precision) {
      return newRate;
    }

    rate = newRate;
  }

  return Number.isFinite(rate) ? rate : null;
};

const calculatePaybackPeriod = (initialInvestment, cashFlows) => {
  let cumulative = -initialInvestment;

  for (let year = 0; year < cashFlows.length; year += 1) {
    cumulative += cashFlows[year];
    if (cumulative >= 0) {
      const previousCumulative = cumulative - cashFlows[year];
      const fraction = cashFlows[year] ? (0 - previousCumulative) / cashFlows[year] : 0;
      return {
        years: year,
        fraction: Number.isFinite(fraction) ? fraction : 0,
        totalYears: year + fraction,
      };
    }
  }

  return null;
};

const calculateProfitabilityIndex = (initialInvestment, cashFlows, discountRate) => {
  const positiveNPV = cashFlows.reduce(
    (acc, cashFlow, index) => acc + cashFlow / (1 + discountRate) ** (index + 1),
    0
  );
  return initialInvestment !== 0 ? positiveNPV / initialInvestment : null;
};

const buildSensitivityAnalysis = (initialInvestment, cashFlows, discountRate) => {
  const adjustments = [
    { label: '+10% tasa de descuento', rate: discountRate * 1.1 },
    { label: '-10% tasa de descuento', rate: discountRate * 0.9 },
  ];

  const costImpact = cashFlows.map((cashFlow) => cashFlow * 0.9);
  const revenueImpact = cashFlows.map((cashFlow) => cashFlow * 1.1);

  return {
    discountRate: adjustments.map(({ label, rate }) => ({
      label,
      npv: calculateNPV(initialInvestment, cashFlows, rate),
    })),
    costPressure: {
      label: 'Costos +10%',
      npv: calculateNPV(initialInvestment, costImpact, discountRate),
    },
    revenueUpside: {
      label: 'Ingresos +10%',
      npv: calculateNPV(initialInvestment, revenueImpact, discountRate),
    },
  };
};

const randomNormal = () => {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
};

const runMonteCarloSimulation = ({
  iterations = DEFAULT_ITERATIONS,
  cashFlows,
  initialInvestment,
  discountRate,
  volatility = 0.1,
  opportunityRate = 0,
}) => {
  const irrResults = [];
  const npvResults = [];

  for (let i = 0; i < iterations; i += 1) {
    const simulatedFlows = cashFlows.map((cashFlow) => cashFlow * (1 + randomNormal() * volatility));
    const irr = calculateIRR(initialInvestment, simulatedFlows) ?? 0;
    const npv = calculateNPV(initialInvestment, simulatedFlows, discountRate);
    irrResults.push(irr);
    npvResults.push(npv);
  }

  irrResults.sort((a, b) => a - b);
  npvResults.sort((a, b) => a - b);

  const percentile = (values, p) => {
    const index = Math.floor((values.length - 1) * p);
    return values[index];
  };

  const avg = (values) => (values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0);

  return {
    iterations,
    irr: {
      mean: avg(irrResults),
      p10: percentile(irrResults, 0.1),
      p50: percentile(irrResults, 0.5),
      p90: percentile(irrResults, 0.9),
      deltaVsOpportunity: avg(irrResults) - opportunityRate,
    },
    npv: {
      mean: avg(npvResults),
      p10: percentile(npvResults, 0.1),
      p50: percentile(npvResults, 0.5),
      p90: percentile(npvResults, 0.9),
    },
  };
};

const buildModuleSummary = (inputs) => ({
  financiero: {
    descripcion: 'Evaluaciones VAN, TIR, flujo de caja, escenarios y sensibilidad.',
    supuestos: inputs.financials,
  },
  tecnicoOperativo: {
    descripcion: 'Capacidad instalada, recursos y costos operativos.',
    supuestos: inputs.production,
  },
  mercado: {
    descripcion: 'Demanda potencial y escenarios de ventas.',
    supuestos: inputs.market,
  },
  riesgoIA: {
    descripcion: 'Modelos predictivos y probabilidad de éxito/fracaso.',
    supuestos: { simulacion: inputs.simulation },
  },
  reportes: {
    descripcion: 'Generación de reportes técnicos y ejecutivos.',
  },
  administracion: {
    descripcion: 'Gestión de usuarios y proyectos (pendiente de integrar con módulo de usuarios).',
  },
});

const evaluateProject = (payload) => {
  const financials = payload.financials || {};
  const production = payload.production || {};
  const market = payload.market || {};
  const simulation = payload.simulation || {};

  const initialInvestment = toNumber(financials.initialInvestment, 0) + toNumber(financials.capex, 0);
  const discountRate = toNumber(financials.discountRate, 0.12);
  const opportunityRate = toNumber(financials.opportunityRate ?? financials.tio, discountRate);
  const cashFlows = buildCashFlowSeries(financials, production, market);

  const npv = calculateNPV(initialInvestment, cashFlows, discountRate);
  const irr = calculateIRR(initialInvestment, cashFlows);
  const payback = calculatePaybackPeriod(initialInvestment, cashFlows);
  const profitabilityIndex = calculateProfitabilityIndex(initialInvestment, cashFlows, discountRate);

  const monteCarlo = runMonteCarloSimulation({
    iterations: toNumber(simulation.iterations, DEFAULT_ITERATIONS),
    cashFlows,
    initialInvestment,
    discountRate,
    volatility: toNumber(simulation.volatility, 0.12),
    opportunityRate,
  });

  const sensitivity = buildSensitivityAnalysis(initialInvestment, cashFlows, discountRate);

  const executiveSummary = {
    mensaje: npv > 0 && irr && irr > opportunityRate
      ? 'El proyecto es atractivo frente a la tasa de oportunidad definida.'
      : 'Revisar supuestos: la rentabilidad no supera la tasa objetivo.',
    indicadoresClave: {
      VAN: npv,
      TIR: irr,
      TIO: opportunityRate,
      PRI: payback?.totalYears ?? null,
      IndiceRentabilidad: profitabilityIndex,
    },
  };

  return {
    executiveSummary,
    cashFlows,
    modules: buildModuleSummary({ financials, production, market, simulation }),
    financialMetrics: {
      npv,
      irr,
      opportunityRate,
      profitabilityIndex,
      payback,
    },
    sensitivity,
    monteCarlo,
    assumptions: {
      financials,
      production,
      market,
      simulation,
    },
  };
};

module.exports = {
  evaluateProject,
};

