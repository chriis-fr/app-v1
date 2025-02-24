interface Transaction {
  _id: string;
  amount: number;
  description: string;
  status: string;
  createdAt: string;
}

export function TransactionCard({ data }: { data: Transaction }) {
  return (
    <div className="p-4 border rounded-lg">
      <h3 className="font-medium">{data.description}</h3>
      <p className="text-gray-600">${data.amount}</p>
      <span className="text-sm text-gray-500">{data.status}</span>
    </div>
  );
} 