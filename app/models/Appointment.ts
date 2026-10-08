import { model, models, Schema } from "mongoose";

const appointmentSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  doctorId: { type: Schema.Types.ObjectId, ref: "Doctor", required: true, index: true },
  date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  time: { type: String, required: true, match: /^([01]\d|2[0-3]):(00|30)$/ },
  status: { type: String, enum: ["booked", "cancelled", "completed"], default: "booked", required: true },
}, { timestamps: true });

appointmentSchema.index({ doctorId: 1, date: 1, time: 1 }, { unique: true, partialFilterExpression: { status: "booked" } });
export const Appointment = models.Appointment ?? model("Appointment", appointmentSchema);