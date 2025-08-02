import Logo from "../Logo";
import "./Navbar.css";
import { CircleUserRound } from "lucide-react";

const Navbar = () => {
  return (
    <div className="navbar">
      <div className="logo">
        <Logo width={200} />
      </div>

      <CircleUserRound size={35} />
    </div>
  );
};

export default Navbar;
