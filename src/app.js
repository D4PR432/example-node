const express = require('express');
const client = require('prom-client');
const app = express();

app.use(express.json());

// 1. Habilitar métricas por defecto de Node.js
client.collectDefaultMetrics();

// 2. Crear métricas personalizadas
const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total de peticiones HTTP procesadas',
  labelNames: ['metodo', 'ruta', 'estado_http'],
});

const activeUsersGauge = new client.Gauge({
  name: 'active_users_current',
  help: 'Número actual de usuarios activos simulados'
});

// Middleware para contar peticiones
app.use((req, res, next) => {
  res.on('finish', () => {
    httpRequestCounter.inc({
      metodo: req.method,
      ruta: req.path,
      estado_http: res.statusCode.toString(),
    });
  });
  next();
});

// Endpoint para health check
app.get('/health', (req, res) => {
  activeUsersGauge.set(Math.floor(Math.random() * 100));
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Endpoint para obtener items
app.get('/items', (req, res) => {
  const items = [
    { id: 1, name: 'Producto A', price: 10, stock: 5 },
    { id: 2, name: 'Producto B', price: 20, stock: 3 },
    { id: 3, name: 'Producto C', price: 15, stock: 8 }
  ];
  res.json(items);
});

// Endpoint para calcular
app.post('/calculate', (req, res) => {
  const { price, stock } = req.body;
  const { calculateValue } = require('./logic');
  
  if (typeof price !== 'number' || typeof stock !== 'number') {
    return res.status(400).json({ error: 'Price y stock deben ser números' });
  }
  
  const totalValue = calculateValue(price, stock);
  res.json({ price, stock, totalValue });
});

// 3. Endpoint /metrics para Prometheus
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.send(await client.register.metrics());
});

module.exports = app;