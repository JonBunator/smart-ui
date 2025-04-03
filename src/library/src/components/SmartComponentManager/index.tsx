import {createContext, useContext, useState, ReactNode, useMemo, useCallback} from 'react';
import SmartComponentParent from "../../internal/SmartComponentParent";
import {SmartComponentValue, ValueType, ValueUpdate} from "../types/types.ts";
import {sleep} from "../../internal/common/utils.ts";

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
     * @param smartOnChange Callback that invokes value change in smart component.
     */
    addComponent: (parentID: string, value: SmartComponentValue, smartOnChange?: (value: ValueType) => void) => void;
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
    /**
     * Changes a value of the component.
     * @param update The id and value to be updated.
     */
    changeValue: (update: ValueUpdate) => Promise<void>;

    /**
     * Similar to changeValue, but updates multiple components.
     * @param updates The ids and values to be updated.
     */
    changeMultipleValues: (updates: ValueUpdate[]) => Promise<void>;
}

const SmartComponentContext = createContext<SmartComponentContextType | undefined>(undefined);

interface SubscriptionProviderProps {
    children: ReactNode;
}

type SmartComponentElementMap = Map<string, SmartComponentElementInternal>;
type SmartComponentValueMap = Map<string, SmartComponentValue>;
type ParentChildMap = Map<string, Set<string>>;
type ElementOnChangeMap = Map<string, (value: ValueType) => void>;

export default function SmartComponentManager(props: SubscriptionProviderProps) {
    const {children} = props;
    const [elements, setElements] = useState<SmartComponentValueMap>(new Map());
    const [parentChildrenMapping, setParentChildrenMapping] = useState<ParentChildMap>(new Map());
    const [elementOnChangeMapping, setElementOnChangeMapping] = useState<ElementOnChangeMap>(new Map());

    const addComponent = useCallback((parentID: string, value: SmartComponentValue, smartOnChange?: (value: ValueType) => void) => {
        setElements(prev => {
            const newMap = new Map(prev);
            newMap.set(value.id, value);
            return newMap;
        });
        if(smartOnChange) {
            setElementOnChangeMapping(prev => {
                const newMap = new Map(prev);
                newMap.set(value.id, smartOnChange);
                return newMap;
            });
        }

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

        setElementOnChangeMapping(prev => {
            const newMap = new Map(prev);
            newMap.delete(identifier);
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

    const changeValue = useCallback(async (update: ValueUpdate): Promise<void> => {
        const onChangeFunction = elementOnChangeMapping.get(update.id);
        const value = elements.get(update.id);

        if (value && onChangeFunction) {
            // Sleep before clicking on button to wait for state update.
            if(value.type === "button") {
                await sleep(1000);
            }
            onChangeFunction(update.value);
        } else {
            console.warn(`No component found with identifier: ${update.id}`);
        }
    }, [elementOnChangeMapping, elements]);

    const changeMultipleValues = useCallback(async (updates: ValueUpdate[]): Promise<void> => {
        for(const update of updates) {
            await changeValue(update);
        }
    }, [changeValue]);

    const value = useMemo(() => ({
        addComponent: addComponent,
        removeComponent: removeComponent,
        getHierarchy: getHierarchy,
        changeValue: changeValue,
        changeMultipleValues: changeMultipleValues,
    }), [addComponent, removeComponent, getHierarchy, changeValue, changeMultipleValues]);

    return (
        <SmartComponentParent identifier="root">
            <SmartComponentContext.Provider value={value}>
                {children}
            </SmartComponentContext.Provider>
        </SmartComponentParent>
    );
};

export function useSmartComponentManager(): SmartComponentContextType {
    const context = useContext(SmartComponentContext);
    if (!context) {
        throw new Error('useSmartComponentManager must be used within a SmartComponentManager');
    }
    return context;
}
