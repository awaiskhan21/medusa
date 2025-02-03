import { Module } from "@medusajs/framework/utils";
import brandLogLoader from "./loaders/brand-log";
import BrandModuleService from "./service";

export const BRAND_MODULE = "brand";

export default Module(BRAND_MODULE, {
  service: BrandModuleService,
  loaders: [brandLogLoader],
});
