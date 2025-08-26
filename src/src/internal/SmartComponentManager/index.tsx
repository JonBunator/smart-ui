import {createContext, ReactNode, useCallback, useContext, useMemo, useRef} from 'react';
import {SmartComponentValue, ValueType, ValueUpdate} from "../../utils/types.ts";
import SmartComponentParent from "../SmartComponentParent";

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
    /**
     * Subscribes to notifier that notifies listeners when all components are loaded. Returns unsubscribe function
     * @param listener The listener that should listen to changes.
     */
    subscribeAllComponentsLoaded: (listener: () => void) => () => void;
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

const SmartComponentManager = (props: SubscriptionProviderProps) => {
    const {children} = props;
    const elements = useRef<SmartComponentValueMap>(new Map());
    const parentChildrenMapping = useRef<ParentChildMap>(new Map());
    const elementOnChangeMapping = useRef<ElementOnChangeMap>(new Map());
    const elementOnChangeApprovalMapping = useRef<ElementOnChangeApprovalMap>(new Map());
    const suggestedValueChangesMapping = useRef<SuggestedValueChangesMap>(new Map());
    const allComponentsLoadedTimeoutId = useRef<NodeJS.Timeout | null>(null);
    const allComponentsLoadedListener = useRef<Set<() => void>>(new Set());

    const addComponent = useCallback((parentID: string, value: SmartComponentValue, smartOnChange?: (value: ValueType) => Promise<boolean>, onChangeApproval?: (accept: boolean, value: ValueType) => Promise<boolean>) => {
        elements.current.set(value.id, value);

        if (smartOnChange) {
            elementOnChangeMapping.current.set(value.id, smartOnChange);
        }

        if (onChangeApproval) {
            elementOnChangeApprovalMapping.current.set(value.id, onChangeApproval);
        }

        const existingChildren = parentChildrenMapping.current.get(parentID) || new Set();
        existingChildren.add(value.id);
        parentChildrenMapping.current.set(parentID, existingChildren);

        if (allComponentsLoadedTimeoutId.current) {
            clearTimeout(allComponentsLoadedTimeoutId.current);
        }

        allComponentsLoadedTimeoutId.current = setTimeout(() => {
            allComponentsLoadedListener.current.forEach(listener => listener());
        }, 1000);
    }, []);

    const removeComponent = useCallback((parentID: string, identifier: string) => {
        elements.current.delete(identifier);

        const existingChildren = parentChildrenMapping.current.get(parentID);
        if (existingChildren) {
            existingChildren.delete(identifier);
            parentChildrenMapping.current.set(parentID, existingChildren);
        }

        elementOnChangeMapping.current.delete(identifier);
    }, []);

    const getHierarchy = useCallback((): SmartComponentElement[] => {
        const buildHierarchy = (identifier: string): SmartComponentElement | null => {
            const value = elements.current.get(identifier);
            if (!value) return null;

            const childrenIDs = parentChildrenMapping.current.get(identifier) || new Set();
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
        const rootChildrenIDs: string[] = Array.from(parentChildrenMapping.current.get("root") ?? new Set())
        return rootChildrenIDs
            .map(identifier => buildHierarchy(identifier))
            .filter(result => result !== null);
    }, []);

    const changeValue = useCallback(async (update: ValueUpdate): Promise<boolean> => {
        const onChangeFunction = elementOnChangeMapping.current.get(update.id);

        if (onChangeFunction) {
            return await onChangeFunction(update.value);
        } else {
            console.warn(`No component found with identifier: ${update.id}`);
        }
        return false;
    }, []);

    const handleChangeApproval = useCallback(async (accept: boolean): Promise<boolean> => {
        for (const valueChange of suggestedValueChangesMapping.current.values()) {
            const componentID = valueChange.id;
            const changeApproval = elementOnChangeApprovalMapping.current.get(componentID);
            if (changeApproval) {
                await changeApproval(accept, valueChange.value);
            } else {
                console.warn(`No component found with identifier: ${componentID}`);
            }
        }
        suggestedValueChangesMapping.current = new Map();
        return true;
    }, []);

    const suggestValueChanges = useCallback(async (updates: ValueUpdate[]): Promise<boolean> => {
        for (const update of updates) {
            if (suggestedValueChangesMapping.current.has(update.id)) {
                suggestedValueChangesMapping.current.delete(update.id);
            }
            const successful = await changeValue(update);
            if (successful) {
                suggestedValueChangesMapping.current.set(update.id, update);
            }
        }
        return suggestedValueChangesMapping.current.size !== 0;
    }, [changeValue]);

    const subscribeAllComponentsLoaded = useCallback((listener: () => void) => {
        allComponentsLoadedListener.current.add(listener);
        return () => allComponentsLoadedListener.current.delete(listener);
    }, []);

    const value = useMemo(() => ({
        addComponent: addComponent,
        removeComponent: removeComponent,
        getHierarchy: getHierarchy,
        suggestValueChanges: suggestValueChanges,
        handleChangeApproval: handleChangeApproval,
        subscribeAllComponentsLoaded
    }), [addComponent, removeComponent, getHierarchy, suggestValueChanges, handleChangeApproval, subscribeAllComponentsLoaded]);

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

export {SmartComponentManager};