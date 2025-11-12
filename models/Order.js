import mongoose from "mongoose";

// ✅ Address sub-schema (no change needed)
const addressSchema = new mongoose.Schema({
  fullName: String,
  area: String,
  city: String,
  state: String,
  phoneNumber: String,
  postalCode: String,
});

// ✅ Order schema (main fix here)
const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product", // ✅ Reference to Product model for populate()
        },
        name: String,
        price: Number,
        qty: Number,
        total: Number,
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    address: {
      type: addressSchema,
      required: true,
    },
    status: {
      type: String,
      default: "pending",
    },
  },
  { timestamps: true }
);

// ✅ Prevent model overwrite during hot reload
const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;
