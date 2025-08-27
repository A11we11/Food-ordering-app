import { useContext, useEffect, useState } from "react";
import "./MyOrders.css";
import { StoreContext } from "../../context/storeContext";
import axios from "axios";
import DeliveryBoxIcon from "../../components/Deliverybox";

type orderItems = {
  name: string;
  quantity: number;
};

type order = {
  items: orderItems[];
  amount: number;
  status: string;
};

const MyOrders = () => {
  const { url, token } = useContext(StoreContext);
  const [data, setData] = useState<order[]>([]);

  const fetchOrders = async () => {
    const response = await axios.post(
      url + "api/order/userorders",
      {},
      { headers: { token } }
    );
    setData(response.data.data);
    /* console.log(response.data.data) */
  };

  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token]);

  return (
    <div className="my-orders">
      <h2>My Orders</h2>
      <div className="container">
        {data.map((order, index) => (
          <div key={index} className="my-orders-order">
            <DeliveryBoxIcon style={{ width: "200px", height: "200px" }} />
            <p>
              {order.items.map((item, index) => {
                if (index === order.items.length - 1) {
                  return item.name + " x " + item.quantity;
                } else {
                  return item.name + " x " + item.quantity + ", ";
                }
              })}
            </p>
            <p>${order.amount}.00</p>
            <p>Items: {order.items.length}</p>
            <p>
              <span>&#x25cf;</span> <b>{order.status}</b>
            </p>
            <button onClick={fetchOrders}>Track Order</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyOrders;
