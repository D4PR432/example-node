import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Métrica personalizada para errores
const errorRate = new Rate('errors');

// Configuración de la prueba
export const options = {
  stages: [
    { duration: '30s', target: 5 },   // Subir a 5 usuarios
    { duration: '1m', target: 5 },    // Mantener 5 usuarios
    { duration: '30s', target: 10 },  // Subir a 10 usuarios
    { duration: '1m', target: 10 },   // Mantener 10 usuarios
    { duration: '30s', target: 0 },   // Bajar a 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% de requests < 500ms
    errors: ['rate<0.1'],              // Menos del 10% de errores
  },
};

// ENDPOINT 1: Health Check
export function testHealth() {
  const response = http.get('http://localhost:3000/health');
  
  check(response, {
    'health status is 200': (r) => r.status === 200,
    'health response has OK': (r) => r.json('status') === 'OK',
  });

  errorRate.add(response.status !== 200);
  sleep(1);
}

// ENDPOINT 2: Get Items
export function testGetItems() {
  const response = http.get('http://localhost:3000/items');
  
  check(response, {
    'items status is 200': (r) => r.status === 200,
    'items is array': (r) => Array.isArray(r.json()),
  });

  errorRate.add(response.status !== 200);
  sleep(1);
}

// Prueba principal - combina los endpoints
export default function () {
  // 50% health, 50% items
  const rand = Math.random();
  
  if (rand < 0.5) {
    testHealth();
  } else {
    testGetItems();
  }
}