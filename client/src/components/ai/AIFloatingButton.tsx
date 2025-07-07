import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, X, MessageCircle, Brain, Users, Building2, Calculator, Package, CreditCard } from 'lucide-react';
import { AIChatBox } from './AIChatBox';
import { useAuth } from '@/hooks/use-auth';

interface AIFloatingButtonProps {
  isEnabled?: boolean;
  userRole?: string;
  organizationId?: string;
}

export function AIFloatingButton({ isEnabled = true, userRole, organizationId }: AIFloatingButtonProps) {
  const { user } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [aiStatus, setAiStatus] = useState<boolean | null>(null);

  // Check AI status on mount
  useEffect(() => {
    const checkAIStatus = async () => {
      try {
        const response = await fetch('/api/ai/status', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setAiStatus(data.isEnabled);
        }
      } catch (error) {
        console.error('Error checking AI status:', error);
        setAiStatus(false);
      }
    };

    checkAIStatus();
  }, []);

  // Don't render if AI is disabled for the organization
  if (aiStatus === false || (aiStatus === null && !isEnabled)) {
    return null;
  }

  // Get appropriate icon and color based on user role and department
  const getIconAndColor = () => {
    const role = userRole || user?.role;
    const department = user?.department?.toLowerCase();

    if (role === 'owner') {
      return {
        icon: <Sparkles className="h-6 w-6" />,
        bgColor: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700',
        borderColor: 'border-purple-200'
      };
    }

    switch (department) {
      case 'hr':
        return {
          icon: <Users className="h-6 w-6" />,
          bgColor: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700',
          borderColor: 'border-blue-200'
        };
      case 'finance':
      case 'accounting':
        return {
          icon: <Calculator className="h-6 w-6" />,
          bgColor: 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700',
          borderColor: 'border-green-200'
        };
      case 'inventory':
      case 'warehouse':
        return {
          icon: <Package className="h-6 w-6" />,
          bgColor: 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700',
          borderColor: 'border-orange-200'
        };
      case 'sales':
      case 'crm':
        return {
          icon: <CreditCard className="h-6 w-6" />,
          bgColor: 'bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700',
          borderColor: 'border-teal-200'
        };
      default:
        return {
          icon: <Brain className="h-6 w-6" />,
          bgColor: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700',
          borderColor: 'border-indigo-200'
        };
    }
  };

  const { icon, bgColor, borderColor } = getIconAndColor();

  return (
    <>
      {/* Floating AI Button */}
      <div className="fixed bottom-6 right-6 z-[9999] pointer-events-auto">
        <Button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`h-14 w-14 rounded-full shadow-lg transition-all duration-300 border-2 ${borderColor} ${
            isChatOpen 
              ? 'bg-red-500 hover:bg-red-600 border-red-300' 
              : bgColor
          }`}
          size="lg"
        >
          {isChatOpen ? (
            <X className="h-6 w-6 text-white" />
          ) : (
            icon
          )}
        </Button>
      </div>

      {/* AI Chat Box */}
      {isChatOpen && (
        <AIChatBox
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          userRole={userRole}
          organizationId={organizationId}
        />
      )}
    </>
  );
} 