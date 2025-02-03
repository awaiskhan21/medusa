import {
  AuthenticatedMedusaRequest,
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import { IUserModuleService } from "@medusajs/framework/types"; // Adjust the import path as necessary
import { Modules } from "@medusajs/framework/utils";
import { z } from "zod";
import { createBrandWorkflow } from "../../../workflows/create-brand";
import { PostAdminCreateBrand } from "./validators";

type PostAdminCreateBrandType = z.infer<typeof PostAdminCreateBrand>;

export const POST = async (
  req: AuthenticatedMedusaRequest<PostAdminCreateBrandType>,
  res: MedusaResponse
) => {
  const { result } = await createBrandWorkflow(req.scope).run({
    input: req.validatedBody,
  });
  //for customers
  // let customer;
  // if (req.auth_context?.actor_id) {
  //   // retrieve customer

  //   const customerModuleService: ICustomerModuleService = req.scope.resolve(
  //     Modules.CUSTOMER
  //   );
  //   customer = await customerModuleService.retrieveCustomer(
  //     req.auth_context.actor_id
  //   );
  // }
  const userModuleService: IUserModuleService = req.scope.resolve(Modules.USER);
  const adminUser = await userModuleService.retrieveUser(
    req.auth_context.actor_id
  );
  res.json({
    brand: result,
    adminUser: adminUser ? { adminUser } : "adminUser not found",
  });
};

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve("query");

  const {
    data: brands,
    metadata: { count, take, skip } = { count: 5, take: 5, skip: 0 },
  } = await query.graph({
    entity: "brand",
    ...req.queryConfig,
    // fields: ["id", "products.title"],
  });

  // res.json({ brands });
  res.json({
    brands,
    count,
    limit: take,
    offset: skip,
  });
};

//to opt out of authentication
// export const AUTHENTICATE = false
