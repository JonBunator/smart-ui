import {createContext, useContext, useState, ReactNode, useMemo, useCallback, useRef} from 'react';
import {SmartComponentValue, ValueType, ValueUpdate} from "../../utils/types.ts";
import SmartComponentParent from "../../internal/SmartComponentParent";

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
     * @param handleChangeApproval Callback that invokes approval process in smart component. When accept is true,
     * the changes where accepted. When false, the changes are denied and the previous value is set. value is the
     * newly set value.
     */
    addComponent: (parentID: string, value: SmartComponentValue, smartOnChange?: (value: ValueType) => Promise<boolean>, onChangeApproval?: (accept: boolean, value: ValueType) => Promise<boolean>) => void;
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
     * Suggests value change for components.
     * @param updates The ids of the components and values to be updated.
     */
    suggestValueChanges: (updates: ValueUpdate[]) => Promise<boolean>;
    /**
     * Accept or deny suggested changes.
     * @param accept Accepts the changes when true, clears them when false.
     */
    handleChangeApproval: (accept: boolean) => Promise<boolean>;
}

const SmartComponentContext = createContext<SmartComponentContextType | undefined>(undefined);

interface SubscriptionProviderProps {
    children: ReactNode;
}

type SmartComponentElementMap = Map<string, SmartComponentElementInternal>;
type SmartComponentValueMap = Map<string, SmartComponentValue>;
type ParentChildMap = Map<string, Set<string>>;
type ElementOnChangeMap = Map<string, (value: ValueType) => Promise<boolean>>;
type ElementOnChangeApprovalMap = Map<string, (accept: boolean, value: ValueType) => Promise<boolean>>;
type SuggestedValueChangesMap = Map<string, ValueUpdate>;

export function SmartComponentManager(props: SubscriptionProviderProps) {
    const {children} = props;
    const [elements, setElements] = useState<SmartComponentValueMap>(new Map());
    const [parentChildrenMapping, setParentChildrenMapping] = useState<ParentChildMap>(new Map());
    const [elementOnChangeMapping, setElementOnChangeMapping] = useState<ElementOnChangeMap>(new Map());
    const [elementOnChangeApprovalMapping, setElementOnChangeApprovalMapping] = useState<ElementOnChangeApprovalMap>(new Map());
    const suggestedValueChangesMapping = useRef<SuggestedValueChangesMap>(new Map());

    const addComponent = useCallback((parentID: string, value: SmartComponentValue, smartOnChange?: (value: ValueType) => Promise<boolean>, onChangeApproval?: (accept: boolean, value: ValueType) => Promise<boolean>) => {
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

        if(onChangeApproval) {
            setElementOnChangeApprovalMapping(prev => {
                const newMap = new Map(prev);
                newMap.set(value.id, onChangeApproval);
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
            await onChangeFunction(update.value);
        } else {
            console.warn(`No component found with identifier: ${update.id}`);
        }
    }, [elementOnChangeMapping, elements]);

    const handleChangeApproval = useCallback(async (accept: boolean): Promise<boolean> => {
        for(const valueChange of suggestedValueChangesMapping.current.values()) {
            const componentID = valueChange.id;
            const changeApproval = elementOnChangeApprovalMapping.get(componentID);
            if(changeApproval) {
                await changeApproval(accept, valueChange.value);
            } else {
                console.warn(`No component found with identifier: ${componentID}`);
            }
        }
        suggestedValueChangesMapping.current = new Map();
        return true;
    }, [elementOnChangeApprovalMapping]);

    /**
     * Undos previous suggested changes for elements that are not included in new update.
     * @param updates New updates.
     */
    const undoPreviousSuggestedChanges= useCallback(async (updates: ValueUpdate[]) =>  {
        const updateIds = new Set(updates.map(update => update.id));
        const updatesToRemove: ValueUpdate[] = [];
        suggestedValueChangesMapping.current.forEach((value, id) => {
            if(!updateIds.has(id)) {
                updatesToRemove.push(value);
            }
        })

        for(const update of updatesToRemove) {
            const changeApproval = elementOnChangeApprovalMapping.get(update.id);
            const oldValue = suggestedValueChangesMapping.current.get(update.id);
            if(changeApproval && oldValue) {
                await changeApproval(false, oldValue.value);
            }
            suggestedValueChangesMapping.current.delete(update.id);
        }
    }, [elementOnChangeApprovalMapping]);

    const suggestValueChanges = useCallback(async (updates: ValueUpdate[]): Promise<boolean> => {
        await undoPreviousSuggestedChanges(updates);
        for(const update of updates) {
            suggestedValueChangesMapping.current.set(update.id, update);
            await changeValue(update);
        }
        return true;
    }, [changeValue, undoPreviousSuggestedChanges]);

    const value = useMemo(() => ({
        addComponent: addComponent,
        removeComponent: removeComponent,
        getHierarchy: getHierarchy,
        suggestValueChanges: suggestValueChanges,
        handleChangeApproval: handleChangeApproval,
    }), [addComponent, removeComponent, getHierarchy, suggestValueChanges, handleChangeApproval]);

    return (
        <SmartComponentParent identifier="root">
            <SmartComponentContext.Provider value={value}>
                {children}
            </SmartComponentContext.Provider>
        </SmartComponentParent>
    );
}

export function useSmartComponentManager(): SmartComponentContextType {
    const context = useContext(SmartComponentContext);
    if (!context) {
        throw new Error('useSmartComponentManager must be used within a SmartComponentManager');
    }
    return context;
}
