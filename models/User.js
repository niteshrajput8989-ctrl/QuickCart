import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    imageUrl: { type: String, required: true },
    // store cart as object map { productId: { name, price, image, quantity } }
    // or may store simple quantities, both are handled by the client normalization
    cartItems: { type: Object, default: {} },
  },
  { minimize: false }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);
export default User;
