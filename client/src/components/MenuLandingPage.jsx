import { Link } from "react-router-dom"

// Components
import AnimatedPage from "./AnimatedPage"

function MenuLandingPage() {
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
