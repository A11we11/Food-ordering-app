import Logo from "../logo/Logo";
import { Search, ShoppingBasket } from "lucide-react";

const Navbar = () => {
  return (
    <div className="navbar">
      <Logo width="120" height="48" />
      <ul className="navbar-menu">
        <li>home</li>
        <li>menu</li>
        <li>mobile-app</li>
        <li>contact us</li>
      </ul>
      <div className="navbar-right">
        <Search width="50" height="50" />
        <div className="navbar-search-icon">
          <ShoppingBasket width="50" height="50" />
          <div className="dot"></div>
        </div>
        <button>sign in</button>
      </div>
    </div>
  );
};

export default Navbar;
