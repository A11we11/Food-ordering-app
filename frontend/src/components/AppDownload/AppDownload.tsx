import "./AppDownload.css";
import google from "../../assets/store/googleplay.png";
import apple from "../../assets/store/appstore2.png";

const AppDownload = () => {
  return (
    <div className="app-download" id="app-download">
      <p>
        For Better Experience Download <br /> QuikBite
      </p>
      <div className="app-download-platforms">
        <img src={google} alt="" />
        <img src={apple} alt="" />
      </div>
    </div>
  );
};

export default AppDownload;
