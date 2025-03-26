import React, {createContext, useContext, useState, ReactNode, useEffect, useMemo, useCallback} from 'react';

export interface SmartComponentValue {
    smartID: string;
    smartSemantic?: string;
    value?: string;
}

interface SmartComponentElement {
    value: SmartComponentValue;
    children: SmartComponentElementMap | null;
}

interface SmartComponentContextType {
    addComponent: (value: SmartComponentValue) => void;
    addElement: (parentID: string, value: SmartComponentElementMap) => void;
    hierarchy: SmartComponentElementMap;
    setHierarchy: React.Dispatch<React.SetStateAction<SmartComponentElementMap>>;
}

const SmartComponentContext = createContext<SmartComponentContextType | undefined>(undefined);

interface SubscriptionProviderProps {
    children: ReactNode;
    identifier: string;
}

type SmartComponentElementMap = Map<string, SmartComponentElement>;

export default function SmartComponentProvider(props: SubscriptionProviderProps) {
    const {children, identifier} = props;
    const [childrenElements, setChildrenElements] = useState<SmartComponentElementMap>(new Map());

    const context = useContext(SmartComponentContext);


    const addComponent = useCallback((value: SmartComponentValue)=> {
        setChildrenElements(prev => {
            const newMap = new Map(prev);
            let children = null;
            if(prev.has(value.smartID)) {
                children = newMap.get(value.smartID)?.children ?? null;
            }
            newMap.set(value.smartID, {value: value, children: children});
            return newMap;
        });
    }, [])



    const addChildrenElements = useCallback((parentId: string, value: SmartComponentElementMap) => {
        if(context === undefined) {
            return;
        }
        context.setHierarchy(prev => {
            const newMap = new Map(prev);
            const parentElement = newMap.get(parentId);
            if (parentElement) {
                const existingChildren = parentElement.children ?? [];
                newMap.set(parentId, {...parentElement, children: new Map([...existingChildren, ...value])} );
            } else {
                console.log("PARENT not found")
            }

            return newMap;
        });
    }, [context])

    useEffect(() => {
        addChildrenElements(identifier, childrenElements)
        console.log(childrenElements);
    }, [addChildrenElements, childrenElements, identifier]);



    const value = useMemo(() => ({
        addComponent: addComponent,
        addElement: addChildrenElements,
        hierarchy: childrenElements,
        setHierarchy: setChildrenElements,
    }), [addComponent, addChildrenElements, childrenElements])

    return (
        <SmartComponentContext.Provider value={value}>
            {children}
        </SmartComponentContext.Provider>
    );
};

export function useSmartComponentManager (): SmartComponentContextType {
    const context = useContext(SmartComponentContext);
    if (!context) {
        throw new Error('useSmartComponentManager must be used within a SmartComponentProvider');
    }
    return context;
}