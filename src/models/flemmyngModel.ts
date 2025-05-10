import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  allergens: { type: [String] },
  description: { type: String },
  options: { type: String },
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
