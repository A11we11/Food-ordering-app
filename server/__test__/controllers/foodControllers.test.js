import request from "supertest";
import express from "express";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  addFood,
  listFood,
  removeFood,
} from "../../controllers/foodController.js";
import foodModel from "../../models/foodModel.js";

// Mock fs module
jest.mock("fs");
const mockedFs = fs;

// Create Express app for testing
const app = express();
app.use(express.json());

// Setup multer for file uploads (for testing)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Setup routes
app.post("/add-food", upload.single("image"), addFood);
app.get("/list-food", listFood);
app.post("/remove-food", removeFood);

describe("Food Controller Tests", () => {
  let mongoServer;

  beforeAll(async () => {
    // Start in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clear database
    await foodModel.deleteMany({});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /add-food", () => {
    it("should add a food item successfully", async () => {
      const foodData = {
        name: "Margherita Pizza",
        description:
          "Classic pizza with tomato sauce, mozzarella cheese, and basil",
        price: "15.99",
        category: "Pizza",
      };

      // Create a mock file buffer
      const mockFile = Buffer.from("fake image data");

      const response = await request(app)
        .post("/add-food")
        .field("name", foodData.name)
        .field("description", foodData.description)
        .field("price", foodData.price)
        .field("category", foodData.category)
        .attach("image", mockFile, "test-image.jpg");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Food Added");

      // Verify food was saved in database
      const savedFood = await foodModel.findOne({ name: foodData.name });
      expect(savedFood).toBeTruthy();
      expect(savedFood.name).toBe(foodData.name);
      expect(savedFood.description).toBe(foodData.description);
      expect(savedFood.price).toBe(foodData.price);
      expect(savedFood.category).toBe(foodData.category);
      expect(savedFood.image).toMatch(/test-image\.jpg$/);
    });

    it("should handle missing required fields", async () => {
      // Test without name field
      const response = await request(app)
        .post("/add-food")
        .field("description", "Test description")
        .field("price", "10.99")
        .field("category", "Test")
        .attach("image", Buffer.from("fake image"), "test.jpg");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Error");
    });

    it("should handle missing image file", async () => {
      const foodData = {
        name: "Test Food",
        description: "Test description",
        price: "10.99",
        category: "Test",
      };

      // Make request without image file
      const response = await request(app).post("/add-food").send(foodData);

      expect(response.status).toBe(500); // Will throw error due to req.file being undefined
    });

    it("should handle database save error", async () => {
      // Mock foodModel save to throw error
      const originalSave = foodModel.prototype.save;
      foodModel.prototype.save = jest
        .fn()
        .mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .post("/add-food")
        .field("name", "Test Food")
        .field("description", "Test description")
        .field("price", "10.99")
        .field("category", "Test")
        .attach("image", Buffer.from("fake image"), "test.jpg");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Error");

      // Restore original save method
      foodModel.prototype.save = originalSave;
    });
  });

  describe("GET /list-food", () => {
    it("should return all food items successfully", async () => {
      // Create test food items
      const testFoods = [
        {
          name: "Margherita Pizza",
          description: "Classic pizza with tomato sauce and mozzarella",
          price: "15.99",
          image: "pizza1.jpg",
          category: "Pizza",
        },
        {
          name: "Cheeseburger",
          description: "Juicy beef burger with cheese",
          price: "12.99",
          image: "burger1.jpg",
          category: "Burger",
        },
        {
          name: "Caesar Salad",
          description: "Fresh lettuce with caesar dressing",
          price: "8.99",
          image: "salad1.jpg",
          category: "Salad",
        },
      ];

      await foodModel.create(testFoods);

      const response = await request(app).get("/list-food");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);

      // Verify the returned data contains all created items
      const returnedNames = response.body.data.map((food) => food.name);
      expect(returnedNames).toContain("Margherita Pizza");
      expect(returnedNames).toContain("Cheeseburger");
      expect(returnedNames).toContain("Caesar Salad");
    });

    it("should return empty array when no food items exist", async () => {
      const response = await request(app).get("/list-food");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(0);
      expect(response.body.data).toEqual([]);
    });

    it("should handle database error", async () => {
      // Mock foodModel.find to throw error
      const originalFind = foodModel.find;
      foodModel.find = jest
        .fn()
        .mockRejectedValue(new Error("Database connection error"));

      const response = await request(app).get("/list-food");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Error");

      // Restore original method
      foodModel.find = originalFind;
    });

    it("should return food items with correct structure", async () => {
      const testFood = {
        name: "Test Pizza",
        description: "Test description",
        price: "10.99",
        image: "test.jpg",
        category: "Pizza",
      };

      await foodModel.create(testFood);

      const response = await request(app).get("/list-food");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);

      const returnedFood = response.body.data[0];
      expect(returnedFood).toHaveProperty("_id");
      expect(returnedFood).toHaveProperty("name", testFood.name);
      expect(returnedFood).toHaveProperty("description", testFood.description);
      expect(returnedFood).toHaveProperty("price", testFood.price);
      expect(returnedFood).toHaveProperty("image", testFood.image);
      expect(returnedFood).toHaveProperty("category", testFood.category);
    });
  });

  describe("POST /remove-food", () => {
    let testFoodId;
    let testFood;

    beforeEach(async () => {
      // Create test food item
      testFood = new foodModel({
        name: "Test Food",
        description: "Test description",
        price: "10.99",
        image: "test-image.jpg",
        category: "Test",
      });
      const savedFood = await testFood.save();
      testFoodId = savedFood._id.toString();
    });

    it("should remove food item successfully", async () => {
      // Mock fs.unlink to prevent actual file system operations
      mockedFs.unlink.mockImplementation((path, callback) => {
        callback();
      });

      const response = await request(app)
        .post("/remove-food")
        .send({ id: testFoodId });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Food Removed");

      // Verify food was deleted from database
      const deletedFood = await foodModel.findById(testFoodId);
      expect(deletedFood).toBeNull();

      // Verify fs.unlink was called to remove the image file
      expect(mockedFs.unlink).toHaveBeenCalledWith(
        "uploads/test-image.jpg",
        expect.any(Function)
      );
    });

    it("should handle non-existent food ID", async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();

      const response = await request(app)
        .post("/remove-food")
        .send({ id: nonExistentId });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Error");
    });

    it("should handle invalid food ID format", async () => {
      const response = await request(app)
        .post("/remove-food")
        .send({ id: "invalid-id" });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Error");
    });

    it("should handle database error during deletion", async () => {
      // Mock foodModel.findByIdAndDelete to throw error
      const originalDelete = foodModel.findByIdAndDelete;
      foodModel.findByIdAndDelete = jest
        .fn()
        .mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .post("/remove-food")
        .send({ id: testFoodId });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Error");

      // Restore original method
      foodModel.findByIdAndDelete = originalDelete;
    });

    it("should handle missing id in request body", async () => {
      const response = await request(app).post("/remove-food").send({});

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Error");
    });

    it("should still remove food even if file deletion fails", async () => {
      // Mock fs.unlink to simulate file deletion error
      mockedFs.unlink.mockImplementation((path, callback) => {
        callback(new Error("File not found"));
      });

      const response = await request(app)
        .post("/remove-food")
        .send({ id: testFoodId });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Food Removed");

      // Food should still be deleted from database
      const deletedFood = await foodModel.findById(testFoodId);
      expect(deletedFood).toBeNull();
    });
  });

  describe("Integration Tests", () => {
    it("should add and then remove a food item", async () => {
      // First, add a food item
      const addResponse = await request(app)
        .post("/add-food")
        .field("name", "Integration Test Food")
        .field("description", "Test food for integration test")
        .field("price", "20.99")
        .field("category", "Test")
        .attach("image", Buffer.from("fake image"), "integration-test.jpg");

      expect(addResponse.status).toBe(200);
      expect(addResponse.body.success).toBe(true);

      // Get the added food item
      const listResponse = await request(app).get("/list-food");
      expect(listResponse.body.data).toHaveLength(1);

      const addedFood = listResponse.body.data[0];
      expect(addedFood.name).toBe("Integration Test Food");

      // Now remove the food item
      mockedFs.unlink.mockImplementation((path, callback) => callback());

      const removeResponse = await request(app)
        .post("/remove-food")
        .send({ id: addedFood._id });

      expect(removeResponse.status).toBe(200);
      expect(removeResponse.body.success).toBe(true);

      // Verify it's been removed
      const finalListResponse = await request(app).get("/list-food");
      expect(finalListResponse.body.data).toHaveLength(0);
    });

    it("should list multiple food items correctly", async () => {
      // Add multiple food items
      const foods = [
        {
          name: "Pizza 1",
          description: "First pizza",
          price: "10.99",
          category: "Pizza",
        },
        {
          name: "Pizza 2",
          description: "Second pizza",
          price: "12.99",
          category: "Pizza",
        },
        {
          name: "Burger 1",
          description: "First burger",
          price: "8.99",
          category: "Burger",
        },
      ];

      for (let food of foods) {
        await request(app)
          .post("/add-food")
          .field("name", food.name)
          .field("description", food.description)
          .field("price", food.price)
          .field("category", food.category)
          .attach("image", Buffer.from("fake image"), `${food.name}.jpg`);
      }

      // List all foods
      const response = await request(app).get("/list-food");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);

      const names = response.body.data.map((food) => food.name);
      expect(names).toContain("Pizza 1");
      expect(names).toContain("Pizza 2");
      expect(names).toContain("Burger 1");
    });
  });
});
