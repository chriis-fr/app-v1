import { useBusiness } from '@/hooks/use-business';

export const api = {
  async get(endpoint: string) {
    const { businessId } = useBusiness.getState();
    const response = await fetch(`/api${endpoint}`, {
      headers: {
        'X-Business-ID': businessId || '',
      }
    });
    return response.json();
  },

  async post(endpoint: string, data: any) {
    const { businessId } = useBusiness.getState();
    const response = await fetch(`/api${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Business-ID': businessId || '',
      },
      body: JSON.stringify(data)
    });
    return response.json();
  }
}; 