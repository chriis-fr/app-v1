import { Express } from 'express';
import vendorRouter from './vendor';

export default function registerRoutes(app: Express) {
  app.use('/api/vendors', vendorRouter);
}
 