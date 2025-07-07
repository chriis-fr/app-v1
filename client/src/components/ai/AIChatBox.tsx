import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, Send, User, Loader2, Brain, Users, Calculator, Package, CreditCard, X } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isLoading?: boolean;
}

interface AIChatBoxProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: string;
  organizationId?: string;
}

export function AIChatBox({ isOpen, onClose, userRole, organizationId }: AIChatBoxProps) {
  const { user } = useAuth();
  
  // Get context-aware welcome message
  const getWelcomeMessage = () => {
    const role = userRole || user?.role;
    const department = user?.department?.toLowerCase();
    const orgName = user?.organization?.name || 'your organization';
    const userName = user?.firstName ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ''}` : 'there';

    if (role === 'owner') {
      return `Hello ${userName}! I'm your AI assistant for ${orgName}. I can help you with managing your organization, analyzing data, and making business decisions. How can I assist you today?`;
    }

    switch (department) {
      case 'hr':
        return `Hello ${userName}! I'm your HR AI assistant for ${orgName}. I can help you with employee management, payroll, hiring, performance reviews, and HR policies. What would you like to know?`;
      case 'finance':
      case 'accounting':
        return `Hello ${userName}! I'm your Finance AI assistant for ${orgName}. I can help you with accounting, financial reporting, budgeting, and financial analysis. How can I assist you?`;
      case 'inventory':
      case 'warehouse':
        return `Hello ${userName}! I'm your Inventory AI assistant for ${orgName}. I can help you with stock management, warehouse operations, supply chain, and inventory optimization. What do you need?`;
      case 'sales':
      case 'crm':
        return `Hello ${userName}! I'm your Sales AI assistant for ${orgName}. I can help you with customer management, sales strategies, lead generation, and sales analytics. How can I help?`;
      default:
        return `Hello ${userName}! I'm your AI assistant for ${orgName}. I can help you with your daily tasks and questions. How can I assist you today?`;
    }
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: getWelcomeMessage(),
      sender: 'ai',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: '',
      sender: 'ai',
      timestamp: new Date(),
      isLoading: true,
    };

    setMessages(prev => [...prev, userMessage, aiMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Call the AI API
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          message: inputValue,
          context: {
            userRole,
            organizationId,
            department: user?.department,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const aiResponse = await response.json();

      setMessages(prev => 
        prev.map(msg => 
          msg.id === aiMessage.id 
            ? { ...msg, text: aiResponse.text, isLoading: false }
            : msg
        )
      );
    } catch (error) {
      console.error('Error getting AI response:', error);
      setMessages(prev => 
        prev.map(msg => 
          msg.id === aiMessage.id 
            ? { ...msg, text: 'Sorry, I encountered an error. Please try again.', isLoading: false }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Get appropriate icon and color based on user role and department
  const getIconAndColor = () => {
    const role = userRole || user?.role;
    const department = user?.department?.toLowerCase();

    if (role === 'owner') {
      return {
        icon: <Sparkles className="h-5 w-5" />,
        bgColor: 'bg-gradient-to-r from-purple-600 to-pink-600',
        borderColor: 'border-purple-200'
      };
    }

    switch (department) {
      case 'hr':
        return {
          icon: <Users className="h-5 w-5" />,
          bgColor: 'bg-gradient-to-r from-blue-600 to-indigo-600',
          borderColor: 'border-blue-200'
        };
      case 'finance':
      case 'accounting':
        return {
          icon: <Calculator className="h-5 w-5" />,
          bgColor: 'bg-gradient-to-r from-green-600 to-emerald-600',
          borderColor: 'border-green-200'
        };
      case 'inventory':
      case 'warehouse':
        return {
          icon: <Package className="h-5 w-5" />,
          bgColor: 'bg-gradient-to-r from-orange-600 to-red-600',
          borderColor: 'border-orange-200'
        };
      case 'sales':
      case 'crm':
        return {
          icon: <CreditCard className="h-5 w-5" />,
          bgColor: 'bg-gradient-to-r from-teal-600 to-cyan-600',
          borderColor: 'border-teal-200'
        };
      default:
        return {
          icon: <Brain className="h-5 w-5" />,
          bgColor: 'bg-gradient-to-r from-indigo-600 to-purple-600',
          borderColor: 'border-indigo-200'
        };
    }
  };

  const { icon, bgColor, borderColor } = getIconAndColor();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />
      
      {/* Chat Box */}
      <div className="fixed bottom-6 right-6 w-96 h-[500px] z-[9999] max-h-[calc(100vh-3rem)]">
        <Card className={`h-full shadow-2xl border-2 ${borderColor} flex flex-col overflow-hidden`}>
          <CardHeader className={`${bgColor} text-white pb-3 flex-shrink-0`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {icon}
                <CardTitle className="text-lg font-semibold">
                  {userRole === 'owner' ? 'Organization AI' : `${user?.department || 'Business'} AI`}
                </CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-xs opacity-90">
              {user?.organization?.name || 'Your Organization'}
            </div>
          </CardHeader>
          
          <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
            {/* Messages Area */}
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-3 py-2 ${
                          message.sender === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {message.sender === 'ai' && (
                            <div className="mt-0.5">
                              {icon}
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="text-sm break-words">{message.text}</p>
                            {message.isLoading && (
                              <div className="flex items-center gap-1 mt-2">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                <span className="text-xs">AI is thinking...</span>
                              </div>
                            )}
                          </div>
                          {message.sender === 'user' && (
                            <User className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </div>

            {/* Input Area */}
            <div className="p-4 border-t bg-gray-50 flex-shrink-0">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything..."
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="text-xs text-gray-500 mt-2 text-center">
                Press Enter to send • Shift+Enter for new line
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
} 