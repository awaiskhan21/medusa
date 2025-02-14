import { model } from "@medusajs/framework/utils";

export const Verified = model.define("verified", {
  id: model.id().primaryKey(),
  isVerified: model.boolean().default(false),
});
