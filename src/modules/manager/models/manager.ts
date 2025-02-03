import { model } from "@medusajs/framework/utils";

const Manager = model.define("manager", {
  id: model.id().primaryKey(),
  firstName: model.text().nullable(),
  lastName: model.text().nullable(),
  phoneNumber: model.number(),
  otp: model.number().nullable(),
});

export default Manager;
