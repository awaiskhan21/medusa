import { MedusaService } from "@medusajs/framework/utils";
import { MobileOtp } from "./models/mobile-otp";

class MobileOtpModuleService extends MedusaService({
  MobileOtp,
}) {}

export default MobileOtpModuleService;
