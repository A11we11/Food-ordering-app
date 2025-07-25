import { Route, Routes } from "react-router-dom";
import Navbar from "./components/navBar/Navbar";

import PlaceOrder from "./pages/PlaceOrder/PlaceOrder";
import Cart from "./pages/Cart/Cart";
import Home from "./pages/Home/Home";
import Footer from "./components/Footer/Footer";
import LoginPopup from "./components/LoginPopup/LoginPopup";
import { useState } from "react";

const App = () => {
  const [showLogin, setShowLogin] = useState<boolean>(false);
  return (
    <>
      {showLogin ? <LoginPopup setShowLogin={setShowLogin} /> : <></>}
      <div className="app">
        <Navbar setShowLogin={setShowLogin} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/order" element={<PlaceOrder />} />
        </Routes>
      </div>
      <Footer />
    </>
  );
};

export default App;
