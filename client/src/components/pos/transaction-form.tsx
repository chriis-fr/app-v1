import { usePermissions } from '@/hooks/use-permissions';
import { api } from '@/lib/api';
import { useToast } from '../ui/use-toast';

export function TransactionForm() {
  const { can } = usePermissions();
  const { toast } = useToast();

  const handleSubmit = async (data: any) => {
    if (!can('pos', 'create')) {
      toast({
        variant: "destructive",
        title: "Permission denied",
        description: "You do not have permission to create transactions"
      });
      return;
    }

    await api.post('/pos/transaction', data);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
} 