import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AIChatContextType {
  isChatOpen: boolean;
  openChat: (initialMessage?: string) => void;
  closeChat: () => void;
  initialMessage: string | null;
}

const AIChatContext = createContext<AIChatContextType | undefined>(undefined);

export function AIChatProvider({ children }: { children: ReactNode }) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [initialMessage, setInitialMessage] = useState<string | null>(null);

  const openChat = (message?: string) => {
    setInitialMessage(message || null);
    setIsChatOpen(true);
  };

  const closeChat = () => {
    setIsChatOpen(false);
    setInitialMessage(null);
  };

  return (
    <AIChatContext.Provider value={{
      isChatOpen,
      openChat,
      closeChat,
      initialMessage
    }}>
      {children}
    </AIChatContext.Provider>
  );
}

export function useAIChat() {
  const context = useContext(AIChatContext);
  if (context === undefined) {
    throw new Error('useAIChat must be used within an AIChatProvider');
  }
  return context;
} 