import mongoose, { Schema, Document } from "mongoose";

export interface IRefreshToken extends Document {
  user: mongoose.Types.ObjectId;
  token: string;
  expiresAt: Date;
}

const RefreshTokenSchema = new Schema<IRefreshToken>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// Auto-delete expired tokens
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<IRefreshToken>("RefreshToken", RefreshTokenSchema);
