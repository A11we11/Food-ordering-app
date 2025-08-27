import "./AppDownload.css";
import google from "../../assets/store/googleplay.png";
import apple from "../../assets/store/appstore2.png";

const AppDownload = () => {
  return (
    <section
      className="app-download"
      id="app-download"
      aria-label="App Download"
    >
      <p>
        For Better Experience Download <br /> QuikBite
      </p>
      <div className="app-download-platforms">
        <img src={google} alt="google image" />
        <img src={apple} alt="apple image" />
      </div>
    </section>
  );
};

export default AppDownload;
