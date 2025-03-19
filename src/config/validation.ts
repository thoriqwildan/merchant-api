import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production')
    .default('development'),

  PORT: Joi.number().default(3000),

  DATABASE_URL: Joi.string().required(),

  JWT_ACCESS: Joi.string().required(),

  JWT_REFRESH: Joi.string().required(),

  ENABLE_CORS: Joi.boolean().default(true),
});
