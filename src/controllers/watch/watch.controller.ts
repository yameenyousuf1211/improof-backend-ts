import { NextFunction, Request, Response } from "express";
import { asyncHandler, generateResponse } from "../../utils/helpers";
import { createWatch, deleteWatch, findWatches, topWatches, updateWatch } from "../../models";

export const attachWatch = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    req.body.user = req.user._id;
    const watch = await createWatch(req.body);
    generateResponse(watch, `Watch created`, res);
})

export const getWatch = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const watch = await findWatches({user:req.user._id});
    generateResponse(watch, `Watch Fetched`, res);
})

export const updateWatches = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user._id; 

    const watches = await findWatches({ user: userId, _id: { $ne: req.params.id } });
    
    const watch = await updateWatch({ _id: req.params.id }, req.body);
    generateResponse(watch, `Watch updated`, res);
});

export const deleteWatches = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const watch = await deleteWatch({_id:req.params.id})
    generateResponse(watch, `Watch deleted`, res);
})


export const getTopThreeWatches = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const data = await topWatches();
    generateResponse(data, `Top three watches fetched`, res);
})