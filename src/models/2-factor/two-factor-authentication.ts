import mongoose, { Schema, Document } from 'mongoose';

interface ITwoFactorAuthentication extends Document {
    security: boolean;
    otpCode: string;
    user:string
}

const TwoFactorAuthenticationSchema: Schema = new Schema({
    authenticationMethod: {
        type: String,
        enum:["text","email"],
    },
    otp: {
        type:Number,
    },
    otpExpiry:{
        type:Number
    },
    user:{
        type: Schema.Types.ObjectId,
        ref:"user"
    },
    verify:{
        type:Boolean,
        default:false
    },
    contact: {
        type: String,
        required: true,
    },

}, { timestamps: true,versionKey:false}
);

const TwoFactorAuthentication = mongoose.model<ITwoFactorAuthentication>('TwoFactorAuthentication',TwoFactorAuthenticationSchema);

export const updateTwoFactorAuthentication = (query: Record<string, any>, update: Record<string, any>): any => TwoFactorAuthentication.findOneAndUpdate(query, update, { upsert: true, new: true });
export const findUserTwoFactorAuthentication = (query: Record<string, any>): any => TwoFactorAuthentication.findOne(query);
export const deleteTwoFactorAuthentication = (query: Record<string, any>): any => TwoFactorAuthentication.findOneAndDelete(query);