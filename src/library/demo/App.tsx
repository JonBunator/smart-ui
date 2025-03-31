import {SmartComponent, SmartInput} from "../src/main";
import {useSmartComponentManager} from "../src/components/SmartComponentManager";
import {useState} from "react";
//import {Button, SmartInput, Label} from "../src/main";

function App() {

    const [email, setEmail] = useState();

    const {getHierarchy} = useSmartComponentManager();

    return (<>
            <SmartComponent id="test">
                <SmartInput smartID="1" smartSemantic="email" value={email} onChange={(event) => setEmail(event.target.value)} />
                <SmartInput smartID="2" smartSemantic="password"/>
                <SmartInput type="radio" smartID="2" smartSemantic="password"/>
                <SmartInput type="checkbox" smartID="3" smartSemantic="password"/>
            </SmartComponent>
            <button onClick={() => {console.log(JSON.stringify(getHierarchy()))}}>CLick</button>
        </>
    )
}

export default App
