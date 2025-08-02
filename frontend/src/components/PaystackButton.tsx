/* import React from "react";
import axios from "axios";

interface PaystackButtonProps {
  email: string;
  amount: number; // in Naira
  onSuccess?: (data: any) => void;
}

const paystackPublicKey =
  import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "YOUR_PUBLIC_KEY";

const PaystackButton: React.FC<PaystackButtonProps> = ({
  email,
  amount,
  onSuccess,
}) => {
  const handlePaystack = () => {
    const handler = (window as any).PaystackPop.setup({
      key: paystackPublicKey,
      email,
      amount: amount * 100, // Paystack expects amount in Kobo
      currency: "NGN",
      callback: async (response: any) => {
        // Send reference to backend for verification
        try {
          const res = await axios.post("/api/paystack/verify", {
            reference: response.reference,
          });
          if (onSuccess) onSuccess(res.data);
          alert("Payment successful!");
        } catch (err) {
          alert("Payment verification failed");
        }
      },
      onClose: () => {
        alert("Payment window closed");
      },
    });
    handler.openIframe();
  };

  return (
    <button
      onClick={handlePaystack}
      style={{
        padding: "10px 20px",
        background: "#08a05c",
        color: "#fff",
        border: "none",
        borderRadius: "5px",
      }}
    >
      Pay with Paystack
    </button>
  );
};

export default PaystackButton;
 */
