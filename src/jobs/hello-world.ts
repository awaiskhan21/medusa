import { MedusaContainer } from "@medusajs/framework/types";

export default async function greetingJob(container: MedusaContainer) {
  const logger = container.resolve("logger");

  logger.info("Greeting!");
}

export const config = {
  name: "greeting-every-minute",
  schedule: "* * * * *",
};
