import axios from "axios";
import orderModel from "../models/orderModels.js";
import userModel from "../models/userModels.js";
import dotenv from "dotenv";

dotenv.config();

const frontend_url = process.env.FRONTEND_URL || "http://localhost:5173";

// Axios instance for Paystack
const paystack = axios.create({
  baseURL: "https://api.paystack.co",
  headers: {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    "Content-Type": "application/json",
  },
});

// Place Order
const placeOrder = async (req, res) => {
  try {
    const { userId, items, amount, address } = req.body;

    // Get user email from database
    const user = await userModel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Save order in DB with pending status
    const newOrder = new orderModel({
      userId,
      items,
      amount,
      address,
      status: "pending",
      payment: false,
    });
    await newOrder.save();

    // Clear user's cart
    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    // Initialize Paystack transaction
    const response = await paystack.post("/transaction/initialize", {
      email: user.email,
      amount: amount * 100, // Convert to kobo
      callback_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
      metadata: {
        orderId: newOrder._id.toString(),
        userId: userId,
        custom_fields: [
          {
            display_name: "Order ID",
            variable_name: "order_id",
            value: newOrder._id.toString(),
          },
        ],
      },
    });

    res.json({
      success: true,
      authorization_url: response.data.data.authorization_url,
      access_code: response.data.data.access_code,
      reference: response.data.data.reference,
    });
  } catch (error) {
    console.error(
      "Error placing order:",
      error?.response?.data || error.message
    );
    res.status(500).json({
      success: false,
      message: "Error placing order",
      error: error?.response?.data || error.message,
    });
  }
};

// Verify Payment
const verifyPayment = async (req, res) => {
  try {
    const { orderId, success } = req.body;

    if (success === "true") {
      // Find the order
      const order = await orderModel.findById(orderId);
      if (!order) {
        return res
          .status(404)
          .json({ success: false, message: "Order not found" });
      }

      // Verify transaction with Paystack
      const response = await paystack.get(
        `/transaction/verify/${order.reference || req.body.reference}`
      );

      if (response.data.data.status === "success") {
        // Update order status
        await orderModel.findByIdAndUpdate(orderId, {
          payment: true,
          status: "confirmed",
        });

        return res.json({
          success: true,
          message: "Payment verified successfully",
        });
      } else {
        // Payment failed
        await orderModel.findByIdAndUpdate(orderId, {
          status: "failed",
        });
        return res.json({
          success: false,
          message: "Payment verification failed",
        });
      }
    } else {
      // Payment was cancelled or failed
      await orderModel.findByIdAndUpdate(orderId, {
        status: "cancelled",
      });
      return res.json({ success: false, message: "Payment was cancelled" });
    }
  } catch (error) {
    console.error(
      "Error verifying payment:",
      error?.response?.data || error.message
    );
    res.status(500).json({
      success: false,
      message: "Error verifying payment",
    });
  }
};

// Get user orders
const userOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ userId: req.body.userId });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error fetching orders" });
  }
};

// List all orders (admin)
const listOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    res.json({ success: true, data: orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error fetching orders" });
  }
};

// Update order status
const updateStatus = async (req, res) => {
  try {
    await orderModel.findByIdAndUpdate(req.body.orderId, {
      status: req.body.status,
    });
    res.json({ success: true, message: "Status updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error updating status" });
  }
};

export { placeOrder, verifyPayment, userOrders, listOrders, updateStatus };
