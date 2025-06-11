import { Networks, TransactionBuilder, Operation, Keypair, Asset } from 'stellar-sdk';
import { Horizon } from 'stellar-sdk';
import dotenv from 'dotenv';

dotenv.config();

const STELLAR_NETWORK =
  process.env.STELLAR_NETWORK === 'testnet'
    ? Networks.TESTNET
    : Networks.PUBLIC;

const server = new Horizon.Server(process.env.STELLAR_HORIZON_URL || 'https://horizon-testnet.stellar.org');

export class StellarService {
  async createAccount() {
    try {
      const pair = Keypair.random();
      const publicKey = pair.publicKey();
      const secretKey = pair.secret();

      // Fund the account with testnet XLM
      const response = await fetch(
        `https://friendbot.stellar.org?addr=${publicKey}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fund account');
      }

      return {
        publicKey,
        secretKey,
        createdAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error creating Stellar account:', error);
      throw error;
    }
  }

  async getAccountBalance(publicKey: string) {
    try {
      const account = await server.loadAccount(publicKey);
      return account.balances;
    } catch (error) {
      console.error('Error getting account balance:', error);
      throw error;
    }
  }

  async sendPayment(
    sourceSecretKey: string,
    destinationPublicKey: string,
    amount: string,
    assetCode: string = 'XLM',
    assetIssuer?: string
  ) {
    try {
      const sourceKeypair = Keypair.fromSecret(sourceSecretKey);
      const sourceAccount = await server.loadAccount(sourceKeypair.publicKey());

      let asset;
      if (assetCode === 'XLM') {
        asset = Asset.native();
      } else if (assetIssuer) {
        asset = new Asset(assetCode, assetIssuer);
      } else {
        throw new Error('Asset issuer required for non-native assets');
      }

      const transaction = new TransactionBuilder(sourceAccount, {
        fee: '100',
        networkPassphrase: Networks.TESTNET
      })
        .addOperation(
          Operation.payment({
            destination: destinationPublicKey,
            asset: asset,
            amount: amount
          })
        )
        .setTimeout(30)
        .build();

      transaction.sign(sourceKeypair);

      const result = await server.submitTransaction(transaction);
      return result;
    } catch (error) {
      console.error('Error sending payment:', error);
      throw error;
    }
  }

  async getTransactionHistory(publicKey: string) {
    try {
      const transactions = await server.transactions()
        .forAccount(publicKey)
        .order('desc')
        .limit(10)
        .call();

      return transactions.records;
    } catch (error) {
      console.error('Error getting transaction history:', error);
      throw error;
    }
  }
}