import { FaInstagramSquare } from "react-icons/fa";
import Logo from "../logo/Logo";
import "./Footer.css";
import { FaSquareXTwitter } from "react-icons/fa6";
import { RiFacebookBoxFill } from "react-icons/ri";

const Footer = () => {
  return (
    <div className="footer" id="footer">
      <div className="footer-content">
        <div className="footer-content-left">
          <Logo width="120" height="48" />
          <p>
            QuikBite is more than just a food delivery service — it’s your
            trusted partner for satisfying cravings, discovering new meals, and
            enjoying restaurant-quality food from the comfort of your home.
            Whether you’re rushing between tasks, unwinding after a long day, or
            hosting friends and family, QuikBite makes it easier than ever to
            enjoy your favorite dishes, delivered fast and fresh.
          </p>
          <div className="footer-social-icons">
            <RiFacebookBoxFill size={35} />
            <FaSquareXTwitter size={35} />
            <FaInstagramSquare size={35} />
          </div>
        </div>
        <div className="footer-content-center">
          <h2>COMPANY</h2>
          <ul>
            <li>Home</li>
            <li>About us</li>
            <li>Delivery</li>
            <li>Privacy policy</li>
          </ul>
        </div>
        <div className="footer-content-right">
          <h2>GET IN TOUCH</h2>
          <ul>
            <li>+234-70-3577-5408</li>
            <li>contact@QuikBite.com</li>
          </ul>
        </div>
      </div>
      <hr />
      <p className="footer-copyright">
        Copyright 2024 © QuikBite.com - All Right Reserved.
      </p>
    </div>
  );
};

export default Footer;
