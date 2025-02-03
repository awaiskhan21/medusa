import { Module } from "@medusajs/framework/utils";
import ManagerModuleService from "./service";

export const MANAGER_MODULE = "manager";

export default Module(MANAGER_MODULE, {
  service: ManagerModuleService,
});
