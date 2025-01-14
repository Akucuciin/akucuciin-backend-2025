import { BadRequestError } from "../errors/customErrors.mjs";

const validate = (schema, req) => {
  const validation = schema.validate(req);
  if (validation.error) {
    throw new BadRequestError(validation.error.message);
  } else {
    return validation.value;
  }
};

export default validate;