import {SmartComponent} from "../src/main";
import {useSmartComponentManager} from "../src/components/SmartComponentManager";
//import {Button, SmartInput, Label} from "../src/main";

function App() {

    const {getHierarchy} = useSmartComponentManager();

    return (<>
            <SmartComponent smartID="1">
                <SmartComponent smartID="2" smartSemantic="email" />
                <SmartComponent smartID="3" smartSemantic="username" />
            </SmartComponent>
            <button onClick={() => {console.log(JSON.stringify(getHierarchy()))}}>CLick</button>
        </>
    )
}

export default App
