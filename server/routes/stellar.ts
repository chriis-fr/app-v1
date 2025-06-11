import { Router } from 'express';
import { createWallet, getBalance, sendPayment } from '../controllers/stellar';

const router = Router();

// Create a new Stellar wallet
router.post('/wallet', createWallet);

// Get wallet balance
router.get('/balance/:organizationId', getBalance);

// Send payment
router.post('/payment', sendPayment);

export default router;