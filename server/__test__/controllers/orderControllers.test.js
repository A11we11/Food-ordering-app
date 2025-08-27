import request from "supertest";
import express from "express";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import axios from "axios";
import {
  placeOrder,
  verifyPayment,
  userOrders,
  listOrders,
  updateStatus,
} from "../../controllers/orderController.js";
import orderModel from "../../models/orderModels.js";
import userModel from "../../models/userModels.js";

// Mock axios
jest.mock("axios");
const mockedAxios = axios;

// Create Express app for testing
const app = express();
app.use(express.json());

// Setup routes
app.post("/place-order", placeOrder);
app.post("/verify-payment", verifyPayment);
app.post("/user-orders", userOrders);
app.get("/list-orders", listOrders);
app.put("/update-status", updateStatus);

describe("Order Controller Tests", () => {
  let mongoServer;
  let testUserId;
  let testOrderId;

  beforeAll(async () => {
    // Start in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    // Set up environment variables
    process.env.PAYSTACK_SECRET_KEY = "sk_test_mock_key";
    process.env.FRONTEND_URL = "http://localhost:5173";
    process.env.JWT_SECRET = "test_secret";
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clear database
    await orderModel.deleteMany({});
    await userModel.deleteMany({});

    // Create test user
    const testUser = new userModel({
      name: "Test User",
      email: "test@example.com",
      password: "hashedpassword",
      cartData: { item1: 2, item2: 1 },
    });
    const savedUser = await testUser.save();
    testUserId = savedUser._id.toString();

    // Mock axios create method
    mockedAxios.create = jest.fn().mockReturnValue({
      post: jest.fn(),
      get: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /place-order", () => {
    it("should successfully place an order", async () => {
      const mockPaystackResponse = {
        data: {
          data: {
            authorization_url: "https://checkout.paystack.com/mock-url",
            access_code: "mock_access_code",
            reference: "mock_reference",
          },
        },
      };

      const mockPaystack = {
        post: jest.fn().mockResolvedValue(mockPaystackResponse),
      };
      mockedAxios.create.mockReturnValue(mockPaystack);

      const orderData = {
        userId: testUserId,
        items: [
          { id: "item1", name: "Pizza", quantity: 2, price: 15.99 },
          { id: "item2", name: "Burger", quantity: 1, price: 8.99 },
        ],
        amount: 40.97,
        address: {
          street: "123 Test St",
          city: "Test City",
          zipCode: "12345",
        },
      };

      const response = await request(app).post("/place-order").send(orderData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.authorization_url).toBe(
        "https://checkout.paystack.com/mock-url"
      );
      expect(response.body.access_code).toBe("mock_access_code");
      expect(response.body.reference).toBe("mock_reference");

      // Verify order was saved in database
      const savedOrder = await orderModel.findOne({ userId: testUserId });
      expect(savedOrder).toBeTruthy();
      expect(savedOrder.amount).toBe(40.97);
      expect(savedOrder.status).toBe("pending");
      expect(savedOrder.payment).toBe(false);

      // Verify user's cart was cleared
      const updatedUser = await userModel.findById(testUserId);
      expect(updatedUser.cartData).toEqual({});

      // Verify Paystack was called with correct parameters
      expect(mockPaystack.post).toHaveBeenCalledWith(
        "/transaction/initialize",
        {
          email: "test@example.com",
          amount: 4097, // amount * 100
          callback_url: expect.stringContaining(
            "/verify?success=true&orderId="
          ),
          cancel_url: expect.stringContaining("/verify?success=false&orderId="),
          metadata: expect.objectContaining({
            userId: testUserId,
            custom_fields: expect.arrayContaining([
              expect.objectContaining({
                display_name: "Order ID",
                variable_name: "order_id",
              }),
            ]),
          }),
        }
      );
    });

    it("should return error if user not found", async () => {
      const orderData = {
        userId: new mongoose.Types.ObjectId().toString(),
        items: [{ id: "item1", name: "Pizza", quantity: 1, price: 15.99 }],
        amount: 15.99,
        address: { street: "123 Test St" },
      };

      const response = await request(app).post("/place-order").send(orderData);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("User not found");
    });

    it("should handle Paystack API error", async () => {
      const mockPaystack = {
        post: jest.fn().mockRejectedValue({
          response: {
            data: { message: "Paystack API error" },
          },
        }),
      };
      mockedAxios.create.mockReturnValue(mockPaystack);

      const orderData = {
        userId: testUserId,
        items: [{ id: "item1", name: "Pizza", quantity: 1, price: 15.99 }],
        amount: 15.99,
        address: { street: "123 Test St" },
      };

      const response = await request(app).post("/place-order").send(orderData);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Error placing order");
    });
  });

  describe("POST /verify-payment", () => {
    beforeEach(async () => {
      // Create test order
      const testOrder = new orderModel({
        userId: testUserId,
        items: [{ id: "item1", name: "Pizza", quantity: 1, price: 15.99 }],
        amount: 15.99,
        address: { street: "123 Test St" },
        status: "pending",
        payment: false,
        reference: "mock_reference",
      });
      const savedOrder = await testOrder.save();
      testOrderId = savedOrder._id.toString();
    });

    it("should verify successful payment", async () => {
      const mockPaystackResponse = {
        data: {
          data: {
            status: "success",
            reference: "mock_reference",
          },
        },
      };

      const mockPaystack = {
        get: jest.fn().mockResolvedValue(mockPaystackResponse),
      };
      mockedAxios.create.mockReturnValue(mockPaystack);

      const response = await request(app).post("/verify-payment").send({
        orderId: testOrderId,
        success: "true",
        reference: "mock_reference",
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Payment verified successfully");

      // Verify order was updated
      const updatedOrder = await orderModel.findById(testOrderId);
      expect(updatedOrder.payment).toBe(true);
      expect(updatedOrder.status).toBe("confirmed");
    });

    it("should handle failed payment verification", async () => {
      const mockPaystackResponse = {
        data: {
          data: {
            status: "failed",
            reference: "mock_reference",
          },
        },
      };

      const mockPaystack = {
        get: jest.fn().mockResolvedValue(mockPaystackResponse),
      };
      mockedAxios.create.mockReturnValue(mockPaystack);

      const response = await request(app).post("/verify-payment").send({
        orderId: testOrderId,
        success: "true",
        reference: "mock_reference",
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Payment verification failed");

      // Verify order status was updated to failed
      const updatedOrder = await orderModel.findById(testOrderId);
      expect(updatedOrder.status).toBe("failed");
    });

    it("should handle cancelled payment", async () => {
      const response = await request(app).post("/verify-payment").send({
        orderId: testOrderId,
        success: "false",
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Payment was cancelled");

      // Verify order status was updated to cancelled
      const updatedOrder = await orderModel.findById(testOrderId);
      expect(updatedOrder.status).toBe("cancelled");
    });

    it("should return error if order not found", async () => {
      const nonExistentOrderId = new mongoose.Types.ObjectId().toString();

      const response = await request(app).post("/verify-payment").send({
        orderId: nonExistentOrderId,
        success: "true",
      });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Order not found");
    });
  });

  describe("POST /user-orders", () => {
    it("should fetch user orders successfully", async () => {
      // Create multiple orders for the user
      await orderModel.create([
        {
          userId: testUserId,
          items: [{ id: "item1", name: "Pizza", quantity: 1, price: 15.99 }],
          amount: 15.99,
          address: { street: "123 Test St" },
          status: "confirmed",
          payment: true,
        },
        {
          userId: testUserId,
          items: [{ id: "item2", name: "Burger", quantity: 2, price: 8.99 }],
          amount: 17.98,
          address: { street: "456 Test Ave" },
          status: "pending",
          payment: false,
        },
      ]);

      const response = await request(app)
        .post("/user-orders")
        .send({ userId: testUserId });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].userId).toBe(testUserId);
      expect(response.body.data[1].userId).toBe(testUserId);
    });

    it("should return empty array for user with no orders", async () => {
      const newUserId = new mongoose.Types.ObjectId().toString();

      const response = await request(app)
        .post("/user-orders")
        .send({ userId: newUserId });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(0);
    });
  });

  describe("GET /list-orders", () => {
    it("should fetch all orders successfully", async () => {
      // Create orders for multiple users
      const anotherUserId = new mongoose.Types.ObjectId().toString();
      await orderModel.create([
        {
          userId: testUserId,
          items: [{ id: "item1", name: "Pizza", quantity: 1, price: 15.99 }],
          amount: 15.99,
          address: { street: "123 Test St" },
          status: "confirmed",
          payment: true,
        },
        {
          userId: anotherUserId,
          items: [{ id: "item2", name: "Burger", quantity: 1, price: 8.99 }],
          amount: 8.99,
          address: { street: "456 Test Ave" },
          status: "pending",
          payment: false,
        },
      ]);

      const response = await request(app).get("/list-orders");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it("should return empty array when no orders exist", async () => {
      const response = await request(app).get("/list-orders");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(0);
    });
  });

  describe("PUT /update-status", () => {
    beforeEach(async () => {
      // Create test order
      const testOrder = new orderModel({
        userId: testUserId,
        items: [{ id: "item1", name: "Pizza", quantity: 1, price: 15.99 }],
        amount: 15.99,
        address: { street: "123 Test St" },
        status: "pending",
        payment: false,
      });
      const savedOrder = await testOrder.save();
      testOrderId = savedOrder._id.toString();
    });

    it("should update order status successfully", async () => {
      const response = await request(app).put("/update-status").send({
        orderId: testOrderId,
        status: "delivered",
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Status updated");

      // Verify order status was updated
      const updatedOrder = await orderModel.findById(testOrderId);
      expect(updatedOrder.status).toBe("delivered");
    });

    it("should handle non-existent order ID", async () => {
      const nonExistentOrderId = new mongoose.Types.ObjectId().toString();

      const response = await request(app).put("/update-status").send({
        orderId: nonExistentOrderId,
        status: "delivered",
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Status updated");
    });
  });
});
