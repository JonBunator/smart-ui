import {SmartComponent, SmartInput} from "../src/main";
import {useSmartComponentManager} from "../src/components/SmartComponentManager";
//import {Button, SmartInput, Label} from "../src/main";

function App() {


    const {getHierarchy, changeValue} = useSmartComponentManager();

    return (<>
            <SmartComponent>
                <label htmlFor="name">Name</label>
                <SmartInput id="name" smartSemantic="Name" />

                <label htmlFor="age">Age</label>
                <SmartInput type="number" id="age" smartSemantic="Age" />

                <SmartComponent id="gender">
                    <div>
                        <p>Gender:</p>
                        <label htmlFor="age">Male</label>
                        <SmartInput type="radio" id="gender-male" />

                        <label htmlFor="age">Female</label>
                        <SmartInput type="radio" id="gender-female" />

                        <label htmlFor="age">Other</label>
                        <SmartInput type="radio" id="gender-other" />
                    </div>
                </SmartComponent>

                <SmartComponent id="interests">
                    <div>
                        <p>Interests:</p>
                        <label htmlFor="interests-sports">Sports</label>
                        <SmartInput type="checkbox" id="interests-sports"/>

                        <label htmlFor="interests-music">Music</label>
                        <SmartInput type="checkbox" id="interests-music"/>

                        <label htmlFor="interests-reading">Reading</label>
                        <SmartInput type="checkbox" id="interests-reading"/>

                        <label htmlFor="interests-other">Other</label>
                        <SmartInput type="textarea" id="interests-other" />
                    </div>
                </SmartComponent>
            </SmartComponent>
        <br/>
        <br/>
        <textarea style={{height: "400px", width: "100%"}}/>
        <button onClick={() => changeValue("gender-female", true)}>Update value</button>
        <button onClick={() => {console.log(JSON.stringify(getHierarchy()))}}>Print structure</button>
        </>
    )
}

export default App
