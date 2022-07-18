import { act, render, screen, waitFor } from '@testing-library/react'

import App from '../App'
import fooService from '../services/foo'
import sinon from 'sinon'

test('renders header', async () => {
    const fooServiceMock = sinon.mock(fooService)
    fooServiceMock.expects('getFoo').once().resolves('You have been mocked!')

    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
        render(<App />)
    })

    fooServiceMock.verify()

    const headerElement = screen.getByText(/Welcome to Super List!/i)
    expect(headerElement).toBeInTheDocument()

    const messageElement = screen.getByTestId('message')
    expect(messageElement).toHaveTextContent('Message = You have been mocked!')
})
