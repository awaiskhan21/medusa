import { container } from "@medusajs/framework";
import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { createCustomersWorkflow } from "@medusajs/medusa/core-flows";
import { ICustomerModuleService } from "@medusajs/framework/types";

type Input = {
  phone: string;
};

export const POST = async (req: MedusaRequest<Input>, res: MedusaResponse) => {
  const phone = req.body.phone;
  if (!phone) {
    return res.status(400).json({
      message: "Phone number is required",
    });
  }
  const customerModuleService: ICustomerModuleService = req.scope.resolve(
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
    return res.status(400).json({
      message: "Phone number already exists",
      customer: customer,
    });
  }
  try {
    const otp = "1234";
    const { result } = await createCustomersWorkflow(container).run({
      input: {
        customersData: [
          {
            phone: phone,
            // email: `${phone}@gmail.com`,
            // password: phone,
          },
        ],
        additional_data: {
          position_name: "Editor",
        },
      },
    });
    res.json({
      message: `Welcome ${req.body.phone}!`,
      otp: otp,
      result: result,
    });
  } catch (e) {
    res.status(500).json({
      message: e.message,
    });
  }
};
