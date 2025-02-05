import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { AuthenticationInput } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";
import { sendOtpWorkflow } from "src/workflows/mobile-otp";

type Input = {
  phone: string;
};
export async function POST(
  req: MedusaRequest<Input>,
  res: MedusaResponse
): Promise<void> {
  const { result } = await sendOtpWorkflow(req.scope).run({
    input: req.body,
  });
  res.json(result);
}
