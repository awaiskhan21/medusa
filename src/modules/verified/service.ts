import { MedusaService } from "@medusajs/framework/utils";
import { Verified } from "./models/verified";

class VerifiedModuleService extends MedusaService({
  Verified,
}) {}

export default VerifiedModuleService;
