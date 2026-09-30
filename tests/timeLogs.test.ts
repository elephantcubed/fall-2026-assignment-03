import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/index.js';

describe('Part 2: Time Logs Tests', () => {
  it('should pass placeholder test', () => {
    // TODO: Student implementation - Part 2: Time Logging Tests
    // Log hours for a ticket (POST /tickets/:id/time)

    // Fetch total hours for a ticket (GET /tickets/:id/time)

    // Verify aggregation math
    expect(totalResponse.body).toEqual({
      ticket_id: ticketId,
      total_hours: 5,
    });
  });
});
