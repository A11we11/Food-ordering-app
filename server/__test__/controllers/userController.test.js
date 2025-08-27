import request from "supertest";
import express from "express";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { loginUser, registerUser } from "../../controllers/userController.js";
import userModel from "../../models/userModels.js";

// Mock jwt
jest.mock("jsonwebtoken");
const mockedJwt = jwt;

// Create Express app for testing
const app = express();
app.use(express.json());

// Setup routes
app.post("/login", loginUser);
app.post("/register", registerUser);

describe("User Controller Tests", () => {
  let mongoServer;

  beforeAll(async () => {
    // Start in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    // Set up environment variables
    process.env.JWT_SECRET = "test_jwt_secret";
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clear database
    await userModel.deleteMany({});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /register", () => {
    beforeEach(() => {
      // Mock JWT sign method
      mockedJwt.sign = jest.fn().mockReturnValue("mock_jwt_token");
    });

    it("should register a new user successfully", async () => {
      const userData = {
        name: "John Doe",
        email: "john@example.com",
        password: "strongpassword123",
      };

      const response = await request(app).post("/register").send(userData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBe("mock_jwt_token");

      // Verify user was saved in database
      const savedUser = await userModel.findOne({ email: userData.email });
      expect(savedUser).toBeTruthy();
      expect(savedUser.name).toBe(userData.name);
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.cartData).toEqual({});

      // Verify password was hashed
      expect(savedUser.password).not.toBe(userData.password);
      const passwordMatch = await bcrypt.compare(
        userData.password,
        savedUser.password
      );
      expect(passwordMatch).toBe(true);

      // Verify JWT was created with correct user ID
      expect(mockedJwt.sign).toHaveBeenCalledWith(
        { id: savedUser._id },
        process.env.JWT_SECRET
      );
    });

    it("should return error if user already exists", async () => {
      // Create existing user
      const existingUser = new userModel({
        name: "Existing User",
        email: "existing@example.com",
        password: await bcrypt.hash("password123", 10),
      });
      await existingUser.save();

      const userData = {
        name: "New User",
        email: "existing@example.com", // Same email
        password: "newpassword123",
      };

      const response = await request(app).post("/register").send(userData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("User already exists");

      // Verify JWT was not called
      expect(mockedJwt.sign).not.toHaveBeenCalled();
    });

    it("should return error for invalid email format", async () => {
      const userData = {
        name: "John Doe",
        email: "invalid-email", // Invalid email
        password: "strongpassword123",
      };

      const response = await request(app).post("/register").send(userData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Please enter a valid email");

      // Verify user was not saved
      const savedUser = await userModel.findOne({ email: userData.email });
      expect(savedUser).toBeNull();
    });

    it("should return error for weak password", async () => {
      const userData = {
        name: "John Doe",
        email: "john@example.com",
        password: "weak", // Too short
      };

      const response = await request(app).post("/register").send(userData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Please enter a strong password");

      // Verify user was not saved
      const savedUser = await userModel.findOne({ email: userData.email });
      expect(savedUser).toBeNull();
    });

    it("should handle database save error", async () => {
      // Mock userModel save to throw error
      const originalSave = userModel.prototype.save;
      userModel.prototype.save = jest
        .fn()
        .mockRejectedValue(new Error("Database error"));

      const userData = {
        name: "John Doe",
        email: "john@example.com",
        password: "strongpassword123",
      };

      const response = await request(app).post("/register").send(userData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Error");

      // Restore original save method
      userModel.prototype.save = originalSave;
    });

    it("should handle missing required fields", async () => {
      const testCases = [
        { name: "John Doe", email: "john@example.com" }, // Missing password
        { name: "John Doe", password: "password123" }, // Missing email
        { email: "john@example.com", password: "password123" }, // Missing name
      ];

      for (let testCase of testCases) {
        const response = await request(app).post("/register").send(testCase);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Error");
      }
    });

    it("should validate email formats correctly", async () => {
      const invalidEmails = [
        "plainaddress",
        "@missingdomain.com",
        "missing@.com",
        "missing@domain",
        "spaces @domain.com",
        "double@@domain.com",
      ];

      for (let email of invalidEmails) {
        const userData = {
          name: "Test User",
          email: email,
          password: "strongpassword123",
        };

        const response = await request(app).post("/register").send(userData);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Please enter a valid email");
      }
    });

    it("should accept valid email formats", async () => {
      const validEmails = [
        "user@domain.com",
        "user.name@domain.com",
        "user+tag@domain.co.uk",
        "user123@domain123.com",
      ];

      for (let email of validEmails) {
        // Clear database for each test
        await userModel.deleteMany({});

        const userData = {
          name: "Test User",
          email: email,
          password: "strongpassword123",
        };

        const response = await request(app).post("/register").send(userData);

        expect(response.body.success).toBe(true);
        expect(response.body.token).toBe("mock_jwt_token");
      }
    });
  });

  describe("POST /login", () => {
    let testUser;
    let testUserId;

    beforeEach(async () => {
      // Mock JWT sign method
      mockedJwt.sign = jest.fn().mockReturnValue("mock_login_token");

      // Create test user
      const hashedPassword = await bcrypt.hash("testpassword123", 10);
      testUser = new userModel({
        name: "Test User",
        email: "test@example.com",
        password: hashedPassword,
      });
      const savedUser = await testUser.save();
      testUserId = savedUser._id;
    });

    it("should login user successfully with correct credentials", async () => {
      const loginData = {
        email: "test@example.com",
        password: "testpassword123",
      };

      const response = await request(app).post("/login").send(loginData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBe("mock_login_token");

      // Verify JWT was created with correct user ID
      expect(mockedJwt.sign).toHaveBeenCalledWith(
        { id: testUserId },
        process.env.JWT_SECRET
      );
    });

    it("should return error for non-existent user", async () => {
      const loginData = {
        email: "nonexistent@example.com",
        password: "testpassword123",
      };

      const response = await request(app).post("/login").send(loginData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("User Dosen't exist");

      // Verify JWT was not called
      expect(mockedJwt.sign).not.toHaveBeenCalled();
    });

    it("should return error for incorrect password", async () => {
      const loginData = {
        email: "test@example.com",
        password: "wrongpassword",
      };

      const response = await request(app).post("/login").send(loginData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("invalid");

      // Verify JWT was not called
      expect(mockedJwt.sign).not.toHaveBeenCalled();
    });

    it("should handle missing email field", async () => {
      const loginData = {
        password: "testpassword123",
      };

      const response = await request(app).post("/login").send(loginData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Error");
    });

    it("should handle missing password field", async () => {
      const loginData = {
        email: "test@example.com",
      };

      const response = await request(app).post("/login").send(loginData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Error");
    });

    it("should handle database query error", async () => {
      // Mock userModel.findOne to throw error
      const originalFindOne = userModel.findOne;
      userModel.findOne = jest
        .fn()
        .mockRejectedValue(new Error("Database error"));

      const loginData = {
        email: "test@example.com",
        password: "testpassword123",
      };

      const response = await request(app).post("/login").send(loginData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Error");

      // Restore original method
      userModel.findOne = originalFindOne;
    });

    it("should handle bcrypt comparison error", async () => {
      // Mock bcrypt.compare to throw error
      const originalCompare = bcrypt.compare;
      bcrypt.compare = jest.fn().mockRejectedValue(new Error("Bcrypt error"));

      const loginData = {
        email: "test@example.com",
        password: "testpassword123",
      };

      const response = await request(app).post("/login").send(loginData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Error");

      // Restore original method
      bcrypt.compare = originalCompare;
    });

    it("should be case sensitive for email", async () => {
      const loginData = {
        email: "TEST@EXAMPLE.COM", // Different case
        password: "testpassword123",
      };

      const response = await request(app).post("/login").send(loginData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("User Dosen't exist");
    });

    it("should handle empty request body", async () => {
      const response = await request(app).post("/login").send({});

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Error");
    });
  });

  describe("Integration Tests", () => {
    beforeEach(() => {
      mockedJwt.sign = jest
        .fn()
        .mockReturnValueOnce("register_token")
        .mockReturnValueOnce("login_token");
    });

    it("should register a user and then login successfully", async () => {
      const userData = {
        name: "Integration Test User",
        email: "integration@example.com",
        password: "integrationpassword123",
      };

      // Register user
      const registerResponse = await request(app)
        .post("/register")
        .send(userData);

      expect(registerResponse.status).toBe(200);
      expect(registerResponse.body.success).toBe(true);
      expect(registerResponse.body.token).toBe("register_token");

      // Login with same credentials
      const loginResponse = await request(app).post("/login").send({
        email: userData.email,
        password: userData.password,
      });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.success).toBe(true);
      expect(loginResponse.body.token).toBe("login_token");

      // Verify JWT was called twice (once for register, once for login)
      expect(mockedJwt.sign).toHaveBeenCalledTimes(2);
    });

    it("should not allow duplicate registrations", async () => {
      const userData = {
        name: "Duplicate Test User",
        email: "duplicate@example.com",
        password: "duplicatepassword123",
      };

      // First registration
      const firstResponse = await request(app).post("/register").send(userData);

      expect(firstResponse.body.success).toBe(true);

      // Second registration with same email
      const secondResponse = await request(app)
        .post("/register")
        .send({
          ...userData,
          name: "Different Name", // Different name but same email
        });

      expect(secondResponse.body.success).toBe(false);
      expect(secondResponse.body.message).toBe("User already exists");

      // Verify only one user exists in database
      const users = await userModel.find({ email: userData.email });
      expect(users).toHaveLength(1);
    });

    it("should maintain password security throughout register/login flow", async () => {
      const userData = {
        name: "Security Test User",
        email: "security@example.com",
        password: "securitytestpassword123",
      };

      // Register user
      await request(app).post("/register").send(userData);

      // Verify password is hashed in database
      const savedUser = await userModel.findOne({ email: userData.email });
      expect(savedUser.password).not.toBe(userData.password);
      expect(savedUser.password).toMatch(/^\$2b\$/); // bcrypt hash format

      // Verify login works with original password
      const loginResponse = await request(app).post("/login").send({
        email: userData.email,
        password: userData.password,
      });

      expect(loginResponse.body.success).toBe(true);

      // Verify login fails with hashed password
      const failedLoginResponse = await request(app).post("/login").send({
        email: userData.email,
        password: savedUser.password, // Using hashed password
      });

      expect(failedLoginResponse.body.success).toBe(false);
      expect(failedLoginResponse.body.message).toBe("invalid");
    });
  });

  describe("Password Security Tests", () => {
    it("should accept passwords of exactly 8 characters", async () => {
      mockedJwt.sign = jest.fn().mockReturnValue("test_token");

      const userData = {
        name: "Test User",
        email: "test8chars@example.com",
        password: "12345678", // Exactly 8 characters
      };

      const response = await request(app).post("/register").send(userData);

      expect(response.body.success).toBe(true);
    });

    it("should reject passwords shorter than 8 characters", async () => {
      const shortPasswords = ["1234567", "abc", "1", ""];

      for (let password of shortPasswords) {
        const userData = {
          name: "Test User",
          email: `test${password.length}@example.com`,
          password: password,
        };

        const response = await request(app).post("/register").send(userData);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Please enter a strong password");
      }
    });

    it("should accept long passwords", async () => {
      mockedJwt.sign = jest.fn().mockReturnValue("test_token");

      const userData = {
        name: "Test User",
        email: "testlong@example.com",
        password:
          "this_is_a_very_long_password_with_more_than_50_characters_to_test_maximum_length_handling",
      };

      const response = await request(app).post("/register").send(userData);

      expect(response.body.success).toBe(true);
    });
  });
});
