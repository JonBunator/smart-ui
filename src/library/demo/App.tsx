import {SmartComponent, SmartInput} from "../src/main";
import {useSmartComponentManager} from "../src/components/SmartComponentManager";
//import {Button, SmartInput, Label} from "../src/main";

function App() {

    const {getHierarchy} = useSmartComponentManager();

    return (<>
            <SmartComponent id="test">
                <SmartInput smartID="1" smartSemantic="email"/>
                <SmartInput smartID="2" smartSemantic="password"/>
            </SmartComponent>
            <button onClick={() => {console.log(JSON.stringify(getHierarchy()))}}>CLick</button>
        </>
    )
}

export default App
