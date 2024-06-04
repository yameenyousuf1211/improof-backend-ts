import joi from 'joi';
import { validateRequest } from '../../middlewares/validation.middleware';

const selectTypeValidator = joi.object({
    user: joi.string().hex().length(24),
    bodyData: joi.object({
        glucoseMonitor: joi.object({
            watch: joi.string().hex().length(24),
            active: joi.boolean(),
            col: joi.number(),
            row: joi.number(),
        }).optional(),
        dailyGlucoseLevelReport: joi.object({
            watch: joi.string().hex().length(24),
            active: joi.boolean(),
            col: joi.number(),
            row: joi.number(),
        }).optional(),
        respiratoryRate: joi.object({
            watch: joi.string().hex().length(24),
            active: joi.boolean(),
            col: joi.number(),
            row: joi.number(),
        }).optional(),
        heartrate: joi.object({
            watch: joi.string().hex().length(24),
            active: joi.boolean(),
            col: joi.number(),
            row: joi.number(),
        }).optional(),
    }).optional(),
    activityData: joi.object({
        calories: joi.object({
            watch: joi.string().hex().length(24),
            active: joi.boolean(),
            col: joi.number(),
            row: joi.number(),
        }).optional(),
        steps: joi.object({
            watch: joi.string().hex().length(24),
            active: joi.boolean(),
            row: joi.number(),
            col: joi.number(),
        }).optional(),
        activeTime: joi.object({
            watch: joi.string().hex().length(24),
            active: joi.boolean(),
            col: joi.number(),
            row: joi.number(),
        }).optional(),
        caloriesConsumed: joi.object({
            watch: joi.string().hex().length(24),
            active: joi.boolean(),
            col: joi.number(),
            row: joi.number(),
        }).optional(),
        caloriesBurned: joi.object({
            watch: joi.string().hex().length(24),
            active: joi.boolean(),
            col: joi.number(),
            row: joi.number(),
        }).optional(),
        distanceTravel: joi.object({
            watch: joi.string().hex().length(24),
            active: joi.boolean(),
            col: joi.number(),
            row: joi.number(),
        }).optional(),
    }).optional(),
    nutritionData: joi.object({
        dailyMacroGoal: joi.object({
            watch: joi.string().hex().length(24),
            active: joi.boolean(),
            col: joi.number(),
            row: joi.number(),
        }).optional(),
        targetDailyNutrients: joi.object({
            watch: joi.string().hex().length(24),
            active: joi.boolean(),
            col: joi.number(),
            row: joi.number(),
        }).optional(),
        calorieBreakdownMacro: joi.object({
            watch: joi.string().hex().length(24),
            active: joi.boolean(),
            col: joi.number(),
            row: joi.number(),
        }).optional(),
        weight: joi.object({
            watch: joi.string().hex().length(24),
            active: joi.boolean(),
            col: joi.number(),
            row: joi.number(),
        }).optional(),
    }).optional(),
});

export const dataTypeValidation = validateRequest(selectTypeValidator);