import Joi from 'joi';

// 用户注册验证
export const registerSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.alphanum': 'Username must only contain alphanumeric characters',
      'string.min': 'Username must be at least 3 characters long',
      'string.max': 'Username must not exceed 30 characters',
      'any.required': 'Username is required',
    }),

  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),

  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)'))
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.max': 'Password must not exceed 128 characters',
      'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, and one number',
      'any.required': 'Password is required',
    }),

  displayName: Joi.string()
    .min(1)
    .max(100)
    .optional()
    .messages({
      'string.min': 'Display name must be at least 1 character long',
      'string.max': 'Display name must not exceed 100 characters',
    }),
});

// 用户登录验证
export const loginSchema = Joi.object({
  emailOrUsername: Joi.string()
    .required()
    .messages({
      'any.required': 'Email or username is required',
    }),

  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required',
    }),
});

// 用户更新验证
export const updateUserSchema = Joi.object({
  displayName: Joi.string()
    .min(1)
    .max(100)
    .optional()
    .messages({
      'string.min': 'Display name must be at least 1 character long',
      'string.max': 'Display name must not exceed 100 characters',
    }),

  avatar: Joi.string()
    .uri()
    .optional()
    .messages({
      'string.uri': 'Avatar must be a valid URL',
    }),

  preferences: Joi.object()
    .optional()
    .messages({
      'object.base': 'Preferences must be an object',
    }),
});

// 密码更改验证
export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'any.required': 'Current password is required',
    }),

  newPassword: Joi.string()
    .min(8)
    .max(128)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)'))
    .required()
    .messages({
      'string.min': 'New password must be at least 8 characters long',
      'string.max': 'New password must not exceed 128 characters',
      'string.pattern.base': 'New password must contain at least one lowercase letter, one uppercase letter, and one number',
      'any.required': 'New password is required',
    }),
});

// 验证函数
export const validateRegisterData = (data: any) => {
  return registerSchema.validate(data, { abortEarly: false });
};

export const validateLoginData = (data: any) => {
  return loginSchema.validate(data, { abortEarly: false });
};

export const validateUpdateUserData = (data: any) => {
  return updateUserSchema.validate(data, { abortEarly: false });
};

export const validateChangePasswordData = (data: any) => {
  return changePasswordSchema.validate(data, { abortEarly: false });
};

// 通用验证中间件
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: any, res: any, next: any) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
        })),
      });
    }
    
    next();
  };
};
