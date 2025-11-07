import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema({
  fullName: { type: String, default: "" },
  phone: { type: String, default: "" },
  street: { type: String, default: "" },
  area: { type: String, default: "" }, // you used area in frontend
  city: { type: String, default: "" },
  state: { type: String, default: "" },
  postalCode: { type: String, default: "" },
  country: { type: String, default: "" },
});

const CartItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name: String,
  price: Number,
  imageUrl: String,
  quantity: { type: Number, default: 1 },
});

const UserSchema = new mongoose.Schema(
  {
    clerkId: { type: String, required: true, unique: true }, // Clerk user ID
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    imageUrl: { type: String, default: "" },

    cartItems: {
      type: [CartItemSchema],
      default: [],
    },

    // ✅ addresses array
    addresses: {
      type: [AddressSchema],
      default: [],
    },
  },
  { minimize: false, timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);
export default User;
