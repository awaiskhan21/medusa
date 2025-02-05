import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { AuthenticationInput } from "@medusajs/framework/types";
import { Modules, MedusaError } from "@medusajs/framework/utils";
import { verifyOtpWorkflow } from "src/workflows/mobile-otp";

type Input = {
  phone: string;
  otp: string;
};
export async function POST(
  req: MedusaRequest<Input>,
  res: MedusaResponse
): Promise<void> {
  const { result, errors } = await verifyOtpWorkflow(req.scope).run({
    input: {
      url: req.url,
      headers: req.headers,
      query: req.query,
      body: req.body,
      protocol: req.protocol,
    },
    throwOnError: false,
  });
  if (errors.length) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      errors[0].error.message
    );
  } else {
    res.json(result);
  }
}
