import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Wrench, Package, Shield, AlertTriangle } from 'lucide-react';
import { staticData } from '@/data/static';

export function AssetsAtWork() {
  const { hr, pos } = staticData;

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Assets at Work</h3>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Employee Overview */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Employee Overview</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hr.analytics.headcount}</div>
            <p className="text-xs text-muted-foreground">
              {hr.analytics.turnoverRate}% turnover rate
            </p>
          </CardContent>
        </Card>

        {/* Equipment Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Equipment Status</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pos.inventory.length}</div>
            <p className="text-xs text-muted-foreground">
              Active equipment
            </p>
          </CardContent>
        </Card>

        {/* Inventory Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Status</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${pos.inventory.reduce((sum, item) => sum + item.value, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Total inventory value
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Blockchain-Verified Assets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Blockchain-Verified Assets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Active Contracts */}
            <div>
              <h4 className="font-medium mb-2">Active Smart Contracts</h4>
              <div className="grid gap-4 md:grid-cols-2">
                {staticData.blockchain.contracts.map((contract) => (
                  <div key={contract.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{contract.name}</p>
                      <p className="text-sm text-muted-foreground">{contract.network}</p>
                    </div>
                    <div className="text-sm text-green-600">Active</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Maintenance Alerts */}
            <div>
              <h4 className="font-medium mb-2">Maintenance Alerts</h4>
              <div className="space-y-2">
                {pos.inventory
                  .filter(item => item.stockLevel <= item.reorderPoint)
                  .map((item) => (
                    <div key={item.id} className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <div>
                        <p className="text-sm font-medium">Low Stock Alert</p>
                        <p className="text-xs text-muted-foreground">
                          {item.productId} at {item.location}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 