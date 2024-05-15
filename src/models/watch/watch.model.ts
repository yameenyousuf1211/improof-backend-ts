import mongoose, { Schema, Document } from 'mongoose';

// Define the schema for the watch data
interface IWatchData extends Document {
    user: string;
    watch: string;
    bodyData: {
        glucoseMonitor: boolean;
        dailyGlucoseLevel: boolean;
        respiratoryRate: boolean;
        heartrate: boolean;
        weight: boolean;
    };
    activityData: {
        dailyCalorieGoal: boolean;
        caloriesBurned: boolean;
        distanceTraveled: boolean;
        steps: boolean;
        activeTime: boolean;
    };
    nutritionData: {
        dailyMacroGoal: boolean;
        targetDailyNutrients: boolean;
        calorieBreakdown: boolean;
        caloriesConsumed: boolean;
    };
    createdAt: Date;
    terraRefId: string;
    terrauserId: string;
}

// Create the schema
const WatchDataSchema: Schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'users'},
    watch: { type: String },
    bodyData: {
        glucoseMonitor: { type: Boolean },
        dailyGlucoseLevel: { type: Boolean },
        respiratoryRate: { type: Boolean },
        heartrate: { type: Boolean },
        weight: { type: Boolean },
    },
    activityData:{
        dailyCalorieGoal:{type:Boolean} ,
        caloriesBurned:{type:Boolean} ,
        distanceTraveled:{type:Boolean} ,
        steps:{type:Boolean}, 
        activeTime:{type:Boolean}
    },
    nutritionData:{
        dailyMacroGoal:{type:Boolean},
        targetDailyNutrients:{type:Boolean},
        calorieBreakdown:{type:Boolean},
        caloriesConsumed:{type:Boolean} 
    },
    isDeleted:{type:Boolean},
    createdAt: { type: Date, default: Date.now },
    terraRefId: { type: String },
    terraUserId:{type:String}
});

// Create the model
const WatchDataModel = mongoose.model<IWatchData>('WatchData', WatchDataSchema);
export const createWatch = (payload:IWatchData) => WatchDataModel.create(payload);
export const findWatch = (query:any) => WatchDataModel.findOne(query);
export const findWatches = (query?:any) => WatchDataModel.find(query);
export const updateWatch = (query:any, update:any) => WatchDataModel.updateOne(query,update)
export const deleteWatch = (query:any) => WatchDataModel.deleteOne(query)

