import Joi from "joi";

const validateRecipient = (data) => {
    const schema = Joi.object({
        name: Joi.string().trim().required(),
        mobile: Joi.string().trim().required(),
        addressLine1: Joi.string().trim().required(),
        addressLine2: Joi.string().allow('', null).optional(),
        addressLine3: Joi.string().allow('', null).optional(),
        countryCode: Joi.string().trim().length(2).required().messages({
            'string.length': 'Country code must be a 2-letter ISO code'
        }),
        city: Joi.string().trim().required(),
        stateOrProvinceCode: Joi.string().trim().required(),
        postCode: Joi.string().trim().required()
    });

    return schema.validate(data, {
        abortEarly: false,
        stripUnknown: true // Removes fields not defined in this schema
    });
};

export {
    validateRecipient,
};