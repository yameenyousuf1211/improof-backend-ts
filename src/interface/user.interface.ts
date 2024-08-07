import { Document } from "mongoose";

declare global {
    namespace Express {
        interface Request {
            user: { _id: string, role: string, email: string, socialId: string };
        }
    }
}

export interface IUser extends Document {
    _id?: string;
    name?: string;
    username?:string;
    firstName: string;
    lastName: string;
    profileCompleted?: boolean;
    calculateMacroFromWeight?: boolean;
    age?: number;
    otp?:number;
    otpExpireAt?:Date;
    email: string;
    role: string;
    password?: string;
    photo?: string;
    heightValue?: string;
    fcmToken?: string;
    createdAt?: Date;
    updatedAt?: Date;
    phone?: string;
    dob?: Date;
    whyUseIamproof?: string;
    heightUnit?: string;
    weightValue?: number;
    weightUnit?: string;
    gender?: string;
    stepsGoal?: number;
    nutritionGoal?: number;
    goalWeight?: number;
    inches?: number;
    isDeleted: boolean;
    isBlocked?: boolean;
    goalWeightUnit?: string;
    activityLevel?: string;
    isActive?: boolean;
    location?: {
        type: string;
        coordinates: [number, number];
    };
    wearable?: string;
    dailyCaloriesConsume?: number;
    dailyFatConsume?: number;
    dailyProteinConsume?: number;
    dailyCarbsConsume?: number;
    address?: string;
    fcmTokens?: string[];
    online?: boolean;
    refreshToken?: string;
    socialId?: string;
    fat?: number;
    carbs?: number;
    protein?: number;
    registerType?: string;
    profileComplete?: boolean;
    terraUserId?: string;
    terraRefId?: string;
    totalBurnedCalories?: number;
    averageGlucose?: number;
    highestGlucose?: number;
    lowestGlucose?: number;
    glucose?: number;
}