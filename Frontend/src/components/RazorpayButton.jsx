import React, { useState } from "react";
import loadRazorpay from "../utils/loadRazorpay";
import axios from "axios";

const API_BASE = import.meta.env.VITE_BASE_URL; 
const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;

export default function RazorpayButton({ user, amount = 49900, planName = "Pro" }) {
  // amount default in paise (₹499 => 49900). You can accept number in rupees and convert.
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!user || !user._id) return alert("Please login to continue.");
    if (loading) return;
    setLoading(true);

    try {
      await loadRazorpay();

      // 1) create order on backend
      // send user email in notes for webhook linking
      const { data: createRes } = await axios.post(`${API_BASE}/create-order`, {
        amount: Math.round(amount / 1), // keep paise if you passed paise; or convert if rupees
        currency: "INR",
        receipt: `coldmailer_${user._id}_${Date.now()}`,
        notes: { userId: user._id, userEmail: user.email, planName }
      });

      if (!createRes?.order?.id) {
        throw new Error("Order creation failed");
      }

      const order = createRes.order;

      // 2) Setup Razorpay options
      const options = {
        key: RAZORPAY_KEY,
        amount: order.amount, // paise
        currency: order.currency,
        name: "ColdMailer.AI",
        description: `${planName} Plan`,
        image: "", // optional: logo URL
        order_id: order.id,
        handler: async function (response) {
          // response: razorpay_payment_id, razorpay_order_id, razorpay_signature
          try {
            // Send verification to backend
            const verifyRes = await axios.post(`${API_BASE}/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              userId: user._id,
              planName
            });

            if (verifyRes.data?.success) {
              // Optionally fetch updated user profile from your user API
              alert("Payment verified! Your account has been upgraded.");
              // you may refresh user context here
            } else {
              console.error("Verification failed", verifyRes.data);
              alert("Payment verification failed on server. We'll retry.");
            }
          } catch (err) {
            console.error("Verification request failed", err);
            alert("Verification request failed. Check console.");
          }
        },
        prefill: {
          name: user?.username || "",
          email: user?.email || ""
        },
        notes: { userId: user._id },
        theme: {
          color: "#2563EB"
        },
        modal: {
          ondismiss: function() {
            // user closed popup
            console.log("Checkout closed by user");
          }
        }
      };

      const rzp = new window.Razorpay(options);

      // add error handler for failed payments
      rzp.on("payment.failed", function (response) {
        console.error("Payment failed response", response);
        alert("Payment failed. Please try again or use a different method.");
      });

      rzp.open();
    } catch (err) {
      console.error("Payment error", err);
      alert(err.message || "Something went wrong. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className={`px-4 py-2 rounded ${loading ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-700"} text-white`}
      onClick={handlePayment}
      disabled={loading}
    >
      {loading ? "Processing..." : `Upgrade to Pro`}
    </button>
  );
}
