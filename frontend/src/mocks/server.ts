import { setupServer } from "msw/node";
import { CartHandlers } from "../mocks/handlers";
import { LoginPopupHandlers } from "../mocks/handlers";

export const CartServer = setupServer(...CartHandlers);
export const LoginPopupServer = setupServer(...LoginPopupHandlers);
