import { useState, useEffect } from 'react';
import { useAuth } from './use-auth';
import { useModuleAccess } from './use-module-access';

interface AIFeature {
  id: string;
  name: string;
  description: string;
  accuracy: number;
  status: 'active' | 'training';
}

interface BlockchainChain {
  id: string;
  name: string;
  status: string;
  lastSync: string;
}

interface DataSource {
  id: string;
  name: string;
  status: string;
  lastSync: string;
  size: string;
}

interface ReportingStandard {
  id: string;
  name: string;
  description: string;
  templates: string[];
}

interface Analytics {
  dataProcessing: number;
  reportGeneration: number;
  dataQuality: number;
}

export function useModules() {
  const { user } = useAuth();
  const { checkModuleAccess } = useModuleAccess();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAIFeatures = async (): Promise<AIFeature[]> => {
    if (!checkModuleAccess('accounting')) {
      throw new Error('No access to accounting module');
    }

    setLoading(true);
    try {
      const response = await fetch('/api/modules/ai/features');
      if (!response.ok) throw new Error('Failed to fetch AI features');
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch AI features');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchBlockchainChains = async (): Promise<BlockchainChain[]> => {
    if (!checkModuleAccess('finance')) {
      throw new Error('No access to finance module');
    }

    setLoading(true);
    try {
      const response = await fetch('/api/modules/blockchain/chains');
      if (!response.ok) throw new Error('Failed to fetch blockchain chains');
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch blockchain chains');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchDataSources = async (): Promise<DataSource[]> => {
    if (!checkModuleAccess('accounting')) {
      throw new Error('No access to accounting module');
    }

    setLoading(true);
    try {
      const response = await fetch('/api/modules/bi/sources');
      if (!response.ok) throw new Error('Failed to fetch data sources');
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data sources');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchReportingStandards = async (): Promise<ReportingStandard[]> => {
    if (!checkModuleAccess('accounting')) {
      throw new Error('No access to accounting module');
    }

    setLoading(true);
    try {
      const response = await fetch('/api/modules/reporting/standards');
      if (!response.ok) throw new Error('Failed to fetch reporting standards');
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reporting standards');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const syncModule = async (module: string): Promise<{ message: string; timestamp: string }> => {
    if (!checkModuleAccess('accounting')) {
      throw new Error('No access to accounting module');
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/modules/sync/${module}`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to sync module');
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sync module');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async (): Promise<Analytics> => {
    if (!checkModuleAccess('accounting')) {
      throw new Error('No access to accounting module');
    }

    setLoading(true);
    try {
      const response = await fetch('/api/modules/analytics/dashboard');
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    fetchAIFeatures,
    fetchBlockchainChains,
    fetchDataSources,
    fetchReportingStandards,
    syncModule,
    fetchAnalytics
  };
} 