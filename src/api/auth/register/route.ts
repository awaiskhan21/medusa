import { container } from "@medusajs/framework";
import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";
import { createCustomersWorkflow } from "@medusajs/medusa/core-flows";
import { ICustomerModuleService } from "@medusajs/framework/types";

type Input = {
  phone: string;
};

export const POST = async (req: MedusaRequest<Input>, res: MedusaResponse) => {
  const number = req.body.phone;
  if (!number) {
    return res.status(400).json({
      message: "Phone number is required",
    });
  }
  const customerModuleService: ICustomerModuleService = req.scope.resolve(
    Modules.CUSTOMER
  );
  const [customer, count] = await customerModuleService.listAndCountCustomers({
    q: `${number}`,
  });
  if (count > 0) {
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
            phone: req.body.phone,
          },
        ],
        additional_data: {
          position_name: "Editor",
        },
      },
    });
    res.json({
      message: `[POST] Hello ${req.body.phone}!`,
      otp: otp,
      result: result,
    });
  } catch (e) {
    res.status(500).json({
      message: e.message,
    });
  }
};
