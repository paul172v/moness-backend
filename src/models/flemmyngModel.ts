import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  allergens: { type: [String] },
  description: { type: String },
  options: { type: String },
});

menuItemSchema.pre("save", function (next) {
  this.price = Number(this.price.toFixed(2));

  next();
});

export const FlemmyngWhileYouWait = mongoose.model(
  "FlemmyngWhileYouWait",
  menuItemSchema
);
export const FlemmyngStarters = mongoose.model(
  "FlemmyngStarters",
  menuItemSchema
);
export const FlemmyngMains = mongoose.model("FlemmyngMains", menuItemSchema);
export const FlemmyngSides = mongoose.model("FlemmyngSides", menuItemSchema);
export const FlemmyngDesserts = mongoose.model(
  "FlemmyngDesserts",
  menuItemSchema
);
