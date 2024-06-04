import mongoose, { Schema, Document } from 'mongoose';

// Define the schema for the watch data
interface IWatchData extends Document {
    user: string;
    watch: string;
    icon:string;
    supportedTypes: {
        activity: boolean;
        body: boolean;
        nutrition: boolean;
        daily: boolean;
        sleep: boolean;
        menstruation: boolean;
      };
    createdAt: Date;
    updatedAt: Date;
    terraRefId: string;
    terrauserId: string;
}

// Create the schema
const WatchDataSchema: Schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'users'},
    watch: { type: String },
    icon:{type:String},
    supportedTypes:{
        activity:{type:Boolean},
        body:{type:Boolean},
        nutrition:{type:Boolean},
        daily:{type:Boolean},
        sleep:{type:Boolean},
        menstruation:{type:Boolean}
    },
    isDeleted:{type:Boolean},
    terraRefId: { type: String },
    terraUserId:{type:String}
},{timestamps:true});

// Create the model
const WatchDataModel = mongoose.model<IWatchData>('WatchData', WatchDataSchema);
export const createWatch = (payload:IWatchData) => WatchDataModel.create(payload);

export const findWatch = (query:any) => WatchDataModel.findOne(query);

export const findWatches = (query?:any) => WatchDataModel.find(query);
export const updateWatch = (query:any, update:any) => WatchDataModel.updateOne(query,update)
export const deleteWatch = (query:any) => WatchDataModel.deleteOne(query)

export const topWatches =  () => WatchDataModel.aggregate([
    {
        $group: {
            _id: "$watch",
            count: { $sum: 1 }
        }
    },
    { $sort: { count: -1 } },
    { $limit: 3 }
])