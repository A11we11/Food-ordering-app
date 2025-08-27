// __tests__/routes/cartRouter.test.js
import request from "supertest";
import express from "express";
import jwt from "jsonwebtoken";
import cartRouter from "../../routes/cartRoute.js";
import * as CartController from "../../controllers/CartController.js";
import authMiddleware from "../../middleware/auth.js";

// Mock the controller functions
jest.mock("../../controllers/CartController.js");
jest.mock("../../middleware/auth.js");

const app = express();
app.use(express.json());
app.use("/cart", cartRouter);

// Mock JWT secret
process.env.JWT_SECRET = "test-secret";

describe("Cart Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock auth middleware to pass through
    authMiddleware.mockImplementation((req, res, next) => {
      req.body.userId = "test-user-id";
      next();
    });
  });

  describe("POST /cart/add", () => {
    it("should call addToCart controller when authenticated", async () => {
      const mockAddToCart = jest.fn((req, res) => {
        res.json({ success: true, message: "Added To Cart" });
      });
      CartController.addToCart.mockImplementation(mockAddToCart);

      const response = await request(app)
        .post("/cart/add")
        .send({ itemId: "item123" });

      expect(response.status).toBe(200);
      expect(mockAddToCart).toHaveBeenCalledTimes(1);
      expect(response.body).toEqual({
        success: true,
        message: "Added To Cart",
      });
    });

    it("should require authentication", async () => {
      authMiddleware.mockImplementation((req, res, next) => {
        res.json({ success: false, message: "Not Authorized Login Again" });
      });

      const response = await request(app)
        .post("/cart/add")
        .send({ itemId: "item123" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: false,
        message: "Not Authorized Login Again",
      });
    });
  });

  describe("POST /cart/remove", () => {
    it("should call removeFromCart controller when authenticated", async () => {
      const mockRemoveFromCart = jest.fn((req, res) => {
        res.json({ success: true, message: "Removed From Cart" });
      });
      CartController.removeFromCart.mockImplementation(mockRemoveFromCart);

      const response = await request(app)
        .post("/cart/remove")
        .send({ itemId: "item123" });

      expect(response.status).toBe(200);
      expect(mockRemoveFromCart).toHaveBeenCalledTimes(1);
      expect(response.body).toEqual({
        success: true,
        message: "Removed From Cart",
      });
    });
  });

  describe("POST /cart/get", () => {
    it("should call getCart controller when authenticated", async () => {
      const mockGetCart = jest.fn((req, res) => {
        res.json({
          success: true,
          cartData: { item123: 2, item456: 1 },
        });
      });

      CartController.getCart.mockImplementation(mockGetCart);

      const response = await request(app).post("/cart/get").send({});

      expect(response.status).toBe(200);
      expect(mockGetCart).toHaveBeenCalledTimes(1);
      expect(response.body).toEqual({
        success: true,
        cartData: { item123: 2, item456: 1 },
      });
    });
  });
});
