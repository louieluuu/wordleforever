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

    return (
        <>

        {!flipped ? (
            <div
                className={`card__front__${mode.toLowerCase()}${selected ? " selected" : ""}`}
                onClick={() => setMode(mode)}
            >
                <FaRegCircleQuestion className="info-button" onClick={handleInfoClick} />
                {mode}
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