import { LoaderOptions } from "@medusajs/framework/types";

type ModuleOptions = {
  name: string;
};
export default async function brandLogLoader({
  container,
  options,
}: LoaderOptions<ModuleOptions>) {
  const logger = container.resolve("logger");

  logger.info(
    "[brandLogLoader]: Hello, World! from brand module and here is options: "
  );
  console.log("options", options);
}
