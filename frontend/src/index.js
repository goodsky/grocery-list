import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import { Container } from '@mui/material'
import { createTheme, responsiveFontSizes, ThemeProvider } from '@mui/material/styles'

let theme = createTheme()
theme = responsiveFontSizes(theme)

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
    <React.StrictMode>
        <Container>
            <ThemeProvider theme={theme}>
                <BrowserRouter>
                    <App />
                </BrowserRouter>
            </ThemeProvider>
        </Container>
    </React.StrictMode>
)
