import { setupServer } from "msw/node";
import { CartHandlers } from "./handlers";
import { LoginPopupHandlers } from "./handlers";

export const CartServer = setupServer(...CartHandlers);
export const LoginPopupServer = setupServer(...LoginPopupHandlers);
