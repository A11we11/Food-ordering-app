import axios from "axios";
import { StoreContext } from "../../context/storeContext";
import "./LoginPop.css";

import { useContext, useState } from "react";
import { RxCross2 } from "react-icons/rx";

interface LoginPopupProps {
  setShowLogin: React.Dispatch<React.SetStateAction<boolean>>;
}

const LoginPopup = ({ setShowLogin }: LoginPopupProps) => {
  const { url, setToken } = useContext(StoreContext);
  const [currState, setCurrState] = useState("Sign Up");
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const onChangeHandler = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const name = e.target.name;
    const value = e.target.value;
    setData((data) => ({ ...data, [name]: value }));
  };

  /*  useEffect(() => {
    console.log(data);
  }, [data]); */

  const onLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let newUrl = url;
    if (currState === "Login") {
      newUrl += "/api/user/login";
    } else {
      newUrl += "/api/user/register";
    }

    //

    try {
      const response = await axios.post(newUrl, data);

      // Clear form values after submission (success or failure)
      setData({
        name: "",
        email: "",
        password: "",
      });

      if (response.data.success) {
        setToken(response.data.token);
        localStorage.setItem("token", response.data.token);
        // Close the popup on successful login
        setShowLogin(false);
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      // Clear form values even on error
      setData({
        name: "",
        email: "",
        password: "",
      });
      alert("An error occurred. Please try again.");
      console.log(error);
    }
    //
  };

  return (
    <div className="login-popup">
      <form className="login-popup-container" onSubmit={onLogin}>
        <div className="login-popup-title">
          <h2>{currState}</h2>
          <RxCross2 size={30} onClick={() => setShowLogin(false)} />
          {/* <img src="" alt="" /> */}
        </div>
        <div className="login-popup-inputs">
          {currState === "Login" ? (
            <></>
          ) : (
            <input
              name="name"
              onChange={onChangeHandler}
              value={data.name}
              type="text"
              placeholder="Your name"
              required
            />
          )}

          <input
            name="email"
            onChange={onChangeHandler}
            value={data.email}
            type="email"
            placeholder="Your email"
            required
          />
          <input
            name="password"
            onChange={onChangeHandler}
            value={data.password}
            type="password"
            placeholder="password"
            required
          />
        </div>

        <button type="submit">
          {currState === "Sign Up" ? "Create account" : "Login"}
        </button>

        <div className=" login-popup-condition ">
          <input type="checkbox" required />
          <p>By continuing, i agree to the terms of use & privacy policy</p>
        </div>
        {currState === "Login" ? (
          <p>
            Create a new account?
            <span onClick={() => setCurrState("Sign Up")}>Click here</span>
          </p>
        ) : (
          <p>
            Already have an account?
            <span onClick={() => setCurrState("Login")}>Login here</span>{" "}
          </p>
        )}
      </form>
    </div>
  );
};

export default LoginPopup;
