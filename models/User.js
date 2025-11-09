import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema({
  fullName: String,
  phone: String,
  street: String,
  area: String,
  city: String,
  state: String,
  postalCode: String,
  country: String,
});

const CartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  name: String,
  price: Number,
  imageUrl: String,
  quantity: { type: Number, default: 1 },
});

const UserSchema = new mongoose.Schema(
  {
    clerkId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    imageUrl: String,
    cartItems: [CartItemSchema],
    addresses: [AddressSchema],
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);
export default User;
