import {
  AuthenticationInput,
  ICustomerModuleService,
} from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { createCustomersWorkflow } from "@medusajs/medusa/core-flows";
import jwt from "jsonwebtoken";

export type sendOtpWorkFlowInput = {
  phone: string;
};
export type getOtpStepInput = {
  phone: string;
};
export type sendOtpStepInput = {
  otp: string;
};

//send otp workflow
export const getOtpStep = createStep(
  "get-otp-step",
  async (input: getOtpStepInput, { container }) => {
    const otp = "1234";
    const phone = input.phone;
    if (!phone) {
      throw new Error("Phone number is required");
    }
    const customerModuleService: ICustomerModuleService = container.resolve(
      Modules.CUSTOMER
    );
    // const [customer, count] = await customerModuleService.listAndCountCustomers({
    //   q: `${phone}`,
    // });
    const query = container.resolve(ContainerRegistrationKeys.QUERY);

    const { data: customer } = await query.graph({
      entity: "customer",
      fields: ["*"],
      filters: {
        phone: phone as any,
      },
    });
    if (customer.length > 0) {
      console.log("customer", customer);
      const sendOtpWorkflowResponse = {
        message: "user already exists",
        otp: otp,
        // customer: customer,
      };
      return new StepResponse(sendOtpWorkflowResponse);
    } else {
      const otp = "1234";
      const { result } = await createCustomersWorkflow(container).run({
        input: {
          customersData: [
            {
              phone: phone,
            },
          ],
        },
      });
      const sendOtpWorkflowResponse = {
        message: `Welcome ${phone}!`,
        otp: otp,
        customer: result,
      };
      return new StepResponse(sendOtpWorkflowResponse);
    }
  }
);
// export const sendOtpStep = createStep(
//   "send-otp-step",
//   async (input: sendOtpStepInput, { container }) => {
//     // will process the sms send flow here
//     return new StepResponse();
//   }
// );
export const sendOtpWorkflow = createWorkflow(
  "send-otp",
  (input: sendOtpWorkFlowInput) => {
    const getOtpStepResponse = getOtpStep(input);
    const otp = getOtpStepResponse;
    // sendOtpStep({ otp });
    const sendOtpWorkflowResponse = {
      message: "Successfully Sent",
      otp: getOtpStepResponse,
    };
    return new WorkflowResponse(sendOtpWorkflowResponse);
  }
);

export type verifyOtpWorkFlowInput = {
  phone: string;
  otp: string;
};

//verify otp workflow
export const verifyOtpStep = createStep(
  "verify-otp-step",
  async (input: verifyOtpWorkFlowInput, { container }) => {
    if (input.otp !== "1234") {
      throw new Error("Invalid OTP");
    }
    return new StepResponse();
  }
);

//get customer workflow
export const getCustomerStep = createStep(
  "get-customer-step",
  async (input: any, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY);
    console.log("input", input.body.phone);
    const { data: customer } = await query.graph({
      entity: "customer",
      fields: ["*"],
      filters: {
        phone: input.body.phone,
      },
    });
    console.log("customer", customer);
    const authModuleService = container.resolve(Modules.AUTH);
    if (customer.length) {
      const { success, authIdentity, location, error } =
        await authModuleService.authenticate("my-auth", {
          url: input.url,
          headers: input.headers,
          query: input.query,
          body: input.body,
          protocol: input.protocol,
        } as AuthenticationInput);

      if (!success) {
        throw new Error(error);
      }
      // Expiration duration in seconds (e.g., 24 hours)
      const payloadAuthIdentity = {
        actor_id: customer[0].id,
        actor_type: "customer",
        auth_identity_id: authIdentity?.id,
        app_metadata: {
          customer_id: customer[0].id,
        },
      };
      const { jwtSecret } =
        container.resolve("configModule").projectConfig.http;
      const token = jwt.sign(payloadAuthIdentity, jwtSecret);
      const getCustomerReponse = {
        token,
        newUser: false,
      };
      return new StepResponse(getCustomerReponse);
    } else {
      const { success, authIdentity, location, error } =
        await authModuleService.register("my-auth", {
          url: input.url,
          headers: input.headers,
          query: input.query,
          body: input.body,
          protocol: input.protocol,
        } as AuthenticationInput);
      console.log("authIdentity", authIdentity);
      if (!success) {
        throw new Error(error);
      }
      const payloadAuthIdentity = {
        actor_id: "",
        actor_type: "customer",
        auth_identity_id: authIdentity?.id,
        app_metadata: {},
      };
      const { jwtSecret } =
        container.resolve("configModule").projectConfig.http;
      const token = jwt.sign(payloadAuthIdentity, jwtSecret);
      const getCustomerReponse = {
        token,
        newUser: true,
      };
      return new StepResponse(getCustomerReponse);
    }
  }
);
export const verifyOtpWorkflow = createWorkflow("verify-otp", (input: any) => {
  const verifyOtpStepResponse = verifyOtpStep(input.body);
  const getCustomerResponse = getCustomerStep(input);
  return new WorkflowResponse(getCustomerResponse);
});
