import { useState, useEffect } from 'react'
import socket from '../socket'

function CountdownModal({ setShowCountdownModal }) {
    const [seconds, setSeconds] = useState('')

    useEffect(() => {
        socket.on('countdownTick', (seconds) => {
            setShowCountdownModal(true)
            setSeconds(seconds)
        })

        return () => {
            socket.off('countdownTick')
        }
    }, [])

  return (
    <div className='countdown-timer'>
        <p>Starting in... {seconds}</p>
    </div>
  )
}

export default CountdownModal