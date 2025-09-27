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
  const [comparisonList, setComparisonList] = useState([]);

  const addToComparison = (product) => {
    if (
      comparisonList.length < 5 &&
      !comparisonList.find((p) => p.id === product.id)
    ) {
      setComparisonList([...comparisonList, product]);
    }
  };

  const removeFromComparison = (productId) => {
    setComparisonList(comparisonList.filter((p) => p.id !== productId));
  };

  const clearComparison = () => {
    setComparisonList([]);
  };

  const value = {
    comparisonList,
    addToComparison,
    removeFromComparison,
    clearComparison,
  };

  return (
    <ComparisonContext.Provider value={value}>
      {children}
    </ComparisonContext.Provider>
  );
};
