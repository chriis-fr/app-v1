import { MoreHorizontal, MessageCircle, AlertTriangle, FileText } from 'lucide-react';

export default function ActionCenter() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">Action Center</h3>
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <MoreHorizontal className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
            <div className="bg-purple-100 p-2 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="font-medium">Low Stock Items</div>
              <div className="text-sm text-gray-500">
                10 items are below minimum stock level.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
            <div className="bg-blue-100 p-2 rounded-lg">
              <MessageCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="font-medium">Support Messages</div>
              <div className="text-sm text-gray-500">
                12 new customer support inquiries.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
            <div className="bg-green-100 p-2 rounded-lg">
              <FileText className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="font-medium">Pending Invoices</div>
              <div className="text-sm text-gray-500">
                8 invoices need approval.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">Module Performance</h3>
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <MoreHorizontal className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        <div className="text-sm text-gray-500 mb-6">
          Module usage over the last 30 days.
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">Point of Sale</span>
              <span className="text-gray-500">65%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full">
              <div className="h-2 bg-orange-500 rounded-full w-[65%]"></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">Blockchain</span>
              <span className="text-gray-500">45%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full">
              <div className="h-2 bg-purple-500 rounded-full w-[45%]"></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">Accounting</span>
              <span className="text-gray-500">30%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full">
              <div className="h-2 bg-green-500 rounded-full w-[30%]"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 