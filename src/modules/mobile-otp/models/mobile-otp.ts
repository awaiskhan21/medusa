import { model } from "@medusajs/framework/utils";

export const MobileOtp = model.define("mobile_otp", {
  id: model.id().primaryKey(),
  phone: model.text().unique(),
  token: model.text().nullable(),
  otp_hash: model.text(),
  attempt_count: model.number().default(0),
  expires_at: model.dateTime(),
  last_attempt_at: model.dateTime().nullable(),
  // is_valid: model.boolean().default(true),
});
