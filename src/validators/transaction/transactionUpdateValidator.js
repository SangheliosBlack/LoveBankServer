import Joi from 'joi';

const transactionUpdateSchema = Joi.object({
  sender: Joi.string().hex().length(24),
  receiver: Joi.string().hex().length(24),
  description: Joi.string(),
  quantity: Joi.number(),
  docType: Joi.string().hex().length(24)
}).min(1);

export default transactionUpdateSchema;