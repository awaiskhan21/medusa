import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { Modules } from "@medusajs/framework/utils";
import { ICustomerModuleService } from "@medusajs/framework/types";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    // Resolve the customer module service
    const userModuleServic = req.scope.resolve(Modules.USER);

    // Retrieve all customers with their phone numbers
    const [user, count] = await userModuleServic.listAndCountUsers({});

    const customerModuleService = req.scope.resolve(Modules.CUSTOMER);
    const [customer, customerCount] =
      await customerModuleService.listAndCountCustomers({});

    // Return the formatted response
    res.status(200).json({
      count: count,
      user: user,
      customer: customer,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}
