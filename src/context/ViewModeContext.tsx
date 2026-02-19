import React, { createContext, useContext, useState, type ReactNode } from 'react';
import { getCookie, setCookie } from '../utils/cookies';

interface ViewModeContextType {
    showMineOnly: boolean;
    setShowMineOnly: (show: boolean) => void;
    toggleViewMode: () => void;
}

const ViewModeContext = createContext<ViewModeContextType | undefined>(undefined);

export const ViewModeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [showMineOnly, setShowMineOnlyState] = useState(() => {
        // Migration: Check for old cookie if new one doesn't exist
        const saved = getCookie('view_mode_mine_only');
        if (saved !== null) return saved === 'true';

        // Fallback to old cookie name or default to true
        const oldSaved = getCookie('dashboard_mine_only');
        return oldSaved !== null ? oldSaved === 'true' : true;
    });

    const setShowMineOnly = (show: boolean) => {
        setShowMineOnlyState(show);
        setCookie('view_mode_mine_only', String(show));
        // Keep old cookie in sync just in case, or we can just abandon it
        setCookie('dashboard_mine_only', String(show));
    };

    const toggleViewMode = () => {
        setShowMineOnly(!showMineOnly);
    };

    return (
        <ViewModeContext.Provider value={{ showMineOnly, setShowMineOnly, toggleViewMode }}>
            {children}
        </ViewModeContext.Provider>
    );
};

export const useViewMode = () => {
    const context = useContext(ViewModeContext);
    if (context === undefined) {
        throw new Error('useViewMode must be used within a ViewModeProvider');
    }
    return context;
};
