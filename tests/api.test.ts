import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/index.js';

const NON_EXISTENT_ID = 999999999;

describe('Part 1: API Integration Tests', () => {
  // TODO: Student implementation - Part 1: Integration Testing
  // Test user creation (POST /users)
    it('creates a user and a ticket', async () => {
    const userResponse = await request(app)
      .post('/users')
      .set('X-User-Id', '1')
      .send({
        name: 'Test User',
        email: `test-${Date.now()}@example.com`,
      });

  // Test ticket creation (POST /tickets)
    const ticketResponse = await request(app)
      .post('/tickets')
      .set('X-User-Id', String(userResponse.body.id))
      .send({
        title: 'Test ticket',
        description: 'Created by an integration test',
      });

    expect(ticketResponse.status).toBe(201);
    expect(ticketResponse.body.title).toBe('Test ticket');
    expect(ticketResponse.body.creator_id).toBe(userResponse.body.id);
  });

  // Test auth middleware rejection (401 when X-User-Id is missing or invali)
    it('rejects a POST request without the user header', async () => {
    const response = await request(app)
      .post('/tickets')
      .send({
        title: 'Unauthorized ticket',
        description: 'Should be rejected',
      });
 
    expect(response.status).toBe(401);
  });
  
  it('rejects a POST request with an invalid user header', async () => {
    const response = await request(app)
      .post('/tickets')
      .set('X-User-Id', 'not-a-number')
      .send({
        title: 'Unauthorized ticket',
        description: 'Should be rejected',
      });
 
    expect(response.status).toBe(401);
  });



    // Test 404 responses for non-existent users and tickets
    it('returns 404 for missing users and tickets', async () => {
    const userResponse = await request(app).get(`/users/${NON_EXISTENT_ID}`);
    const ticketResponse = await request(app).get(`/tickets/${NON_EXISTENT_ID}`);
 
    expect(userResponse.status).toBe(404);
    expect(ticketResponse.status).toBe(404);
  });


    // Test pagination and filtering on GET /tickets
  it('tests for invalid pagination/status values', async () => {
    const negativeLimitResponse = await request(app).get('/tickets?limit=-1');
    const invalidOffsetResponse = await request(app).get('/tickets?offset=abc');
    const invalidStatusResponse = await request(app).get('/tickets?status=NOT_A_STATUS');
 
    expect(negativeLimitResponse.status).toBe(400);
    expect(invalidOffsetResponse.status).toBe(400);
    expect(invalidStatusResponse.status).toBe(400);
  });
});
