import { useEffect } from "react"
import { useParams } from "react-router-dom"

const useSetRoomId = (setRoomId) => {
  const { roomId } = useParams()

  useEffect(() => {
    setRoomId(roomId)
  }, [])
}

export default useSetRoomId
