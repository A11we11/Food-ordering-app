// __tests__/models/orderModel.test.js
import mongoose from "mongoose";

import { MongoMemoryServer } from "mongodb-memory-server";

import orderModel from "../../models/orderModel.js";

let mongoServer;

describe("Order Model", () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await orderModel.deleteMany({});
  });

  describe("Order Schema Validation", () => {
    it("should create a valid order with required fields", async () => {
      const orderData = {
        userId: "64f5a1b2c3d4e5f6a7b8c9d0",
        items: [{ id: "item1", name: "Pizza", quantity: 2, price: 15.99 }],
        amount: 31.98,
        address: {
          street: "123 Main St",
          city: "New York",
          zipCode: "10001",
        },
      };

      const order = new orderModel(orderData);
      const savedOrder = await order.save();

      expect(savedOrder._id).toBeDefined();
      expect(savedOrder.userId).toBe(orderData.userId);
      expect(savedOrder.items).toEqual(orderData.items);
      expect(savedOrder.amount).toBe(orderData.amount);
      expect(savedOrder.address).toEqual(orderData.address);
      expect(savedOrder.status).toBe("Food Processing"); // default value
      expect(savedOrder.payment).toBe(false); // default value
      expect(savedOrder.date).toBeDefined();
    });

    it("should fail validation without required userId", async () => {
      const orderData = {
        items: [{ id: "item1", name: "Pizza" }],
        amount: 15.99,
        address: { street: "123 Main St" },
      };

      const order = new orderModel(orderData);

      await expect(order.save()).rejects.toThrow();
    });

    it("should fail validation without required items", async () => {
      const orderData = {
        userId: "64f5a1b2c3d4e5f6a7b8c9d0",
        amount: 15.99,
        address: { street: "123 Main St" },
      };

      const order = new orderModel(orderData);

      await expect(order.save()).rejects.toThrow();
    });

    it("should fail validation without required amount", async () => {
      const orderData = {
        userId: "64f5a1b2c3d4e5f6a7b8c9d0",
        items: [{ id: "item1", name: "Pizza" }],
        address: { street: "123 Main St" },
      };

      const order = new orderModel(orderData);

      await expect(order.save()).rejects.toThrow();
    });

    it("should fail validation without required address", async () => {
      const orderData = {
        userId: "64f5a1b2c3d4e5f6a7b8c9d0",
        items: [{ id: "item1", name: "Pizza" }],
        amount: 15.99,
      };

      const order = new orderModel(orderData);

      await expect(order.save()).rejects.toThrow();
    });
  });

  describe("Order Default Values", () => {
    it('should set default status to "Food Processing"', async () => {
      const orderData = {
        userId: "64f5a1b2c3d4e5f6a7b8c9d0",
        items: [{ id: "item1" }],
        amount: 15.99,
        address: { street: "123 Main St" },
      };

      const order = new orderModel(orderData);
      const savedOrder = await order.save();

      expect(savedOrder.status).toBe("Food Processing");
    });

    it("should set default payment to false", async () => {
      const orderData = {
        userId: "64f5a1b2c3d4e5f6a7b8c9d0",
        items: [{ id: "item1" }],
        amount: 15.99,
        address: { street: "123 Main St" },
      };

      const order = new orderModel(orderData);
      const savedOrder = await order.save();

      expect(savedOrder.payment).toBe(false);
    });

    it("should set date to current time by default", async () => {
      const beforeCreate = new Date();

      const orderData = {
        userId: "64f5a1b2c3d4e5f6a7b8c9d0",
        items: [{ id: "item1" }],
        amount: 15.99,
        address: { street: "123 Main St" },
      };

      const order = new orderModel(orderData);
      const savedOrder = await order.save();
      const afterCreate = new Date();

      expect(savedOrder.date).toBeInstanceOf(Date);
      expect(savedOrder.date.getTime()).toBeGreaterThanOrEqual(
        beforeCreate.getTime()
      );
      expect(savedOrder.date.getTime()).toBeLessThanOrEqual(
        afterCreate.getTime()
      );
    });
  });

  describe("Order Custom Values", () => {
    it("should accept custom status value", async () => {
      const orderData = {
        userId: "64f5a1b2c3d4e5f6a7b8c9d0",
        items: [{ id: "item1" }],
        amount: 15.99,
        address: { street: "123 Main St" },
        status: "confirmed",
      };

      const order = new orderModel(orderData);
      const savedOrder = await order.save();

      expect(savedOrder.status).toBe("confirmed");
    });

    it("should accept custom payment value", async () => {
      const orderData = {
        userId: "64f5a1b2c3d4e5f6a7b8c9d0",
        items: [{ id: "item1" }],
        amount: 15.99,
        address: { street: "123 Main St" },
        payment: true,
      };

      const order = new orderModel(orderData);
      const savedOrder = await order.save();

      expect(savedOrder.payment).toBe(true);
    });

    it("should accept reference field", async () => {
      const orderData = {
        userId: "64f5a1b2c3d4e5f6a7b8c9d0",
        items: [{ id: "item1" }],
        amount: 15.99,
        address: { street: "123 Main St" },
        reference: "PAYSTACK_REF_123456789",
      };

      const order = new orderModel(orderData);
      const savedOrder = await order.save();

      expect(savedOrder.reference).toBe("PAYSTACK_REF_123456789");
    });
  });
});
