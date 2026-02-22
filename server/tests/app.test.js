import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../app.js';

describe('Health Check', () => {
  it('should return 200 and health status', async () => {
    const response = await request(app).get('/health');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('message', 'Server is running');
  });
});

describe('API Documentation', () => {
  it('should serve Swagger UI', async () => {
    const response = await request(app).get('/api-docs/');
    
    expect(response.status).toBe(200);
  });

  it('should serve Swagger JSON', async () => {
    const response = await request(app).get('/api-docs.json');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('openapi');
  });
});

describe('404 Handler', () => {
  it('should return 404 for unknown routes', async () => {
    const response = await request(app).get('/unknown-route');
    
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('error', 'Route not found');
  });
});
