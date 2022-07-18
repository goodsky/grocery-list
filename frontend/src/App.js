import './App.css'
import { useEffect, useState } from 'react'
import fooService from './services/foo'

function App() {
    const [foo, setFoo] = useState('')

    useEffect(() => {
        ;(async () => {
            const foo = await fooService.getFoo()
            setFoo(foo)
        })()
    }, [])

    return (
        <div className="App">
            <h1>Welcome to Super List!</h1>
            <div>
                <h2 data-testid="message">Message = {foo}</h2>
            </div>
        </div>
    )
}

export default App
