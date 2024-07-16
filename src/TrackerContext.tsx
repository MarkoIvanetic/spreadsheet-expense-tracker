import React, { createContext, useState, useContext, ReactNode } from 'react';

interface Category {
  id: string;
  name: string;
  color: string;
}

interface TrackerContextProps {
  selectedCategory: Category | null;
  setSelectedCategory: (category: Category | null) => void;
  inputValue: number;
  setInputValue: (value: number) => void;
  description: string;
  setDescription: (desc: string) => void;
  selectedUnverifiedId: number | undefined;
  setSelectedUnverifiedExpenseId: (id: number | undefined) => void;
  removeUnverifiedExpense: (id: number) => void;
  resetInputs: () => void;
}

const TrackerContext = createContext<TrackerContextProps | undefined>(undefined);

export const TrackerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedUnverifiedId, setSelectedUnverifiedExpenseId] = useState<number | undefined>();
  const [inputValue, setInputValue] = useState<number>(0);
  const [description, setDescription] = useState<string>('');

  const removeUnverifiedExpense = (id: number) => {
    fetch('api/unverified', {
      method: 'DELETE',
      body: JSON.stringify({ rowIndex: id }),
    });
  }

  const resetInputs = () => {
    setInputValue(0)
    setDescription('')
    setSelectedUnverifiedExpenseId(undefined)
  }

  return (
    <TrackerContext.Provider value={{ selectedCategory, setSelectedCategory, selectedUnverifiedId, setSelectedUnverifiedExpenseId, removeUnverifiedExpense, inputValue, setInputValue, resetInputs, description, setDescription }}>
      {children}
    </TrackerContext.Provider>
  );
};

export const useTrackerContext = (): TrackerContextProps => {
  const context = useContext(TrackerContext);
  if (context === undefined) {
    throw new Error('useTrackerContext must be used within a TrackerProvider');
  }
  return context;
};
