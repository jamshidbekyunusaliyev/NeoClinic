import { model, models, Schema } from "mongoose";

const doctorSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", unique: true, sparse: true },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  speciality: { type: String, required: true, trim: true },
  degree: { type: String, required: true, trim: true },
  experience: { type: Number, required: true, min: 0, max: 60 },
  fees: { type: Number, required: true, min: 0 },
  rating: { type: Number, default: 5, min: 0, max: 5 },
  reviews: { type: Number, default: 0, min: 0 },
  available: { type: Boolean, default: true },
  availableToday: { type: Boolean, default: true },
  imageUrl: { type: String, default: "" },
  bio: { type: String, default: "", maxlength: 2000 },
}, { timestamps: true });

doctorSchema.index({ speciality: 1, available: 1 });
export const Doctor = models.Doctor ?? model("Doctor", doctorSchema);