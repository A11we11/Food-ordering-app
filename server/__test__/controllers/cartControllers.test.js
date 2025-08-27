// __tests__/controllers/CartController.test.js

import {
  addToCart,
  removeFromCart,
  getCart,
} from "../../controllers/CartController.js";
import userModel from "../../models/userModels.js";

// Mock the userModel

jest.mock("../../models/userModels.js");

describe("Cart Controller", () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = {
      body: {
        userId: "test-user-id",
        itemId: "test-item-id",
      },
    };

    mockRes = {
      json: jest.fn(),
      status: jest.fn(() => mockRes),
    };

    jest.clearAllMocks();
  });

  describe("addToCart", () => {
    it("should add new item to empty cart", async () => {
      const mockUser = {
        _id: "test-user-id",
        cartData: {},
      };

      userModel.findById.mockResolvedValue(mockUser);
      userModel.findByIdAndUpdate.mockResolvedValue(mockUser);

      await addToCart(mockReq, mockRes);

      expect(userModel.findById).toHaveBeenCalledWith("test-user-id");
      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith("test-user-id", {
        cartData: { "test-item-id": 1 },
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Added To Cart",
      });
    });

    it("should increment existing item quantity", async () => {
      const mockUser = {
        _id: "test-user-id",
        cartData: { "test-item-id": 2 },
      };

      userModel.findById.mockResolvedValue(mockUser);
      userModel.findByIdAndUpdate.mockResolvedValue(mockUser);

      await addToCart(mockReq, mockRes);

      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith("test-user-id", {
        cartData: { "test-item-id": 3 },
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Added To Cart",
      });
    });

    it("should handle database errors", async () => {
      userModel.findById.mockRejectedValue(new Error("Database error"));

      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      await addToCart(mockReq, mockRes);

      expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Error",
      });

      consoleSpy.mockRestore();
    });

    /*  it("should handle case when user not found", async () => {
      userModel.findById.mockResolvedValue(null);

      await expect(addToCart(mockReq, mockRes)).rejects.toThrow();
    }); */
  });

  describe("removeFromCart", () => {
    it("should decrement item quantity when quantity > 0", async () => {
      const mockUser = {
        _id: "test-user-id",
        cartData: { "test-item-id": 2 },
      };

      userModel.findById.mockResolvedValue(mockUser);
      userModel.findByIdAndUpdate.mockResolvedValue(mockUser);

      await removeFromCart(mockReq, mockRes);

      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith("test-user-id", {
        cartData: { "test-item-id": 1 },
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Removed From Cart",
      });
    });

    it("should not decrement when quantity is 0", async () => {
      const mockUser = {
        _id: "test-user-id",
        cartData: { "test-item-id": 0 },
      };

      userModel.findById.mockResolvedValue(mockUser);
      userModel.findByIdAndUpdate.mockResolvedValue(mockUser);

      await removeFromCart(mockReq, mockRes);

      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith("test-user-id", {
        cartData: { "test-item-id": 0 },
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Removed From Cart",
      });
    });

    it("should handle item not in cart", async () => {
      const mockUser = {
        _id: "test-user-id",
        cartData: {},
      };

      userModel.findById.mockResolvedValue(mockUser);
      userModel.findByIdAndUpdate.mockResolvedValue(mockUser);

      await removeFromCart(mockReq, mockRes);

      // When item doesn't exist, cartData[itemId] is undefined,
      // undefined > 0 is false, so no change should occur
      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith("test-user-id", {
        cartData: {},
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Removed From Cart",
      });
    });

    it("should handle database errors", async () => {
      userModel.findById.mockRejectedValue(new Error("Database error"));

      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      await removeFromCart(mockReq, mockRes);

      expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Error",
      });

      consoleSpy.mockRestore();
    });
  });

  describe("getCart", () => {
    it("should return user cart data", async () => {
      const mockUser = {
        _id: "test-user-id",
        cartData: {
          item1: 2,
          item2: 1,
          item3: 3,
        },
      };

      userModel.findById.mockResolvedValue(mockUser);

      await getCart(mockReq, mockRes);

      expect(userModel.findById).toHaveBeenCalledWith("test-user-id");
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        cartData: {
          item1: 2,
          item2: 1,
          item3: 3,
        },
      });
    });

    it("should return empty cart for new user", async () => {
      const mockUser = {
        _id: "test-user-id",
        cartData: {},
      };

      userModel.findById.mockResolvedValue(mockUser);

      await getCart(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        cartData: {},
      });
    });

    it("should handle database errors", async () => {
      userModel.findById.mockRejectedValue(new Error("Database error"));

      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      await getCart(mockReq, mockRes);

      expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Error",
      });

      consoleSpy.mockRestore();
    });

    it("should handle case when user not found", async () => {
      userModel.findById.mockResolvedValue(null);

      await expect(getCart(mockReq, mockRes)).rejects.toThrow();
    });
  });
});
