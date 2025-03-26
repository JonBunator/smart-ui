import {SmartComponent} from "../src/main";
import SmartComponentProvider from "../src/components/SmartComponentProvider";
//import {Button, SmartInput, Label} from "../src/main";

function App() {

    return (
        <SmartComponentProvider identifier="root">
            <SmartComponent smartID="1">
                <SmartComponent smartID="2"/>
                <SmartComponent smartID="3">
                    <SmartComponent smartID="5"/>
                </SmartComponent>
                <SmartComponent smartID="4"/>
            </SmartComponent>
        </SmartComponentProvider>
    )
}

export default App
