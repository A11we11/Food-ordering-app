import { useContext } from "react";
import "./FoodDisplay.css";
import { StoreContext } from "../../context/storeContext";
import FoodItem from "../FoodItem/FoodItem";

interface FoodDisplayProps {
  category: string;
}

const FoodDisplay: React.FC<FoodDisplayProps> = ({ category }) => {
  const { food_list } = useContext(StoreContext);

  return (
    <div className="food-display" id="food-display">
      <h2>top dishes near you</h2>
      <div className="food-display-list">
        {food_list
          .filter((item) => category === "All" || category === item.category)
          .map((item, index) => (
            <FoodItem
              key={index}
              id={item._id}
              description={item.description}
              image={item.image}
              name={item.name}
              price={item.price}
            />
          ))}
      </div>
    </div>
  );
};

export default FoodDisplay;
