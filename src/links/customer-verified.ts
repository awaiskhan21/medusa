import { defineLink } from "@medusajs/framework/utils";
import CustomerModule from "@medusajs/medusa/customer";
import VerifiedModule from "../modules/verified";

export default defineLink(CustomerModule.linkable.customer, {
  linkable: VerifiedModule.linkable.verified,
  deleteCascade: true,
});
