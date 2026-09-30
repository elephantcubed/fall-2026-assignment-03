import { Router } from 'express';
import { createTicket, getAllTickets, getTicketById, updateTicketStatus } from '../dal/tickets.js';
import { authMiddleware } from '../middleware/auth.js';
import { insertTimeLog , getTotalHoursForTicket } from '../dal/timeLogs.js';

const router = Router();

// GET /tickets
router.get('/', async (req, res, next) => {

    const limit = typeof req.query.limit === 'string'
    ? Number(req.query.limit)
    : undefined;

    const offset = typeof req.query.offset === 'string'
    ? Number(req.query.offset)
    : undefined;

    const status = typeof req.query.status === 'string'
    ? req.query.status
    : undefined;

     if (
        (limit !== undefined && (!Number.isSafeInteger(limit) || limit < 0))
        || (offset !== undefined && (!Number.isSafeInteger(offset) || offset < 0))
        ) {
            return res.status(400).json({
                error: 'ERROR: Limit and offset can not be negative',
        });
    }

    const tickets = await getAllTickets({limit, offset, status});
    return res.json(tickets);
});

// GET /tickets/:id
router.get('/:id', async (req, res, next) => {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    res.status(400).json({ error: 'ERROR: Invalid ticket ID' });
    return;
  }

  try {
    const ticket = await getTicketById(id);

    if (!ticket) {
      res.status(404).json({ error: 'ERROR: Ticket not found' });
      return;
    }

    res.status(200).json(ticket);
  } catch (error) {
    next(error);
  }
});

// POST /tickets
router.post('/', authMiddleware, async (req, res, next) => {
    const {title, description} = req.body;
    if (!description || !title) {
        return res.status(400).json({error: 'ERROR: Null title and/or description'});
    }
    const newTicket = await createTicket({
        title, description, creator_id: res.locals.userId,    
    });
    
    return res.status(201).json(newTicket);
})


// PATCH /tickets/:id/status
router.patch('/:id/status', authMiddleware, async (req, res, next) => {
  const id = Number(req.params.id);
  const { status } = req.body ?? {};

  if (!Number.isSafeInteger(id) || id <= 0) {
    res.status(400).json({ error: 'ERROR: Invalid ticket ID' });
    return;
  }

  const validStatuses = ['TODO', 'IN_PROGRESS', 'DONE'];

  if (!validStatuses.includes(status)) {
    res.status(400).json({ error: 'ERROR: Invalid status' });
    return;
  }

  try {
    const ticket = await updateTicketStatus(id, status);

    if (!ticket) {
      res.status(404).json({ error: 'Ticket not found' });
      return;
    }

    res.status(200).json(ticket);
  } catch (error) {
    next(error);
  }
});

// TODO: Student implementation - Part 2: Time Log Routes
// POST /tickets/:id/time
router.post('/:id/time', authMiddleware, async (req, res, next) => {
  const id = Number(req.params.id);
  const { hours } = req.body ?? {};
 
  if (!Number.isSafeInteger(id) || id <= 0) {
    res.status(400).json({ error: 'ERROR: Invalid ticket ID' });
    return;
  }
 
  if (typeof hours !== 'number' || !Number.isFinite(hours) || hours <= 0) {
    res.status(400).json({ error: 'ERROR: Hours must be a positive number' });
    return;
  }
 
  try {
    const ticket = await getTicketById(id);
 
    if (!ticket) {
      res.status(404).json({ error: 'ERROR: Ticket not found' });
      return;
    }
 
    const log = await insertTimeLog(id, res.locals.userId, hours);
 
    res.status(201).json(log);
  } catch (error) {
    next(error);
  }
});
 
// GET /tickets/:id/time
router.get('/:id/time', async (req, res, next) => {
  const id = Number(req.params.id);
 
  if (!Number.isSafeInteger(id) || id <= 0) {
    res.status(400).json({ error: 'ERROR: Invalid ticket ID' });
    return;
  }
 
  try {
    const ticket = await getTicketById(id);
 
    if (!ticket) {
      res.status(404).json({ error: 'ERROR: Ticket not found' });
      return;
    }
 
    const totalHours = await getTotalHoursForTicket(id);
 
    res.status(200).json({
      ticket_id: id,
      total_hours: Number(totalHours ?? 0),
    });
  } catch (error) {
    next(error);
  }
});


export default router;