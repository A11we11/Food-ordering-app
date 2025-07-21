import Logo from "../Logo";
import profile from "../../assets/profile3.jpg";
import "./Navbar.css";

const Navbar = () => {
  return (
    <div className="navbar">
      <div className="logo">
        <Logo width={40} height={40} />
      </div>
      <img src={profile} alt="" className="profile" />
    </div>
  );
};

export default Navbar;
