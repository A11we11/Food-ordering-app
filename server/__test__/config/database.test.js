// __tests__/config/database.test.js
import mongoose from "mongoose";
import { connectDB } from "../../config/db.js";

// Mock mongoose
jest.mock("mongoose");

describe("Database Connection", () => {
  describe("connectDB function", () => {
    it("should connect to MongoDB successfully", async () => {
      // Mock successful connection
      mongoose.connect.mockResolvedValue();

      await connectDB();

      expect(mongoose.connect).toHaveBeenCalledWith(
        "mongodb://localhost:27017/test-db"
      );
      expect(console.log).toHaveBeenCalledWith("DB Connected");
    });

    it("should use MONGO_URI from environment variables", async () => {
      const customUri = "mongodb://custom-host:27017/custom-db";
      process.env.MONGO_URI = customUri;

      mongoose.connect.mockResolvedValue();

      await connectDB();

      expect(mongoose.connect).toHaveBeenCalledWith(customUri);
    });

    it("should handle connection errors", async () => {
      const connectionError = new Error("Failed to connect to MongoDB");
      mongoose.connect.mockRejectedValue(connectionError);

      await expect(connectDB()).rejects.toThrow("Failed to connect to MongoDB");
      expect(mongoose.connect).toHaveBeenCalledWith(
        "mongodb://localhost:27017/test-db"
      );
      expect(console.log).not.toHaveBeenCalledWith("DB Connected");
    });

    it("should handle missing MONGO_URI environment variable", async () => {
      delete process.env.MONGO_URI;

      mongoose.connect.mockResolvedValue();

      await connectDB();

      expect(mongoose.connect).toHaveBeenCalledWith(undefined);
    });

    it("should handle network timeout errors", async () => {
      const timeoutError = new Error("Connection timeout");
      timeoutError.name = "MongoNetworkTimeoutError";
      mongoose.connect.mockRejectedValue(timeoutError);

      await expect(connectDB()).rejects.toThrow("Connection timeout");
      expect(mongoose.connect).toHaveBeenCalled();
    });

    it("should handle authentication errors", async () => {
      const authError = new Error("Authentication failed");
      authError.name = "MongoAuthenticationError";
      mongoose.connect.mockRejectedValue(authError);

      await expect(connectDB()).rejects.toThrow("Authentication failed");
      expect(mongoose.connect).toHaveBeenCalled();
    });

    it("should handle server selection errors", async () => {
      const serverError = new Error("No servers available");
      serverError.name = "MongoServerSelectionError";
      mongoose.connect.mockRejectedValue(serverError);

      await expect(connectDB()).rejects.toThrow("No servers available");
      expect(mongoose.connect).toHaveBeenCalled();
    });
  });

  describe("Connection configuration", () => {
    it("should connect with default mongoose options", async () => {
      mongoose.connect.mockResolvedValue();

      await connectDB();

      // Verify that mongoose.connect was called with just the URI
      // (no additional options in the current implementation)
      expect(mongoose.connect).toHaveBeenCalledWith(expect.any(String));
      expect(mongoose.connect).toHaveBeenCalledTimes(1);
    });
  });

  describe("Environment handling", () => {
    it("should work with different environment URIs", async () => {
      const environments = [
        "mongodb://localhost:27017/development",
        "mongodb://localhost:27017/test",
        "mongodb://prod-server:27017/production",
        "mongodb+srv://user:pass@cluster.mongodb.net/app",
      ];

      for (const uri of environments) {
        jest.clearAllMocks();
        process.env.MONGO_URI = uri;
        mongoose.connect.mockResolvedValue();

        await connectDB();

        expect(mongoose.connect).toHaveBeenCalledWith(uri);
        expect(console.log).toHaveBeenCalledWith("DB Connected");
      }
    });

    it("should handle empty MONGO_URI", async () => {
      process.env.MONGO_URI = "";
      mongoose.connect.mockResolvedValue();

      await connectDB();

      expect(mongoose.connect).toHaveBeenCalledWith("");
    });
  });
});
