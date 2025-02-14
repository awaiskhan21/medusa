import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { MOBILE_OTP_MODULE } from "src/modules/mobile-otp";
import MobileOtpModuleService from "src/modules/mobile-otp/service";
import {
  AuthenticationInput,
  IAuthModuleService,
  ICustomerModuleService,
} from "@medusajs/framework/types";
import jwt from "jsonwebtoken";

type Input = {
  otp: string;
  otpTableId: string;
  phone?: string;
};
export const POST = async (req: MedusaRequest<Input>, res: MedusaResponse) => {
  const otp = req.body.otp;
  const otpTableId = req.body.otpTableId;
  if (!otp) {
    return res.status(400).json({
      message: "OTP is required",
    });
  }
  if (!otpTableId) {
    return res.status(400).json({
      message: "OTP Table ID is required",
    });
  }
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const mobileOtpService: MobileOtpModuleService =
    req.scope.resolve(MOBILE_OTP_MODULE);
  const { data: otpTable } = await query.graph({
    entity: "mobile_otp",
    fields: ["*"],
    filters: {
      id: otpTableId,
    },
  });
  console.log("otpTable", otpTable);
  if (otpTable.length === 0) {
    return res.status(400).json({
      message: "otp doesnot exist",
    });
  }
  const otpData = otpTable[0];
  // console.log("otpData", otpData);
  // console.log("otpData.otp_hash", otpData.otp_hash);
  // console.log("otp", otp);
  // console.log(otpData.otp_hash !== otp);
  // console.log(otpData.otp_hash !== otp);
  if (otpData.otp_hash !== otp) {
    return res.status(400).json({
      message: "Invalid OTP from here",
    });
  }
  if (new Date(otpData.expires_at) < new Date()) {
    return res.status(400).json({
      message: "OTP has expired",
    });
  }
  req.body.phone = otpData.phone; // adding phone number to the request body

  try {
    const authService: IAuthModuleService = req.scope.resolve(Modules.AUTH);
    const { success, authIdentity, location, error } =
      await authService.authenticate("my-auth", {
        url: req.url,
        headers: req.headers,
        query: req.query,
        body: req.body,
        protocol: req.protocol,
      } as AuthenticationInput);

    if (!success) {
      return res.status(400).json({ message: error });
    }
    const customerModuleService: ICustomerModuleService = req.scope.resolve(
      Modules.CUSTOMER
    );
    const { data: customer } = await query.graph({
      entity: "customer",
      fields: ["*", "verified.*"],
      filters: {
        phone: req.body.phone as any,
      },
    });
    console.log("customer", customer);
    console.log("authIdentity", authIdentity);
    const payloadAuthIdentity = {
      actor_id: customer[0].id,
      actor_type: "customer",
      auth_identity_id: authIdentity?.id,
      app_metadata: {
        customer_id: customer[0].id,
      },
      // iat: currentTimestamp,
      // exp: validityDuration,
    };
    const { jwtSecret } = req.scope.resolve("configModule").projectConfig.http;
    const token = jwt.sign(payloadAuthIdentity, jwtSecret);

    console.log("token", token);
    return res.json({
      message: "OTP verified successfully",
      customer: customer[0],
      token: token,
    });
  } catch (e) {
    console.log("error", e);
    return res.status(400).json({
      message: "Error",
      error: e,
    });
  }
};
