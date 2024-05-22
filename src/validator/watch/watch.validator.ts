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

const updateWatchValidator = joi.object({
    bodyData: joi.object({
        glucoseMonitor: joi.boolean().required(),
        dailyGlucoseLevel: joi.boolean().required(),
        respiratoryRate: joi.boolean().required(),
        heartrate: joi.boolean().required(),
        weight: joi.boolean().required(),
    }).required(),
    activityData: joi.object({
        dailyCalorieGoal: joi.boolean().required(),
        caloriesBurned: joi.boolean().required(),
        distanceTraveled: joi.boolean().required(),
        steps: joi.boolean().required(),
        activeTime: joi.boolean().required(),
    }).required(),
    nutritionData: joi.object({
        dailyMacroGoal: joi.boolean().required(),
        targetDailyNutrients: joi.boolean().required(),
        calorieBreakdown: joi.boolean().required(),
        caloriesConsumed: joi.boolean().required(),
    }).required(),
})
export const validateCreateWatch = validateRequest(createWatchValidator);
export const validateUpdateWatch = validateRequest(updateWatchValidator);