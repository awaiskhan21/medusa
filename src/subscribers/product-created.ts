import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";

export default async function productCreateHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const productId = data.id;
  const logger = container.resolve("logger");

  const productModuleService = container.resolve("product");

  const product = await productModuleService.retrieveProduct(productId);

  console.log(`The product ${product.title} was created`);
  logger.info(`The product ${product.title} was created`);
}

export const config: SubscriberConfig = {
  event: "product.created",
};
