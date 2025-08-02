import Logo from "../logo/Logo";
import { ShoppingBasket } from "lucide-react";
import "../navBar/Navbar.css";
import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { StoreContext } from "../../context/storeContext";
import { FaUserCircle } from "react-icons/fa";
import { IoBagSharp } from "react-icons/io5";
import { MdLogout } from "react-icons/md";

interface NavItem {
  id: string;
  label: string;
  path: string;
  isExternal?: boolean;
}

interface NavbarProps {
  setShowLogin: React.Dispatch<React.SetStateAction<boolean>>;
}

const Navbar: React.FC<NavbarProps> = ({ setShowLogin }) => {
  const [activeItem, setActiveItem] = useState<string>("home");

  const { getTotalCartAmount, token, setToken } = useContext(StoreContext);

  const navItems: NavItem[] = [
    { id: "home", label: "Home", path: "#", isExternal: false },
    { id: "menu", label: "Menu", path: "#explore-menu", isExternal: false },
    {
      id: "mobile-app",
      label: "Mobile-app",
      path: "#app-download",
      isExternal: false,
    },
    {
      id: "contact-us",
      label: "Contact-us",
      path: "#footer",
      isExternal: false,
    },
  ];

  const handleNavClick = (itemid: string): void => {
    setActiveItem(itemid);
  };

  const handleSmoothScroll = (
    e: React.MouseEvent<HTMLAnchorElement>,
    targetId: string
  ) => {
    e.preventDefault();

    if (targetId === "#") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const element = document.getElementById(targetId.substring(1));
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    navigate("/");
  };

  return (
    <div className="navbar">
      <Link to="/">
        <Logo width="120" height="48" />
      </Link>
      <ul className="navbar-menu">
        {navItems.map((item) => (
          <li key={item.id} className="navbar-item">
            <a
              href={item.path}
              className={`navbar-link ${
                activeItem === item.id ? "active" : ""
              }`}
              onClick={(e) => {
                handleNavClick(item.id);
                handleSmoothScroll(e, item.path);
              }}
            >
              {item.label}
              {activeItem === item.id && (
                <span className="active-indicator"></span>
              )}
            </a>
          </li>
        ))}
      </ul>

      <div className="navbar-right">
        {/*  <Search width="50" height="50" /> */}
        <div className="navbar-search-icon">
          <Link to="/cart">
            <ShoppingBasket size={35} />
          </Link>
          <div className={getTotalCartAmount() === 0 ? "" : "dot"}></div>
        </div>
        {!token ? (
          <button onClick={() => setShowLogin(true)}>sign in</button>
        ) : (
          <div className="navbar-profile">
            <FaUserCircle size={35} />
            <ul className="nav-profile-dropdown">
              <li onClick={() => navigate("/myorders")}>
                <IoBagSharp size={20} />
                <p>Orders</p>
              </li>
              <hr />
              <li onClick={logout}>
                <MdLogout size={20} />
                <p>Logout</p>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
