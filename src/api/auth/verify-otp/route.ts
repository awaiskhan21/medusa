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
    const authToken = await authService.authenticate("auth-mobile-otp", {
      url: req.url,
      headers: req.headers,
      query: req.query,
      body: req.body,
      protocol: req.protocol,
    } as AuthenticationInput);
    console.log("authToken", authToken);
    res.json({
      token: authToken,
    });
  } catch (e) {
    return res.status(500).json({
      message: e.message,
    });
  }
};
