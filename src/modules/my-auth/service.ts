import {
  AbstractAuthModuleProvider,
  MedusaError,
} from "@medusajs/framework/utils";
import {
  AuthIdentityProviderService,
  AuthenticationInput,
  AuthenticationResponse,
} from "@medusajs/framework/types";

class MyAuthProviderService extends AbstractAuthModuleProvider {
  static identifier = "my-auth";
  static DISPLAY_NAME = "Mobile OTP Authentication";
  // TODO implement methods
  async authenticate(
    data: AuthenticationInput,
    authIdentityProviderService: AuthIdentityProviderService
  ): Promise<AuthenticationResponse> {
    if (!data.body) {
      return {
        success: false,
        error: "Invalid request body please provide phone number",
      };
    }
    if (data.body.otp !== "1234") {
      return {
        success: false,
        error: "Invalid OTP",
      };
    }
    const authIdentity = await authIdentityProviderService.retrieve({
      entity_id: data.body.phone,
      // provider: this.provider,
    });

    return {
      success: true,

      authIdentity,
    };
  }

  async register(
    data: AuthenticationInput,
    authIdentityProviderService: AuthIdentityProviderService
  ): Promise<AuthenticationResponse> {
    if (!data.body) {
      return {
        success: false,
        error: "Invalid request body please provide phone number",
      };
    }
    try {
      await authIdentityProviderService.retrieve({
        entity_id: data.body.phone, // email or some ID
      });
      return {
        success: false,
        error: "Identity with phone number already exists",
      };
    } catch (error) {
      if (error.type === MedusaError.Types.NOT_FOUND) {
        const createdAuthIdentity = await authIdentityProviderService.create({
          entity_id: data.body.phone, // email or some ID
        });
        return {
          success: true,
          authIdentity: createdAuthIdentity,
        };
      }
      return { success: false, error: error.message };
    }
  }
  //   async register(
  //     data: AuthenticationInput,

  //     authIdentityProviderService: AuthIdentityProviderService
  //   ): Promise<AuthenticationResponse> {
  //     if (!data.body) {
  //       return {
  //         success: false,
  //         error: "Invalid request body please provide phone number",
  //       };
  //     }
  //     try {
  //       await authIdentityProviderService.retrieve({
  //         entity_id: data.body.phone,
  //       });

  //       return {
  //         success: false,
  //         error: "Identity with phone is already exists your otp is 1234",
  //       };
  //     } catch (error) {
  //       if (error.type === MedusaError.Types.NOT_FOUND) {
  //         const otp = "1234";
  //         const createdAuthIdentity = await authIdentityProviderService.create({
  //           entity_id: data.body.phone, // email or some ID
  //           //   provider: this.identifier,
  //         });

  //         return {
  //           success: true,
  //         };
  //       }

  //       return { success: false, error: error.message };
  //     }
  //   }
}

export default MyAuthProviderService;
