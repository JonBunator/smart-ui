import {createContext, useContext, useState, ReactNode, useMemo, useCallback} from 'react';
import SmartComponentProvider from "../SmartComponentProvider";

export interface SmartComponentValue {
    id: string;
    semantic?: string;
    type?: string;
    value?: string | number | readonly string[];
}

interface SmartComponentElementInternal {
    value: SmartComponentValue;
    children: SmartComponentElementMap | null;
}

interface SmartComponentElement extends SmartComponentValue {
    children: SmartComponentElement[] | undefined;
}

interface SmartComponentContextType {
    addComponent: (parentID: string, value: SmartComponentValue) => void;
    removeComponent: (parentID: string, identifier: string) => void;
    getHierarchy: () => SmartComponentElement[];
}

const SmartComponentContext = createContext<SmartComponentContextType | undefined>(undefined);

interface SubscriptionProviderProps {
    children: ReactNode;
}

type SmartComponentElementMap = Map<string, SmartComponentElementInternal>;
type SmartComponentValueMap = Map<string, SmartComponentValue>;
type ParentChildMap = Map<string, Set<string>>;

export default function SmartComponentManager(props: SubscriptionProviderProps) {
    const {children} = props;
    const [elements, setElements] = useState<SmartComponentValueMap>(new Map());
    const [parentChildrenMapping, setParentChildrenMapping] = useState<ParentChildMap>(new Map());

    const addComponent = useCallback((parentID: string, value: SmartComponentValue) => {
        setElements(prev => {
            const newMap = new Map(prev);
            newMap.set(value.id, value);
            return newMap;
        });

        setParentChildrenMapping(prev => {
            const newMap = new Map(prev);
            const existingChildren = newMap.get(parentID);
            newMap.set(parentID, new Set([...existingChildren ?? [], value.id]));
            return newMap;
        });
    }, []);

    const removeComponent = useCallback((parentID: string, identifier: string) => {
        setElements(prev => {
            const newMap = new Map(prev);
            newMap.delete(identifier);
            return newMap;
        });

        setParentChildrenMapping(prev => {
            const newMap = new Map(prev);
            const existingChildren = newMap.get(parentID);

            if (existingChildren) {
                existingChildren.delete(identifier);
                newMap.set(parentID, existingChildren);
            }

            return newMap;
        });
    }, []);

    const getHierarchy = useCallback((): SmartComponentElement[] => {
        const buildHierarchy = (identifier: string): SmartComponentElement | null => {
            const value = elements.get(identifier);
            if(!value) return null;

            const childrenIDs = parentChildrenMapping.get(identifier) || new Set();
            const children: SmartComponentElement[] = [];

            childrenIDs.forEach(childID => {
                const childElement = buildHierarchy(childID);
                if (childElement) {
                    children.push(childElement);
                }
            });
            return {
                ...value,
                children: children.length !== 0 ? children : undefined,
            };
        };
        const rootChildrenIDs: string[] = Array.from(parentChildrenMapping.get("root") ?? new Set())
        return rootChildrenIDs
            .map(identifier => buildHierarchy(identifier))
            .filter(result => result !== null);
    }, [elements, parentChildrenMapping]);

    const value = useMemo(() => ({
        addComponent: addComponent,
        removeComponent: removeComponent,
        getHierarchy: getHierarchy,
    }), [addComponent, removeComponent, getHierarchy]);

    return (
        <SmartComponentProvider identifier="root">
            <SmartComponentContext.Provider value={value}>
                {children}
            </SmartComponentContext.Provider>
        </SmartComponentProvider>
    );
};

export function useSmartComponentManager(): SmartComponentContextType {
    const context = useContext(SmartComponentContext);
    if (!context) {
        throw new Error('useSmartComponentManager must be used within a SmartComponentManager');
    }
    return context;
}
