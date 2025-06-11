export const blockchainData = {
  stellar: {
    balances: [
      { asset_type: 'native', balance: '1000.0000000' },
      { asset_type: 'credit_alphanum4', asset_code: 'USDC', balance: '5000.0000000' },
      { asset_type: 'credit_alphanum4', asset_code: 'EURT', balance: '3000.0000000' }
    ],
    recentTransactions: [
      {
        id: 'tx1',
        type: 'payment',
        amount: '100.0000000',
        asset: 'XLM',
        from: 'GABC...XYZ',
        to: 'GDEF...UVW',
        timestamp: '2024-03-15T10:30:00Z',
        status: 'success'
      },
      {
        id: 'tx2',
        type: 'payment',
        amount: '500.0000000',
        asset: 'USDC',
        from: 'GDEF...UVW',
        to: 'GABC...XYZ',
        timestamp: '2024-03-15T09:15:00Z',
        status: 'success'
      }
    ],
    walletInfo: {
      publicKey: 'GABC...XYZ',
      createdAt: '2024-01-01T00:00:00Z',
      lastActivity: '2024-03-15T10:30:00Z'
    }
  },
  ethereum: {
    balances: [
      { symbol: 'ETH', balance: '5.23456789' },
      { symbol: 'USDT', balance: '10000.00000000' },
      { symbol: 'DAI', balance: '5000.00000000' }
    ],
    recentTransactions: [
      {
        hash: '0x123...abc',
        type: 'transfer',
        amount: '1.5',
        token: 'ETH',
        from: '0xABC...DEF',
        to: '0xDEF...GHI',
        timestamp: '2024-03-15T11:20:00Z',
        status: 'confirmed'
      }
    ]
  }
};

export const financialMetrics = {
  totalAssets: {
    fiat: 150000.00,
    crypto: 25000.00,
    total: 175000.00
  },
  monthlyTransactions: {
    count: 45,
    volume: 75000.00
  },
  assetAllocation: {
    cash: 40,
    crypto: 25,
    investments: 35
  }
}; 