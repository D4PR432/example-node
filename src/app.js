const express = require('express');
const app = express();

app.use(express.json());

// Endpoint para health check
app.get('/health', (req, res) => {
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

// Endpoint para calcular (usará tu lógica)
app.post('/calculate', (req, res) => {
  const { price, stock } = req.body;
  const { calculateValue } = require('./logic');
  
  if (typeof price !== 'number' || typeof stock !== 'number') {
    return res.status(400).json({ error: 'Price y stock deben ser números' });
  }
  
  const totalValue = calculateValue(price, stock);
  res.json({ price, stock, totalValue });
});

module.exports = app;