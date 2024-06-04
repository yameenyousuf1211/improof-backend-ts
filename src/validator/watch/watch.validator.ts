import joi from 'joi';
import { validateRequest } from '../../middlewares/validation.middleware';

const createWatchValidator = joi.object({
    watch: joi.string().required(),
    terraRefId: joi.string().required(),
    terraUserId: joi.string().required(),
    icon:joi.string().optional(),
    supportedTypes: joi.object({
        activity: joi.boolean().optional(),
        body: joi.boolean().optional(),
        nutrition: joi.boolean().optional(),
        daily: joi.boolean().optional(),
        sleep: joi.boolean().optional(),
        menstruation: joi.boolean().optional(),
    }).optional(),
})


export const validateCreateWatch = validateRequest(createWatchValidator);