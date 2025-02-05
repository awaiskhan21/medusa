import { MedusaRequest, MedusaResponse } from "@medusajs/framework";

export default function GET(req: MedusaRequest, res: MedusaResponse) {
  res.sendStatus(200).json({ message: "Hello World from store" });
}
