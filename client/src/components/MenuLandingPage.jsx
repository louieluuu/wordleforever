import { Link } from "react-router-dom"
import useSetRoomId from "../helpers/useSetRoomId"

// Components
import AnimatedPage from "./AnimatedPage"

function MenuLandingPage({ setRoomId }) {
  useSetRoomId(setRoomId)
  return (
    <AnimatedPage>
      <div className="menu">
        <Link to="/online">
          <button className="menu__btn--online">ONLINE</button>
        </Link>

        <Link to="/offline">
          <button className="menu__btn--offline">OFFLINE</button>
        </Link>
      </div>
    </AnimatedPage>
  )
}

export default MenuLandingPage
