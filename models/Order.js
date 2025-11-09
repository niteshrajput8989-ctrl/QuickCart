import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    items: [
      {
        productId: String, // 🟢 now string because dummy ID is not ObjectId
        name: String,
        price: Number,
        qty: Number,
        total: Number,
      },
    ],
    totalAmount: Number,
    address: String,
    status: { type: String, default: "pending" },
  },
  { timestamps: true }
);

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
export default Order;
