import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: "user" | "admin";
  avatar?: string;
  isVerified: boolean;
  wishlist: string[];
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  comparePassword: (password: string) => Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, select: false, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    avatar: { type: String },
    isVerified: { type: Boolean, default: false },
    wishlist: [{ type: String }],
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password!, salt);
});

UserSchema.methods.comparePassword = async function (password: string) {
  if (!this.password) return false;
  return await bcrypt.compare(password, this.password);
};

export default mongoose.model<IUser>("User", UserSchema);
