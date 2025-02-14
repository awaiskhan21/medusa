import { container } from "@medusajs/framework";
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import {
  AuthenticationInput,
  IAuthModuleService,
  ICustomerModuleService,
} from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { createCustomersWorkflow } from "@medusajs/medusa/core-flows";
import { MOBILE_OTP_MODULE } from "src/modules/mobile-otp";
import MobileOtpModuleService from "src/modules/mobile-otp/service";
import VerifiedModuleService from "src/modules/verified/service";
import { VERIFIED_MODULE } from "src/modules/verified";

const ExpirationTime = 10 * 60000; // 1 minute
type Input = {
  phone: string;
};
export async function POST(
  req: MedusaRequest<Input>,
  res: MedusaResponse
): Promise<void> {
  const phone = req.body.phone;
  if (!phone) {
    throw new Error("Phone number is required");
  }
  const customerModuleService: ICustomerModuleService = req.scope.resolve(
    Modules.CUSTOMER
  );
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const mobileOtpService: MobileOtpModuleService =
    req.scope.resolve(MOBILE_OTP_MODULE);
  const { data: customer } = await query.graph({
    entity: "customer",
    fields: ["*"],
    filters: {
      phone: phone as any,
    },
  });
  //generating otp
  const otp = Math.floor(1000 + Math.random() * 9000);

  //if customer already exists
  if (customer.length > 0) {
    try {
      const otpTable = await query.graph({
        entity: "mobile_otp",
        fields: ["*"],
        filters: {
          phone: phone,
        },
      });
      // console.log("otpTable", otpTable);
      if (otpTable.data.length === 0) {
        const mobileOtpTable = await mobileOtpService.createMobileOtps({
          phone: phone,
          otp_hash: otp.toString(),
          expires_at: new Date(Date.now() + ExpirationTime),
          last_attempt_at: new Date(Date.now()),
        });

        res.json({
          message: `Welcome ${req.body.phone}!`,
          mobileOtpTable,
          otp: otp,
          customer: customer,
        });
      }
      const mobileOtpTable = await mobileOtpService.updateMobileOtps({
        id: otpTable.data[0].id,
        otp_hash: otp.toString(),
        expires_at: new Date(Date.now() + ExpirationTime),
        last_attempt_at: new Date(Date.now()),
      });
      const VerifiedModuleService: VerifiedModuleService =
        req.scope.resolve("varified");
      const x = await VerifiedModuleService.createVerifieds({
        isVerified: false,
      });
      console.log("adfjaldjsflkasdjfljslfkjdlsjflkjslfjasldkjldfjk");
      console.log("isVarified", x);
      res.json({
        message: `Welcome ${req.body.phone}!`,
        mobileOtpTable,
        otp: otp,
        customer: customer,
      });
    } catch (e) {
      res.status(500).json({
        message: e.message,
      });
    }
  } else {
    try {
      const { result, errors } = await createCustomersWorkflow(container).run({
        input: {
          customersData: [
            {
              phone: phone,
            },
          ],
        },
      });
      //creating the link
      const link = req.scope.resolve(ContainerRegistrationKeys.LINK);
      const VerifiedModuleService: VerifiedModuleService =
        req.scope.resolve(VERIFIED_MODULE);
      const { data: isVarified } = await VerifiedModuleService.createVerifieds({
        isVerified: false,
      });
      console.log("isVarified", isVarified);
      // await link.create({
      //   [Modules.CUSTOMER]: {
      //     customer_id: result[0].id,
      //   },

      //   [Modules.]: {
      //     account_holder_id: "acchld_123",
      //   },
      // });
      const authService: IAuthModuleService = req.scope.resolve(Modules.AUTH);
      //registring user in auth module
      const { success, authIdentity, location, error } =
        await authService.register("my-auth", {
          url: req.url,
          headers: req.headers,
          query: req.query,
          body: req.body,
          protocol: req.protocol,
        } as AuthenticationInput);
      console.log("authIdentity", authIdentity);
      if (!success) {
        res.status(400).json({ message: error });
      }

      //adding otp to db
      const mobileOtpTable = await mobileOtpService.createMobileOtps({
        phone: phone,
        otp_hash: otp.toString(),
        expires_at: new Date(Date.now() + ExpirationTime),
        last_attempt_at: new Date(Date.now()),
      });
      res.json({
        message: `Welcome ${req.body.phone}!`,
        mobileOtpTable,
        otp: otp,
        result: result,
        isVarified: isVarified,
      });
    } catch (e) {
      res.status(500).json({
        message: e.message,
      });
    }
  }
}
