// Think of this like a scuffed ContextManager or redux state manager, allowing us to set the roomId from any Component that requires it.

import { useEffect } from "react"
import { useParams } from "react-router-dom"

function useSetRoomId(setRoomId) {
  const { roomId } = useParams()

  useEffect(() => {
    setRoomId(roomId)
  }, [])
}

export default useSetRoomId
