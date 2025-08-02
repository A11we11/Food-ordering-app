import "./Header.css";

const Header = () => {
  return (
    <div className="header">
      <div className="header-contents">
        <h2>Order your favourite food here</h2>
        <p className="header-description">
          "Welcome to QuikBite ,your go-to food delivery app where convenience
          meets flavor. Discover your favorite meals from top restaurants around
          you and get them delivered hot and fresh, right to your doorstep.
          Whether you're craving local dishes, fast food, or a healthy bite,
          QuikBite brings it all to your fingertips – fast, easy, and always
          satisfying."
        </p>
        <button className="button">View Menu</button>
      </div>
    </div>
  );
};

export default Header;
