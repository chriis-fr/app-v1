import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { StellarService } from '../services/stellar';

const prisma = new PrismaClient();
const stellarService = new StellarService();

interface WalletData {
  secretKey: string;
  publicKey: string;
  createdAt: string;
}

interface OrganizationSettings {
  wallet?: WalletData;
  [key: string]: any;
}

type OrganizationWithSettings = {
  id: string;
  name: string;
  settings: Prisma.JsonValue;
};

export const createWallet = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.body;

    if (!organizationId) {
      return res.status(400).json({ error: 'Organization ID is required' });
    }

    // Check if organization exists
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        id: true,
        name: true,
        settings: true
      }
    }) as OrganizationWithSettings | null;

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    // Check if organization already has a wallet
    const settings = organization.settings as OrganizationSettings;
    if (settings?.wallet) {
      return res.status(400).json({ error: 'Organization already has a wallet' });
    }

    // Create Stellar account
    const walletData = await stellarService.createAccount();

    // Update organization with wallet data
    const updatedOrganization = await prisma.organization.update({
      where: { id: organizationId },
      data: {
        settings: {
          ...settings,
          wallet: walletData
        } as Prisma.JsonValue
      },
      select: {
        id: true,
        name: true,
        settings: true
      }
    }) as OrganizationWithSettings;

    res.json({
      message: 'Wallet created successfully',
      organization: {
        id: updatedOrganization.id,
        name: updatedOrganization.name,
        wallet: (updatedOrganization.settings as OrganizationSettings)?.wallet
      }
    });
  } catch (error) {
    console.error('Error creating wallet:', error);
    res.status(500).json({ error: 'Failed to create wallet' });
  }
};

export const getBalance = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.params;

    if (!organizationId) {
      return res.status(400).json({ error: 'Organization ID is required' });
    }

    // Get organization with wallet data
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        id: true,
        name: true,
        settings: true
      }
    }) as OrganizationWithSettings | null;

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    const settings = organization.settings as OrganizationSettings;
    const walletData = settings?.wallet;
    if (!walletData) {
      return res.status(404).json({ error: 'No wallet found for this organization' });
    }

    // Get account balance from Stellar
    const balances = await stellarService.getAccountBalance(walletData.publicKey);

    res.json({
      organization: {
        id: organization.id,
        name: organization.name
      },
      balances
    });
  } catch (error) {
    console.error('Error getting balance:', error);
    res.status(500).json({ error: 'Failed to get balance' });
  }
};

export const sendPayment = async (req: Request, res: Response) => {
  try {
    const { organizationId, destinationPublicKey, amount, assetCode, assetIssuer } = req.body;

    if (!organizationId || !destinationPublicKey || !amount) {
      return res.status(400).json({ 
        error: 'Organization ID, destination public key, and amount are required' 
      });
    }

    // Get organization with wallet data
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        id: true,
        name: true,
        settings: true
      }
    }) as OrganizationWithSettings | null;

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    const settings = organization.settings as OrganizationSettings;
    const walletData = settings?.wallet;
    if (!walletData) {
      return res.status(404).json({ error: 'No wallet found for this organization' });
    }

    // Send payment through Stellar
    const result = await stellarService.sendPayment(
      walletData.secretKey,
      destinationPublicKey,
      amount,
      assetCode,
      assetIssuer
    );

    res.json({
      message: 'Payment sent successfully',
      transaction: result
    });
  } catch (error) {
    console.error('Error sending payment:', error);
    res.status(500).json({ error: 'Failed to send payment' });
  }
};