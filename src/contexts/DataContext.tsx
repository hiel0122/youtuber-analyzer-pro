import { createContext, useContext, useState, ReactNode } from 'react';

interface DataContextType {
  isLoaded: boolean;
  hasData: boolean;
  setIsLoaded: (loaded: boolean) => void;
  setHasData: (hasData: boolean) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasData, setHasData] = useState(false);

  return (
    <DataContext.Provider value={{ isLoaded, hasData, setIsLoaded, setHasData }}>
      {children}
    </DataContext.Provider>
  );
}

export function useDataContext() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useDataContext must be used within DataProvider');
  }
  return context;
}
