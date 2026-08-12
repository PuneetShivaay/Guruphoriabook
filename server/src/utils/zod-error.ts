import { flattenError, type ZodError } from "zod";

export function getZodFieldError(error: ZodError) {
  return flattenError(error).fieldErrors;
}
