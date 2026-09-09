import Joi from 'joi';

const transactionCreateSchema = Joi.object({
  sender: Joi.string().hex().length(24).required(),
  receiver: Joi.string().hex().length(24).required(),
  description: Joi.string().required(),
  quantity: Joi.number().required(),
  docType: Joi.string().hex().length(24).required()
});

export default transactionCreateSchema;