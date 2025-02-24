import { TransactionCard } from '@/components/pos/transaction-card';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useBusiness } from '@/hooks/use-business';

interface Transaction {
  _id: string;
  amount: number;
  description: string;
  status: string;
  createdAt: string;
}

export function POSDashboard() {
  const { businessId } = useBusiness();
  
  const { data: transactions } = useQuery<Transaction[]>({
    queryKey: ['pos-transactions', businessId],
    queryFn: () => api.get('/pos/transactions')
  });

  return (
    <div className="grid gap-4">
      {transactions?.map((transaction) => (
        <TransactionCard key={transaction._id} data={transaction} />
      ))}
    </div>
  );
} 