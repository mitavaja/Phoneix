import Joi from "joi";

const validateRecipient = (data) => {
    const schema = Joi.object({
        name: Joi.string()
            .trim()
            .min(2)
            .max(70)
            .pattern(/^[A-Za-z\s.'-]+$/)
            .required()
            .messages({
                'string.pattern.base': 'Name should only contain letters, spaces, and valid characters.',
                'string.empty': 'Recipient full name is required.',
                'string.min': 'Name must be at least 2 characters.'
            }),
        mobile: Joi.string()
            .trim()
            .pattern(/^\+?[0-9\s-]{7,16}$/)
            .required()
            .messages({
                'string.pattern.base': 'Please enter a valid mobile number with 7 to 15 digits.',
                'string.empty': 'Recipient contact mobile is required.'
            }),
        addressLine1: Joi.string()
            .trim()
            .min(5)
            .max(120)
            .pattern(/[A-Za-z]/)
            .required()
            .messages({
                'string.pattern.base': 'Address must contain street or building names (cannot be only numbers or symbols).',
                'string.min': 'Address Line 1 must be at least 5 characters.',
                'string.empty': 'Address Line 1 is required.'
            }),
        addressLine2: Joi.string().allow('', null).optional(),
        addressLine3: Joi.string().allow('', null).optional(),
        countryCode: Joi.string().trim().length(2).required().messages({
            'string.length': 'Country code must be a 2-letter ISO code.'
        }),
        city: Joi.string()
            .trim()
            .min(2)
            .pattern(/[A-Za-z]/)
            .required()
            .messages({
                'string.pattern.base': 'City must contain letters.',
                'string.empty': 'City name is required.'
            }),
        stateOrProvinceCode: Joi.string()
            .trim()
            .min(2)
            .required()
            .messages({
                'string.empty': 'State or Province is required.'
            }),
        postCode: Joi.string().trim().allow('', null).optional()
    });

    return schema.validate(data, {
        abortEarly: false,
        stripUnknown: true // Removes fields not defined in this schema
    });
};

export {
    validateRecipient,
};
