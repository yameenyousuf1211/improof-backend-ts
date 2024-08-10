import { Document, Schema, model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";
import { IPaginationFunctionParams, IPaginationResult } from "../../utils/interfaces";
import { ACTIVITY_LEVELS, GENDER_TYPES, HEIGHT_UNITS, REGISTER_TYPE, ROLES, WEIGHT_UNITS } from "../../utils/constants";
import { getMongoosePaginatedData } from "../../utils/helpers";
import { compare } from "bcrypt";
import { QueryWithHelpers } from "mongoose";
import { sign } from "jsonwebtoken";
import {IUser} from '../../interface/index'



const userSchema = new Schema<IUser>({
    username:{ type: String, default: null },
    firstName: { type: String, default: null },
    lastName: { type: String, default: null },
    name:{type:String ,default:null},
    phone: { type: String, default: null }, // for sub-admin
    dob: { type: Date, default: null },
    photo: { type: String, default: null },
    email: { type: String, lowercase: true, trim: true },
    age:{type:Number,default:null},
    heightValue: { type: Number, default: 0 },
    whyUseIamproof:{type:String,default:null},
    heightUnit: { type: String, enum: Object.values(HEIGHT_UNITS), default: HEIGHT_UNITS.IMPERIAL }, // 'cm' for metric, 'in' for Imperial
    weightValue: { type: Number, default: 0 },
    weightUnit: { type: String, enum: Object.values(WEIGHT_UNITS), default: WEIGHT_UNITS.IMPERIAL }, // 'kg' for metric, 'lbs' for Imperial
    gender:{type:String,enum:Object.values(GENDER_TYPES)},
    stepsGoal:{type:Number,default:0},
    nutritionGoal:{type:Number,default:0},
    goalWeight:{type:Number,default:0},
    inches:{type:Number,default:0},
    goalWeightUnit:{type:String,enum:Object.values(WEIGHT_UNITS),default:null},
    activityLevel:{type:String,enum:Object.values(ACTIVITY_LEVELS),default:null},
    password: { type: String},
    role: { type: String, default: "user", enum: Object.values(ROLES)},
    isActive: { type: Boolean, default: true },
    isBlocked: { type: Boolean, default: false },
    location: {
        type: { type: String, enum: ["Point"], default: "Point" },
        coordinates: { type: [Number, Number], default: [0, 0] },
    },
    wearable:{type:String,default:null},
    calculateMacroFromWeight:{type:Boolean,default:false},
    dailyCaloriesConsume:{type:Number,default:0},
    dailyFatConsume:{type:Number,default:0},
    dailyProteinConsume:{type:Number,default:0},
    dailyCarbsConsume:{type:Number,default:0},
    address: { type: String, default: null },
    fcmTokens: { type: [{ type: String }], default: [] },
    online: { type: Boolean, default: false },
    refreshToken: { type: String, select: false },
    socialId :{type:String,default:null},
    fat:{type:Number,default:0},
    carbs:{type:Number,default:0},
    protein:{type:Number,default:0},
    registerType : {type: String,default:REGISTER_TYPE.MANUAL, enum:Object.values(REGISTER_TYPE)},
    terraUserId: {type: String},
    terraRefId: {type:String},
    totalBurnedCalories:{type:Number},
    averageGlucose:{type:Number,default:0},
    highestGlucose:{type:Number,default:0},
    lowestGlucose:{type:Number,default:0},
    glucose :{type:Number,default:0},
    profileCompleted:{type:Boolean,default:false},
    isDeleted:{type:Boolean,default:false}
}, { timestamps: true, versionKey: false });

// hash password before saving
// userSchema.pre<IUser>("save", async function (next: any) {
//     if (!this.isModified("password")) return next();
//     this.password = await hash(this.password, 10);
//     next();
// });

userSchema.methods.isPasswordCorrect = async function (password: string): Promise<boolean> {
    return await compare(password, this.password);
};

userSchema.methods.generateAccessToken = function (): string {
    return sign(
        {
            _id: this._id,
            name: this.name,
            email: this.email,
            role: this.role,
            socialId:this.socialId
        },
        process.env.ACCESS_TOKEN_SECRET as string,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );
};

userSchema.methods.generateRefreshToken = function (): string {
    return sign(
        { _id: this._id },
        process.env.REFRESH_TOKEN_SECRET as string,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );
};

// mongoose pagination plugins
userSchema.plugin(mongoosePaginate);
userSchema.plugin(aggregatePaginate);

const UserModel = model("User", userSchema);

// create new user
export const createUser = (obj: Record<string, any>): Promise<any> => UserModel.create(obj);

// find user by query
export const findUser = (query: Record<string, any>): QueryWithHelpers<any, Document> => UserModel.findOne({...query,isDeleted:false});

export const updateUser = (query:Record<string,any>,update:Record<string,any>):QueryWithHelpers<any,Document> => UserModel.findOneAndUpdate({...query},update,{new:true});

// get all users
export const getAllUsers = async ({ query, page, limit, populate }: IPaginationFunctionParams)
    : Promise<IPaginationResult<IUser>> => {
    const { data, pagination }: IPaginationResult<IUser> = await getMongoosePaginatedData({
        model: UserModel, query, page, limit, populate
    });

    return { data, pagination };
};