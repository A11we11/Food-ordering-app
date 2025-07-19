import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/600.css";
import "@fontsource/nunito/600.css";
import { BrowserRouter } from "react-router-dom";
import StoreContextProvider from "./context/storeContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StoreContextProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StoreContextProvider>
);
