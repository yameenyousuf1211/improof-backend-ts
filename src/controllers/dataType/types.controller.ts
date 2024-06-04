import { NextFunction, Request, Response } from "express";
import { asyncHandler, generateResponse } from "../../utils/helpers";
import { createDataType, getAllDataTypes, getDataType, updateDataType } from "../../models/types/type.model";
import mongoose, { PipelineStage } from "mongoose";
import { STATUS_CODES, lookupFields } from "../../utils/constants";

export const createType = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    req.body.user = req.user._id;

    const checkIsTypeExist = await getDataType({user:req.user._id});
    
    if(checkIsTypeExist) return next({
        message: 'Data-Types already exist',
        statusCode:STATUS_CODES.BAD_REQUEST
    })
    
    const type  = await createDataType(req.body);
    generateResponse(null, `Type created`, res);
});

export const getType = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const type = await getDataType({user:req.user._id});
    generateResponse(type, `Type fetched`, res);
})

export const updateType = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const type = await updateDataType(req.params.id, req.body);
    generateResponse(type, `Type updated`, res);
})

export const getTypes = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const limit = parseInt(req.query.limit as string) || 10;
    const page = parseInt(req.query.page as string) || 1;

    const query:PipelineStage[] = [];
    
    query.push({$match:{user: new mongoose.Types.ObjectId(req.user._id as string)}});

      lookupFields.forEach(field => {
        query.push({
          $lookup: {
            from: 'watchdatas',
            localField: field,
            foreignField: '_id',
            as: field,
          },
        });
        query.push({
          $unwind: {
            path: `$${field}`,
            preserveNullAndEmptyArrays: true
          }
        });
      });

    const types = await getAllDataTypes({ query, page, limit });
    
    if(!types.data.length) return next({
        message: 'No types found',
        statusCode:STATUS_CODES.NOT_FOUND
    })

    generateResponse(types.data[0], `Types fetched`, res);
})

export const updateTypePosition = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const type = await updateDataType({user:req.user._id}, req.body);
    generateResponse(type, `Type position updated`, res);
})