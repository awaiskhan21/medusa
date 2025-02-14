import { Module } from "@medusajs/framework/utils";
import VerifiedModuleService from "./service";

export const VERIFIED_MODULE = "varified";

export default Module(VERIFIED_MODULE, {
  service: VerifiedModuleService,
});
