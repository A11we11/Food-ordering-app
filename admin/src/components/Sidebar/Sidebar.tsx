import { NavLink } from "react-router-dom";
import "./Sidebar.css";
import { IoAddCircleOutline } from "react-icons/io5";
import { FaClipboardCheck, FaListCheck } from "react-icons/fa6";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-options">
        <NavLink to="/add" className="sidebar-option">
          <IoAddCircleOutline width={20} height={20} />
          <p>Add Items</p>
        </NavLink>
        <NavLink to="/list" className="sidebar-option">
          <FaListCheck width={20} height={20} />
          <p>List Items</p>
        </NavLink>
        <NavLink to="/orders" className="sidebar-option">
          <FaClipboardCheck width={20} height={20} />
          <p>Orders</p>
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;
