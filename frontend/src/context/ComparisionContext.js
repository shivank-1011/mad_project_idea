import React, { createContext, useState } from 'react';

export const ComparisonContext = createContext();

export const ComparisonProvider = ({ children }) => {
    const [comparisonList, setComparisonList] = useState([]);

    const addToComparison = (product) => {
        if (!comparisonList.find(p => p.id === product.id)) {
            setComparisonList([...comparisonList, product]);
        }
    };

    const removeFromComparison = (productId) => {
        setComparisonList(comparisonList.filter(p => p.id !== productId));
    };

    const clearComparison = () => setComparisonList([]);

    return (
        <ComparisonContext.Provider value={{ comparisonList, addToComparison, removeFromComparison, clearComparison }}>
            {children}
        </ComparisonContext.Provider>
    );
};

