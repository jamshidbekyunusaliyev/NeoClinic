import { model, models, Schema } from "mongoose";

const userSchema = new Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["user", "doctor", "admin"], default: "user", required: true },
  phone: { type: String, trim: true, maxlength: 30 },
}, { timestamps: true });

export const User = models.User ?? model("User", userSchema);