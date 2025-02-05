import { container } from "@medusajs/framework";
import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { createCustomersWorkflow } from "@medusajs/medusa/core-flows";
import {
  AuthenticationInput,
  IAuthModuleService,
  ICustomerModuleService,
} from "@medusajs/framework/types";
import { AnyNaptrRecord } from "node:dns";
import jwt from "jsonwebtoken";

type Input = {
  otp: string;
  phone: string;
};
const OTP_VALUE = "1234";
export const POST = async (req: MedusaRequest<Input>, res: MedusaResponse) => {
  const { otp, phone } = req.body;
  if (!otp || !phone) {
    return res.status(400).json({
      message: "Both OTP and phone number are required",
    });
  }
  const customerModuleService: ICustomerModuleService = req.scope.resolve(
    Modules.CUSTOMER
  );
  try {
    // const [customer, count] = await customerModuleService.listAndCountCustomers(
    //   {
    //     q: `${phone}`,
    //   }
    // );
    const query = container.resolve(ContainerRegistrationKeys.QUERY);

    const { data: customer } = await query.graph({
      entity: "customer",
      fields: ["*"],
      filters: {
        phone: phone as any,
      },
    });
    if (customer.length === 0) {
      return res.status(400).json({
        message: "Phone number not found",
      });
    }
    if (otp !== OTP_VALUE) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    // const authService: IAuthModuleService = req.scope.resolve("authService");

    // const { success, token } = await authService.authenticate({
    //   customer_id: customer.id,
    //   phone: customer.phone,
    // });
    const authService: IAuthModuleService = req.scope.resolve(Modules.AUTH);
    //in emailpass it is asking for email and password
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
    const { jwtSecret } = container.resolve("configModule").projectConfig.http;
    const token = jwt.sign(payloadAuthIdentity, jwtSecret);
    const getCustomerReponse = {
      token,
      newUser: false,
    };
    res.json({
      message: "OTP verified successfully",
      data: getCustomerReponse,
    });
  } catch (e) {
    return res.status(500).json({
      message: e.message,
    });
  }
};
