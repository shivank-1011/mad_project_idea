import React, { createContext, useState, useContext } from "react";

const ComparisonContext = createContext();

export const useComparison = () => {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error("useComparison must be used within a ComparisonProvider");
  }
  return context;
};

export const ComparisonProvider = ({ children }) => {
  const [list, setList] = useState([]);

  const addItem = (item) => {
    if (list.length < 5 && !list.find((p) => p.id === item.id)) {
      setList([...list, item]);
    }
  };

  const removeItem = (id) => {
    setList(list.filter((p) => p.id !== id));
  };

  const clear = () => {
    setList([]);
  };

  const value = {
    comparisonList: list,
    addToComparison: addItem,
    removeFromComparison: removeItem,
    clearComparison: clear,
  };

  return (
    <ComparisonContext.Provider value={value}>
      {children}
    </ComparisonContext.Provider>
  );
};
