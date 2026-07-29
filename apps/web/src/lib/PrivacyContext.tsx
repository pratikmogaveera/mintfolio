'use client';
import { createContext, useContext, useEffect, useState } from 'react';

interface PrivacyContextType {
  isPrivate: boolean;
  togglePrivacy: () => void;
}

const PrivacyContext = createContext<PrivacyContextType | undefined>(undefined);

export const usePrivacy = () => {
  const context = useContext(PrivacyContext);

  // Guarantees the component is wrapped in the Provider, eliminates 'undefined' checks later
  if (context === undefined) {
    throw new Error('usePrivacy must be used within a PrivacyProvider.');
  }

  return context;
};

export default function PrivacyProvider({ children }: { children: React.ReactNode }) {
  const [isPrivate, setIsPrivate] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsPrivate(localStorage.getItem('mintfolio-privacy') === 'true');
  }, []);
  const togglePrivacy = () => {
    setIsPrivate((prev) => {
      localStorage.setItem('mintfolio-privacy', prev ? 'false' : 'true');
      return !prev;
    });
  };

  return <PrivacyContext.Provider value={{ isPrivate: isPrivate, togglePrivacy }}>{children}</PrivacyContext.Provider>;
}
