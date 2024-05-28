import joi from 'joi';
import { validateRequest } from '../../middlewares/validation.middleware';

const selectWearableValidator = joi.object({
    wearable: joi.string().required(),
});

const createProfileValidator = joi.object({
    username: joi.string().required(),
    age: joi.number().required(),
    heightValue: joi.number().required(),
    inches: joi.number().optional(),
    heightUnit: joi.string().valid('cm','in').required(),
    weightValue: joi.number().required(),
    weightUnit: joi.string().valid('kg', 'lbs').required(),
    gender: joi.string().valid('male','female').required(),
    stepsGoal: joi.number().required(),
    goalWeight: joi.number().required(),
    goalWeightUnit: joi.string().valid('kg', 'lbs').required(),
    activityLevel: joi.string().valid('daily', 'often', 'sometimes', 'rarely').required(),
    whyUseIamproof: joi.string().required(),
    address: joi.string().required(),
    dob: joi.date().required(),
    calculateMacroFromWeight: joi.boolean().required(),

   dailyCaloriesConsume: joi.number().when("calculateMacroFromWeight", {
       is: false,
       then: joi.required(),
       otherwise: joi.forbidden()
   }),
   dailyFatConsume: joi.number().when("calculateMacroFromWeight", {
       is: false,
       then: joi.required(),
       otherwise: joi.forbidden(),
   }),
   dailyProteinConsume: joi.number().when("calculateMacroFromWeight", {
       is: false,
       then: joi.required(),
       otherwise: joi.forbidden(),
   }),
   dailyCarbsConsume: joi.number().when("calculateMacroFromWeight", {
       is: false,
       then: joi.required(),
       otherwise: joi.forbidden(),
   }),    
})

const updateProfileValidator = joi.object({ 
    firstName: joi.string().optional(),
    lastName: joi.string().optional(),
    inches:joi.number().optional(),
    phone: joi.string().min(6).optional(),
    email: joi.string().email().optional().trim(),
    dob: joi.date().optional(),
    age: joi.number().optional(),
    heightValue: joi.number().required(),
    heightUnit: joi.string().valid('cm','in').required(),
    weightValue: joi.number().required(),
    weightUnit: joi.string().valid('kg', 'lbs').required(),
    // activityLevel: joi.string().valid('daily', 'often', 'sometimes', 'rarely').required(),
    gender: joi.string().valid('male','female').required(),
    address: joi.string().optional(),

})
const editGoalValidator = joi.object({
    inches: joi.number().optional(),
    stepsGoal: joi.number().optional(),
    goalWeight: joi.number().optional(),
     activityLevel: joi.string().valid('daily', 'often', 'sometimes', 'rarely').required(),
     goalWeightUnit: joi.string().valid('kg', 'lbs').optional(),
     calculateMacroFromWeight: joi.boolean().optional(),

    dailyCaloriesConsume: joi.number().when("calculateNutritionGoal", {
        is: false,
        then: joi.required(),
        otherwise: joi.optional().allow(null),
    }),
    dailyFatConsume: joi.number().when("calculateNutritionGoal", {
        is: false,
        then: joi.required(),
        otherwise: joi.optional().allow(null),
    }),
    dailyProteinConsume: joi.number().when("calculateNutritionGoal", {
        is: false,
        then: joi.required(),
        otherwise: joi.optional().allow(null),
    }),
    dailyCarbsConsume: joi.number().when("calculateNutritionGoal", {
        is: false,
        then: joi.required(),
        otherwise: joi.optional().allow(null),
    }),    
})
export const createProfileValidation = validateRequest(createProfileValidator);
export const updateProfileValidation = validateRequest(updateProfileValidator);
export const selectWearableValidation = validateRequest(selectWearableValidator);
export const editGoalValidation = validateRequest(editGoalValidator);