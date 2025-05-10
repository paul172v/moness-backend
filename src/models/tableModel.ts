import mongoose from "mongoose";

const tableSchema = new mongoose.Schema({
  email: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  numberOfGuests: { type: Number, required: true },
  occasion: { type: String, required: false },
  requests: { type: String, required: false },
  selectedDate: { type: Date, required: true },
  selectedTime: { type: String, required: true },
  tel: { type: String, required: true },
  termsAccepted: { type: Boolean, required: true },
});

const Table = mongoose.model("Table", tableSchema);

export default Table;
