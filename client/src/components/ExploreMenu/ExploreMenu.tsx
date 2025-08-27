import { menu_list } from "../../assets/assets";
import "./ExploreMenu.css";

interface ExploreMenuProps {
  category: string;
  setCategory: (category: string | ((prev: string) => string)) => void;
}

const ExploreMenu = ({ category, setCategory }: ExploreMenuProps) => {
  return (
    <section
      className="explore-menu "
      id="explore-menu"
      aria-label="Explore our Menu"
    >
      <h1>Explore our Menu</h1>
      <p className="explore-menu-text">
        choose from a diverse menu featuring a delectable array of dishes. Our
        mission is to satisfy your cravings and elevate your dining
        experience,one delicious meal at a time.
      </p>
      <div className="explore-menu-list">
        {menu_list.map((item, index) => {
          return (
            <button
              onClick={() =>
                setCategory((prev: string) =>
                  prev === item.menu_name ? "All" : item.menu_name
                )
              }
              key={index}
              className="explore-menu-list-item"
            >
              <img
                className={category === item.menu_name ? "active" : ""}
                src={item.menu_image}
                alt="explore menu images"
              />
              <p>{item.menu_name}</p>
            </button>
          );
        })}
      </div>
      <hr />
    </section>
  );
};

export default ExploreMenu;
