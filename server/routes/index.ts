import { Express } from 'express';
import vendorRouter from './vendor';
import hiringRouter from './hiring';
import procurementRouter from './procurement';

export default function registerRoutes(app: Express) {
  console.log('🚀 Registering routes...');
  
  app.use('/api/vendors', vendorRouter);
  console.log('✅ Vendor routes registered at /api/vendors');
  
  app.use('/api/hiring', hiringRouter);
  console.log('✅ Hiring routes registered at /api/hiring');
  
  app.use('/api/procurement', procurementRouter);
  console.log('✅ Procurement routes registered at /api/procurement');
  
  // Add a test route to verify the server is working
  app.get('/api/test', (req, res) => {
    console.log('🧪 Test endpoint called');
    res.json({ 
      message: 'Server is working!',
      timestamp: new Date().toISOString(),
      routes: ['/api/vendors', '/api/hiring', '/api/procurement', '/api/test']
    });
  });
  
  console.log('✅ All routes loaded successfully');
}
 