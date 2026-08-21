import Joi from 'joi';

const loveCreateSchema = Joi.object({
  name: Joi.string().required(),
  icon: Joi.string().trim().lowercase().optional(),
  description: Joi.string().optional(),
  code: Joi.string().optional(),
  conversion_rate: Joi.number().optional(),
  can_buy: Joi.boolean().optional(),
  accessible: Joi.boolean().optional()
});

export default loveCreateSchema;