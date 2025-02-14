import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import {
  AuthenticationInput,
  IAuthModuleService,
  ICustomerModuleService,
} from "@medusajs/framework/types";
import { createCustomersWorkflow } from "@medusajs/medusa/core-flows";
import { s } from "framer-motion/client";

export type sendOtpWorkFlowInput = {
  phone: string;
};

export const userRegistrationStep = createStep(
  "user-registration-step",
  async (input: any, { container }) => {
    const phone = input.phone;
    if (!phone) {
      throw new Error("Phone number is required");
    }
    const customerModuleService: ICustomerModuleService = container.resolve(
      Modules.CUSTOMER
    );
    const query = container.resolve(ContainerRegistrationKeys.QUERY);

    const { data: customer } = await query.graph({
      entity: "customer",
      fields: ["*"],
      filters: {
        phone: phone as any,
      },
    });
    const otp = Math.floor(1000 + Math.random() * 9000);

    //if customer already exists
    if (customer.length > 0) {
      const sendOtpWorkflowResponse = {
        message: "user already exists",
      };
      return new StepResponse(sendOtpWorkflowResponse);
    }
    //if customer does not exist
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
      const authService: IAuthModuleService = container.resolve(Modules.AUTH);
      //in emailpass it is asking for email and password
      const { success, authIdentity, location, error } =
        await authService.register("my-auth", {
          // url: input.url,
          // headers: input.headers,
          // query: input.query,
          body: phone,
          // protocol: input.protocol,
        } as AuthenticationInput);
      const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
      logger.info(`authIdentity: ${authIdentity} and also success: ${success}`);
    } catch (e) {
      throw new Error(`Error: ${e}`);
    }
    const sendOtpWorkflowResponse = {
      message: "user created successfully",
    };
    return new StepResponse(sendOtpWorkflowResponse);
  }
);

export const sendOtpToCustomerWorkflow = createWorkflow(
  "register-user",
  (input: sendOtpWorkFlowInput) => {
    const getOtpStepResponse = userRegistrationStep(input);

    // const otp = getOtpStepResponse;
    // // sendOtpStep({ otp });
    // const sendOtpWorkflowResponse = {
    //   message: "Successfully Sent",
    //   otp: getOtpStepResponse,
    // };
    return new WorkflowResponse(getOtpStepResponse);
  }
);
