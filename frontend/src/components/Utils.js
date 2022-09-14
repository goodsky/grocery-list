import { useEffect } from 'react'

// https://stackoverflow.com/questions/32553158/detect-click-outside-react-component
export const useOutsideAlerter = (ref, onClickOutside) => {
    useEffect(() => {
        /**
         * Alert if clicked on outside of element
         */
        const handleClickOutside = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                onClickOutside()
            }
        }

        // Bind the event listener
        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            // Unbind the event listener on clean up
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [ref, onClickOutside])
}
