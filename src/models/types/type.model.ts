import mongoose, { Schema, Document } from 'mongoose';
import mongoosePaginate from "mongoose-paginate-v2";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";
import { getMongooseAggregatePaginatedData } from "../../utils/helpers";
import { IPaginationFunctionParams, IPaginationResult } from '../../utils/interfaces';

interface IType extends Document {
    user: string
}

const TypeSchema: Schema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    bodyData: {
        glucoseMonitor: {
            watch: { type: Schema.Types.ObjectId, ref: 'WatchData',default:'' },
            active: {type:Boolean,default:false},
            col: {type:Number,default:1},
            row: {type:Number,default:1},
        },
        dailyGlucoseLevel: {
            watch: { type: Schema.Types.ObjectId, ref: 'WatchData' },
            active: {type:Boolean,default:false},
            col: {type:Number,default:2},
            row: {type:Number,default:1},
        },
        respiratoryRate: {
            watch: { type: Schema.Types.ObjectId, ref: 'WatchData' },
            active: {type:Boolean,default:false},
            col: {type:Number,default:3},
            row: {type:Number,default:1},
        },
        heartrate: {
            watch: { type: Schema.Types.ObjectId, ref: 'WatchData' },
            active: {type:Boolean,default:false},
            col: {type:Number,default:4},
            row: {type:Number,default:1},
        },
    },
    activityData: {
        calories: {
            watch: { type: Schema.Types.ObjectId, ref: 'WatchData' },
            active: {type:Boolean,default:false},
            col: {type:Number,default:1},
            row: {type:Number,default:2},
        },
        steps: {
            watch: { type: Schema.Types.ObjectId, ref: 'WatchData' },
            active: {type:Boolean,default:false},
            row: {type:Number,default:2}, 
            col: {type:Number,default:2},
        },
        activeTime: {
            watch: { type: Schema.Types.ObjectId, ref: 'WatchData' },
            active: {type:Boolean,default:false},
            col: {type:Number,default:3},
            row: {type:Number,default:2},
        },
        caloriesConsumed: {
            watch: { type: Schema.Types.ObjectId, ref: 'WatchData' },
            active: {type:Boolean,default:false},
            col: {type:Number,default:4},
            row: {type:Number,default:2},
        },
        caloriesBurned: {
            watch: { type: Schema.Types.ObjectId, ref: 'WatchData' },
            active: {type:Boolean,default:false},
            col: {type:Number,default:5},
            row: {type:Number,default:2},
        },
        distanceTravel:{
            watch: { type: Schema.Types.ObjectId, ref: 'WatchData' },
            active: {type:Boolean,default:false},
            col: {type:Number,default:6},
            row: {type:Number,default:2},
        }
    },
    nutritionData: {
        dailyMacroGoal: {
            watch: { type: Schema.Types.ObjectId, ref: 'WatchData' },
            active: {type:Boolean,default:false},
            col: {type:Number,default:1},
            row: {type:Number,default:3},
        },
        targetDailyNutrients: {
            watch: { type: Schema.Types.ObjectId, ref: 'WatchData' },
            active: {type:Boolean,default:false},
            col: {type:Number,default:2},
            row: {type:Number,default:3},
        },
        calorieBreakdownMacro: {
            watch: { type: Schema.Types.ObjectId, ref: 'WatchData' },
            active: {type:Boolean,default:false},
            col: {type:Number,default:3},
            row: {type:Number,default:3},
        },
        weight:{
            watch: { type: Schema.Types.ObjectId, ref: 'WatchData' },
            active: {type:Boolean,default:false},
            col: {type:Number,default:4},
            row: {type:Number,default:3},
        }
    }
}, { timestamps: true });

TypeSchema.plugin(mongoosePaginate);
TypeSchema.plugin(aggregatePaginate);

const TypeModel = mongoose.model<IType>('Type', TypeSchema);

export const createDataType = (obj:IType) => TypeModel.create(obj);
export const getDataType = (query:any) => TypeModel.findOne(query);
export const updateDataType = (query:any, obj:IType) => TypeModel.findOneAndUpdate(query, obj, {new:true});
export const deleteDataType = (id:string) => TypeModel.findByIdAndDelete(id);

export const getAllDataTypes = async ({ query, page, limit }: IPaginationFunctionParams)
    : Promise<IPaginationResult<IType>> => {
    const { data, pagination }: IPaginationResult<IType> = await getMongooseAggregatePaginatedData({
        model: TypeModel, query:[query], page, limit
    });

    return { data, pagination };
};