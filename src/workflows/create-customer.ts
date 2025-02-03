import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import {
  createCustomersStep,
  createCustomersWorkflow,
} from "@medusajs/medusa/core-flows";

export type CreateCustomerStepInput = {
  phone: string;
};
type CreateCustomerWorkflowInput = {
  phone: string;
};
export const createCustomerStep = createStep(
  "create-customer-step",
  async (input: CreateCustomerStepInput, { container }) => {
    const otp = "1234";
    const customerService: any = container.resolve("customerService");
    const [users, count] = await customerService.retrieveCustomerByPhone({
      phone: input.phone,
    });

    const { result } = await createCustomersWorkflow(container).run({
      input: {
        customersData: [
          {
            phone: input.phone,
          },
        ],
        additional_data: {
          position_name: "Editor",
        },
      },
    });
    return new StepResponse(count, result);
  }
);

export const createCustomerWorkflow = createWorkflow(
  "create-customer",

  (input: CreateCustomerWorkflowInput) => {
    const brand = createCustomerStep(input);

    return new WorkflowResponse(brand);
  }
);
