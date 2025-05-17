// This file is intentionally empty as we're using Express.User type
// and extending Express.Request directly in express.d.ts 

import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: Express.User;
} 