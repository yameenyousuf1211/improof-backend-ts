import { NextFunction, Request, Response } from "express";
import { asyncHandler, generateResponse } from "../../utils/helpers";
import { createDataType, getAllDataTypes, getDataType, updateDataType } from "../../models/types/type.model";
import mongoose, { PipelineStage } from "mongoose";

export const createType = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    req.body.user = req.user._id;
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

    const types = await getAllDataTypes({ query, page, limit });
    generateResponse(types, `Types fetched`, res);
})

export const updateTypePosition = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const type = await updateDataType(req.params.id, req.body);
    generateResponse(type, `Type position updated`, res);
})