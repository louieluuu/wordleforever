import React, { useState } from 'react'
import { FaRegCircleQuestion } from 'react-icons/fa6'

function Card({
    mode,
    setMode,
    selected,
    description,
}) {
    const [flipped, setFlipped] = useState(false)

    function handleCardClick(mode) {
        setMode(mode)
    }

    function handleInfoClick(e) {
        e.stopPropagation()
        setFlipped(!flipped)
    }

    function formatClassName(mode) {
        return mode.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '')
    }

    function displayNameMode(mode) {
        if (mode === 'Online (Private)') {
            return 'Play with Friends'
        }
        if (mode === 'Online (Public)') {
            return 'Matchmaking'
        }
        return mode
    }

    const formattedMode = formatClassName(mode)

    return (
        <>

        {!flipped ? (
            <div
                className={`card__front__${formattedMode}${selected ? " selected" : ""}`}
                onClick={() => setMode(mode)}
            >
                <FaRegCircleQuestion className="info-button" onClick={handleInfoClick} />
                {displayNameMode(mode)}
            </div>
        ) : (
            <div
                className={`card__back${selected ? " selected" : ""}`}
                onClick={() => setMode(mode)}
            >
                <FaRegCircleQuestion className="info-button" onClick={handleInfoClick} />
                {description}
            </div>
            
        )}
        </>
    )
}

export default Card