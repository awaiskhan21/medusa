import {
  ContainerRegistrationKeys,
  defineConfig,
  loadEnv,
  Modules,
} from "@medusajs/framework/utils";

loadEnv(process.env.NODE_ENV || "development", process.cwd());

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
  },
  modules: [
    {
      resolve: "./src/modules/brand",
      options: {
        name: "awais",
      },
    },
    {
      resolve: "./src/modules/manager",
    },
    {
      resolve: "@medusajs/medusa/auth",
      options: {
        providers: [
          // default provider
          {
            resolve: "@medusajs/medusa/auth-emailpass",
            dependencies: [Modules.CACHE, ContainerRegistrationKeys.LOGGER],
            id: "emailpass",
          },
          {
            resolve: "./src/modules/my-auth",
            id: "my-auth",
            // dependencies: [Modules.CACHE, ContainerRegistrationKeys.LOGGER],
            // options: {
            //   // provider options...
            // },
          },
        ],
      },
    },
  ],
});
