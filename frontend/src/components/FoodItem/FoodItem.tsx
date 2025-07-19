/* import StarRating from "../StarRating"; */
import "./FoodItem.css";
import { useContext } from "react";
import { StoreContext } from "../../context/storeContext";
import minus from "../../assets/minus.svg";
import plus from "../../assets/minus.svg";

interface FoodItemProps {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
}

const FoodItem = ({ id, name, price, description, image }: FoodItemProps) => {
  const { cartItems, addToCart, removeFromCart } = useContext(StoreContext);

  return (
    <div key={id} className="food-item">
      <div className="food-item-img-container">
        <img className="food-item-image" src={image} alt={name} />

        {!cartItems[id] ? (
          <img
            src={plus}
            alt=""
            onClick={() => addToCart(id)}
            className="add"
          />
        ) : (
          <div className="food-item-counter">
            <img src={minus} alt="" onClick={() => removeFromCart(id)} />

            <p>{cartItems[id]}</p>
            <img src={plus} alt="" onClick={() => addToCart(id)} />
          </div>
        )}
      </div>

      <div className="food-item-info">
        <div className="food-item-name-rating">
          <p>{name}</p>
          {/* <StarRating rating={rating} size={14} /> */}
        </div>
        <p className="food-item-desc">{description}</p>
        <p className="food-item-price">${price}</p>
      </div>
    </div>
  );
};

export default FoodItem;
