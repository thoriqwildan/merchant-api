import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production')
    .default('development'),

  PORT: Joi.number().default(3000),

  DATABASE_URL: Joi.string().required(),

  JWT_ACCESS: Joi.string().required(),

  JWT_REFRESH: Joi.string().required(),

  CORS_ORIGIN: Joi.string().default('*'),

  CORS_METHODS: Joi.string().default('GET,HEAD,PUT,PATCH,POST,DELETE'),

  CORS_CREDENTIALS: Joi.boolean().default(true),
});
