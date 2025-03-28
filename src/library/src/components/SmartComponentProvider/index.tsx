import {createContext, useContext, ReactNode} from 'react';

interface SmartComponentContextType {
    parentID: string;
}

const SmartComponentContext = createContext<SmartComponentContextType | undefined>(undefined);

interface SubscriptionProviderProps {
    children: ReactNode;
    identifier: string;
}


export default function SmartComponentProvider(props: SubscriptionProviderProps) {
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
        throw new Error('useSmartComponentParent must be used within a SmartComponentProvider');
    }
    return context;
}