import {SmartComponent, SmartInput} from "../src/main";
import {useSmartComponentManager} from "../src/components/SmartComponentManager";
import {useState} from "react";
//import {Button, SmartInput, Label} from "../src/main";

function App() {


    const {getHierarchy, changeMultipleValues} = useSmartComponentManager();
    const [updateValue, setUpdateValue] = useState("[\n" +
        "  {\n" +
        "    \"id\": \"interests-music\",\n" +
        "    \"value\": true\n" +
        "  },\n" +
        "  {\n" +
        "    \"id\": \"name\",\n" +
        "    \"value\": \"Max\"\n" +
        "  }\n" +
        "]");

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
        <textarea style={{height: "400px", width: "100%", lineHeight: "12px"}} value={updateValue} onChange={(event) => setUpdateValue(event.target.value)}/>
        <button onClick={() => changeMultipleValues(JSON.parse(updateValue))}>Update value</button>
        <button onClick={() => {console.log(JSON.stringify(getHierarchy()))}}>Print structure</button>
        </>
    )
}

export default App
