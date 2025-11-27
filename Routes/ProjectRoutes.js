const express = require('express');
const { evaluateProject } = require('../Services/DssService');

const router = express.Router();

router.get('/modules', (req, res) => {
  const defaultPayload = {
    financials: {},
    production: {},
    market: {},
    simulation: {},
  };
  const evaluation = evaluateProject(defaultPayload);
  res.json({ modules: evaluation.modules });
});

router.post('/project/evaluate', (req, res) => {
  try {
    const results = evaluateProject(req.body || {});
    res.json({ status: 'success', ...results });
  } catch (error) {
    console.error('Error evaluating project', error);
    res.status(400).json({ status: 'error', message: 'No se pudo evaluar el proyecto', details: error.message });
  }
});

module.exports = router;

