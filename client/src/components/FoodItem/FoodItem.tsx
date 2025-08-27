/* import StarRating from "../StarRating"; */
import "./FoodItem.css";
import { useContext } from "react";
import { StoreContext } from "../../context/storeContext";
import { FaMinus, FaPlus } from "react-icons/fa";

interface FoodItemProps {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
}

const FoodItem = ({ id, name, price, description, image }: FoodItemProps) => {
  const { cartItems, addToCart, removeFromCart, url } =
    useContext(StoreContext);

  return (
    <div /* key={id}  */ className="food-item" data-testid={`food-item-${id}`}>
      <div className="food-item-img-container">
        <img
          className="food-item-image"
          src={url + "/images/" + image}
          alt={name}
        />

        {!cartItems[id] ? (
          <div className="add">
            <FaPlus onClick={() => addToCart(id)} size={30} />
          </div>
        ) : (
          <div className="food-item-counter">
            <FaMinus onClick={() => removeFromCart(id)} size={25} />

            <p>{cartItems[id]}</p>

            <FaPlus onClick={() => addToCart(id)} size={25} />
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
