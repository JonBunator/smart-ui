import {createContext, useContext, useState, ReactNode, useMemo, useCallback} from 'react';
import SmartComponentProvider from "../../internal/SmartComponentProvider";


export interface SmartComponentValue {
    /**
     * Unique identifier.
     */
    id: string;
    /**
     * Value of the smart component. For textfields this can be the inputted text.
     */
    value?: string | number | readonly string[];

    /**
     * Additional properties.
     */
    [key: string]: any;
}

/**
 * Element represents value of smart component and children.
 */
export interface SmartComponentElement extends SmartComponentValue {
    children: SmartComponentElement[] | undefined;
}

interface SmartComponentElementInternal {
    value: SmartComponentValue;
    children: SmartComponentElementMap | null;
}

interface SmartComponentContextType {
    /**
     *
     * @param parentID The identifier of the parent this component belongs to.
     * @param value The value of the smart component that represents the current state.
     */
    addComponent: (parentID: string, value: SmartComponentValue) => void;
    /**
     * Removes the component from parent.
     * @param parentID The identifier of the parent this component belongs to.
     * @param identifier The identifier of the component.
     */
    removeComponent: (parentID: string, identifier: string) => void;
    /**
     * Returns all elements of the root.
     */
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
