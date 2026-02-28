const request = require('supertest');
const app = require('../src/app');
const { calculateValue } = require('../src/logic');

describe('Suite de Pruebas de Calidad de Software', () => {

  // ===========================================
  // PRUEBAS UNITARIAS (Jest)
  // ===========================================
  describe('Pruebas Unitarias - Lógica de Inventario', () => {
    // Pruebas base
    test('Debe calcular correctamente el valor total (10 * 5 = 50)', () => {
      const result = calculateValue(10, 5);
      expect(result).toBe(50);
    });

    test('Debe retornar 0 si se ingresan valores negativos', () => {
      const result = calculateValue(-10, 5);
      expect(result).toBe(0);
    });

    // ✅ VALIDACIÓN ADICIONAL 1
    test('Debe calcular correctamente con valores decimales (15.5 * 3 = 46.5)', () => {
      const result = calculateValue(15.5, 3);
      expect(result).toBe(46.5);
    });

    // ✅ VALIDACIÓN ADICIONAL 2
    test('Debe retornar 0 si el stock es negativo aunque el precio sea positivo', () => {
      const result = calculateValue(10, -5);
      expect(result).toBe(0);
    });
  });

  // ===========================================
  // PRUEBAS DE INTEGRACIÓN (Supertest)
  // ===========================================
  describe('Pruebas de Integración - API Endpoints', () => {
    // Pruebas base
    test('GET /health - Debe responder con status 200 y JSON correcto', async () => {
      const response = await request(app).get('/health');
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('status', 'OK');
    });

    test('GET /items - Debe validar la estructura del inventario', async () => {
      const response = await request(app).get('/items');
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('stock');
    });

    // ✅ VALIDACIÓN ADICIONAL 3
    test('POST /calculate - Debe calcular correctamente con valores válidos', async () => {
      const response = await request(app)
        .post('/calculate')
        .send({ price: 25, stock: 4 });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('totalValue', 100);
    });

    // ✅ VALIDACIÓN ADICIONAL 4
    test('POST /calculate - Debe retornar error 400 con datos inválidos', async () => {
      const response = await request(app)
        .post('/calculate')
        .send({ price: 'veinticinco', stock: 4 });

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });
});
