const path = require('path');
const express = require('express');
const mongoose = require('mongoose');

const app = express();
const port = 3001;

const userRoutes = require('./Routes/UserRoutes');
const projectRoutes = require('./Routes/ProjectRoutes');

try {
  require('dotenv').config();
} catch (error) {
  console.warn('dotenv no está disponible, se usarán variables por defecto');
}

const dbUrl = process.env.DB_URL;
if (dbUrl) {
  mongoose
    .connect(dbUrl)
    .then(() => console.log('Conectado a MongoDB'))
    .catch((error) => console.error('Error conectando a MongoDB', error));
} else {
  console.warn('DB_URL no definido; el módulo de usuarios funcionará en modo sin base de datos');
}

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/uploads', express.static('uploads'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api', userRoutes);
app.use('/api', projectRoutes);

app.use((err, req, res, next) => {
  console.error('Unexpected error', err);
  res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
});

app.listen(port, () => {
  console.log(`DSS server running on port ${port}`);
});
