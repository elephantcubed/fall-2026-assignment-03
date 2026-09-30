import { Request, Response, NextFunction } from 'express';

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {

  const header = req.header('X-user-id');

  if (!header) {
    res.status(401).json({error: 'ERROR: Invalid Header'});
  }

  const userID = Number(header);

  if (userID <= 0 || !Number.isInteger(userID)) {
    res.status(401).json({error: 'ERROR: Invalid User ID'});
  }

  res.locals.userID = userID;
  next();
}

export default authMiddleware;