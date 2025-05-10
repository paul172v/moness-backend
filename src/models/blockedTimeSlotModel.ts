import mongoose from "mongoose";

const blockedTimeSlotSchema = new mongoose.Schema({
  firstName: { type: String, required: true, default: "Blocked" },
  lastName: { type: String, required: true, default: "Slot" },
  selectedDate: { type: Date, required: true },
  selectedTime: { type: String, required: true },
});

const BlockedTimeSlot = mongoose.model(
  "BlockedTimeSlot",
  blockedTimeSlotSchema
);

export default BlockedTimeSlot;
