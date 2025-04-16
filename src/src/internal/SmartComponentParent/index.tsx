import {createContext, useContext, ReactNode} from 'react';

interface SmartComponentContextType {
    parentID: string;
}

const SmartComponentContext = createContext<SmartComponentContextType | undefined>(undefined);

interface SmartComponentParentProps {
    children: ReactNode;
    identifier: string;
}

/**
 * Passes identifier to children
 */
export default function SmartComponentParent(props: SmartComponentParentProps) {
    const {children, identifier} = props;

    return (
        <SmartComponentContext.Provider value={{parentID: identifier}}>
            {children}
        </SmartComponentContext.Provider>
    );
};

export function useSmartComponentParent(): SmartComponentContextType {
    const context = useContext(SmartComponentContext);
    if (!context) {
        throw new Error('useSmartComponentParent must be used within a SmartComponentParent');
    }
    return context;
}