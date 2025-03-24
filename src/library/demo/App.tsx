import { useState } from 'react'
import './App.css'
import {Button, Input, Label} from "../src/main";

function App() {
    const [count, setCount] = useState(0)
    const [inputCustomCountValue, setInputCustomCountValue] = useState('');

    const handleClickCustomCount = () => {
        if (inputCustomCountValue === '') {
            setCount(count => count + 1);
        } else {
            setCount(Number(inputCustomCountValue));
        }
    }

    return (
        <>
            <h1>Vite + React</h1>
            <div className="card">
                <Label>My Label</Label><br />
                <Input
                    placeholder="Custom count"
                    value={inputCustomCountValue}
                    onChange={(e) => setInputCustomCountValue(e.target.value)}
                /><br />
                <Button onClick={handleClickCustomCount}>
                    count is {count}
                </Button>
                <p>
                    Edit <code>src/App.tsx</code> and save to test HMR
                </p>
            </div>
            <p className="read-the-docs">
                Click on the Vite and React logos to learn more
            </p>
        </>
    )
}

export default App
