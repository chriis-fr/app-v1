import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);


  // Module access check endpoint
  app.get('/api/modules/access', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const org = await storage.getOrganization(req.user.organizationId);
    res.json({
      modules: org.activeModules,
      role: req.user.role,
      maxModules: org.maxModules
    });
  });


  // Dormant API endpoints for future implementation
  const httpServer = createServer(app);

  // POS endpoints
  app.get('/api/pos/orders', hasModuleAccess('order_management'), hasRole(['admin', 'manager']), (_req, res) => res.sendStatus(501));
  app.post('/api/pos/orders', hasModuleAccess('order_management'), hasRole(['admin', 'manager']), (_req, res) => res.sendStatus(501));
  app.get('/api/pos/inventory', hasModuleAccess('inventory'), hasRole(['admin', 'manager', 'employee']), (_req, res) => res.sendStatus(501));
  app.post('/api/pos/inventory', hasModuleAccess('inventory'), hasRole(['admin', 'manager']), (_req, res) => res.sendStatus(501));

  // HR endpoints
  app.get('/api/hr/employees', hasModuleAccess('hr'), hasRole(['admin', 'manager']), (_req, res) => res.sendStatus(501));
  app.post('/api/hr/employees', hasModuleAccess('hr'), hasRole(['admin']), (_req, res) => res.sendStatus(501));
  app.get('/api/hr/payroll', hasModuleAccess('hr'), hasRole(['admin']), (_req, res) => res.sendStatus(501));
  app.post('/api/hr/payroll', hasModuleAccess('hr'), hasRole(['admin']), (_req, res) => res.sendStatus(501));

  // Accounting endpoints
  app.get('/api/accounting/invoices', (_req, res) => res.sendStatus(501));
  app.post('/api/accounting/invoices', (_req, res) => res.sendStatus(501));
  app.get('/api/accounting/ledger', (_req, res) => res.sendStatus(501));
  app.post('/api/accounting/ledger', (_req, res) => res.sendStatus(501));

  // Blockchain endpoints
  app.get('/api/blockchain/transactions', (_req, res) => res.sendStatus(501));
  app.post('/api/blockchain/transactions', (_req, res) => res.sendStatus(501));

  return httpServer;
}
