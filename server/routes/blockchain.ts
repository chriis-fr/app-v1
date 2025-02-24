import { Router } from 'express';
import { hasModuleAccess, hasRole } from '../auth';
import { BlockchainTransaction } from '../mongodb/models';
import { ethers } from 'ethers';

const router = Router();

// Initialize Ethereum provider
const provider = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL);

// Get all blockchain transactions for an organization
router.get('/transactions',
  hasModuleAccess('blockchain'),
  hasRole(['admin', 'manager']),
  async (req, res) => {
    try {
      if (!req.user || !req.user.organizationId) {
        return res.status(401).json({ message: 'Unauthorized access' });
      }
      const transactions = await BlockchainTransaction.find({
        organizationId: req.user.organizationId
      }).sort({ createdAt: -1 });
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching blockchain transactions' });
    }
});

// Create new blockchain transaction
router.post('/transactions',
  hasModuleAccess('blockchain'),
  hasRole(['admin']),
  async (req, res) => {
    try {
      const { fromAddress, toAddress, amount, currency } = req.body;
      
      // Create wallet instance
      const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
      
      // Send transaction
      const tx = await wallet.sendTransaction({
        to: toAddress,
        value: ethers.parseEther(amount.toString())
      });

      // Save transaction to database
      const transaction = new BlockchainTransaction({
        txHash: tx.hash,
        fromAddress,
        toAddress,
        amount,
        currency,
        networkId: (await provider.getNetwork()).chainId,
        status: 'pending',
        organizationId: req.user?.organizationId
      });

      await transaction.save();
      res.status(201).json(transaction);
    } catch (error) {
      res.status(500).json({ message: 'Error creating blockchain transaction' });
    }
});

// Get transaction status
router.get('/transactions/:txHash',
  hasModuleAccess('blockchain'),
  hasRole(['admin', 'manager']),
  async (req, res) => {
    try {
      const organizationId = req.user?.organizationId;
      if (!organizationId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const transaction = await BlockchainTransaction.findOne({
        txHash: req.params.txHash,
        organizationId
      });

      if (!transaction) {
        return res.status(404).json({ message: 'Transaction not found' });
      }

      // Get on-chain status
      const receipt = await provider.getTransactionReceipt(req.params.txHash);
      
      if (receipt && receipt.status === 1) {
        transaction.status = 'confirmed';
        transaction.confirmedAt = new Date();
        await transaction.save();
      }

      res.json(transaction);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching transaction status' });
    }
});

export default router; 