// __tests__/middleware/auth.test.js
import jwt from "jsonwebtoken";
import authMiddleware from "../../middleware/auth.js";

// Mock jwt
jest.mock("jsonwebtoken");

describe("Auth Middleware", () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      headers: {},
      body: {},
    };

    mockRes = {
      json: jest.fn(),
      status: jest.fn(() => mockRes),
    };

    mockNext = jest.fn();

    // Set up environment variable
    process.env.JWT_SECRET = "test-jwt-secret";

    jest.clearAllMocks();
  });

  describe("Token Validation", () => {
    it("should pass with valid token", async () => {
      const mockToken = "valid-jwt-token";
      const mockDecodedToken = {
        id: "user123",
        email: "test@example.com",
      };

      mockReq.headers.token = mockToken;
      jwt.verify.mockReturnValue(mockDecodedToken);

      await authMiddleware(mockReq, mockRes, mockNext);

      expect(jwt.verify).toHaveBeenCalledWith(mockToken, "test-jwt-secret");
      expect(mockReq.body.userId).toBe("user123");
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    it("should reject request when no token provided", async () => {
      // No token in headers
      mockReq.headers = {};

      await authMiddleware(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Not Authorized Login Again",
      });
      expect(mockNext).not.toHaveBeenCalled();
      expect(jwt.verify).not.toHaveBeenCalled();
    });

    it("should reject request with invalid token", async () => {
      const mockToken = "invalid-jwt-token";
      mockReq.headers.token = mockToken;

      jwt.verify.mockImplementation(() => {
        throw new Error("Invalid token");
      });

      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      await authMiddleware(mockReq, mockRes, mockNext);

      expect(jwt.verify).toHaveBeenCalledWith(mockToken, "test-jwt-secret");
      expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Error",
      });
      expect(mockNext).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it("should reject request with expired token", async () => {
      const mockToken = "expired-jwt-token";
      mockReq.headers.token = mockToken;

      jwt.verify.mockImplementation(() => {
        const error = new Error("Token expired");
        error.name = "TokenExpiredError";
        throw error;
      });

      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      await authMiddleware(mockReq, mockRes, mockNext);

      expect(jwt.verify).toHaveBeenCalledWith(mockToken, "test-jwt-secret");
      expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Error",
      });
      expect(mockNext).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it("should reject request with malformed token", async () => {
      const mockToken = "malformed.jwt.token";
      mockReq.headers.token = mockToken;

      jwt.verify.mockImplementation(() => {
        const error = new Error("Invalid token format");
        error.name = "JsonWebTokenError";
        throw error;
      });

      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      await authMiddleware(mockReq, mockRes, mockNext);

      expect(jwt.verify).toHaveBeenCalledWith(mockToken, "test-jwt-secret");
      expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Error",
      });
      expect(mockNext).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe("Token Extraction", () => {
    it("should handle token from headers.token", async () => {
      const mockToken = "valid-token";
      const mockDecodedToken = { id: "user123" };

      mockReq.headers.token = mockToken;
      jwt.verify.mockReturnValue(mockDecodedToken);

      await authMiddleware(mockReq, mockRes, mockNext);

      expect(jwt.verify).toHaveBeenCalledWith(mockToken, "test-jwt-secret");
      expect(mockReq.body.userId).toBe("user123");
      expect(mockNext).toHaveBeenCalled();
    });

    it("should handle empty string token", async () => {
      mockReq.headers.token = "";

      await authMiddleware(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Not Authorized Login Again",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should handle null token", async () => {
      mockReq.headers.token = null;

      await authMiddleware(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Not Authorized Login Again",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should handle undefined token", async () => {
      mockReq.headers.token = undefined;

      await authMiddleware(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Not Authorized Login Again",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("User ID Assignment", () => {
    it("should correctly assign userId to request body", async () => {
      const mockToken = "valid-token";
      const mockDecodedToken = { id: "specific-user-id" };

      mockReq.headers.token = mockToken;
      mockReq.body = { someOtherData: "test" };
      jwt.verify.mockReturnValue(mockDecodedToken);

      await authMiddleware(mockReq, mockRes, mockNext);

      expect(mockReq.body.userId).toBe("specific-user-id");
      expect(mockReq.body.someOtherData).toBe("test");
      expect(mockNext).toHaveBeenCalled();
    });

    it("should overwrite existing userId in request body", async () => {
      const mockToken = "valid-token";
      const mockDecodedToken = { id: "correct-user-id" };

      mockReq.headers.token = mockToken;
      mockReq.body = { userId: "wrong-user-id" };
      jwt.verify.mockReturnValue(mockDecodedToken);

      await authMiddleware(mockReq, mockRes, mockNext);

      expect(mockReq.body.userId).toBe("correct-user-id");
      expect(mockNext).toHaveBeenCalled();
    });
  });
});
