import { NextFunction, Request, Response } from "express";
import { asyncHandler, generateResponse } from "../../utils/helpers";
import { calculateMacro, calculateMacroFromCalories, ROLES, STATUS_CODES } from "../../utils/constants";
import { findUser, getAllUsers, updateUser } from "../../models";

export const selectWearable = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    const user = await findUser({ _id: req.user._id });

    if (!user) return next({
        status: STATUS_CODES.NOT_FOUND,
        message: 'User not found'
    });

    user.wearable = req.body.wearable;
    await user.save();

    generateResponse(user, 'Wearable selected successfully', res);
})

export const currentUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user = await findUser({ _id: req.user._id });
    generateResponse(user, 'User fetched successfully', res);
});

export const createProfile = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { calculateMacroFromWeight, dailyCarbsConsume, dailyCaloriesConsume, dailyFatConsume, dailyProteinConsume } = req.body;
    let data = {};
    req.body.profileCompleted = true;
    if (calculateMacroFromWeight) {
        const { carbs, fat, protein } = calculateMacro(req.body);
        data = { ...req.body, carbs, fat, protein };
    } else {
        const { carbs, fat, protein } = calculateMacroFromCalories(dailyCaloriesConsume, dailyFatConsume, dailyProteinConsume, dailyCarbsConsume);
       data = { ...req.body, carbs, fat, protein }; 
    }

    const payload = await updateUser({ _id: req.user._id }, data);
    generateResponse(payload, 'Profile created successfully', res);
});

export const updateProfile = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    if(req.body.email){
        const isUserExist = await findUser({ email: req.body.email, _id: { $ne: req.user._id } });
        if (isUserExist) return next({
            statusCode: STATUS_CODES.CONFLICT,
            message: 'Email already exists'
        })
    }

    const user = await updateUser({ _id: req.user._id }, req.body);
    generateResponse(user, 'Profile updated successfully', res);
});

export const editGoals = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    const { calculateMacroFromWeight, dailyCarbsConsume, dailyCaloriesConsume, dailyFatConsume, dailyProteinConsume } = req.body;
    const user = await findUser({ _id: req.user._id });

    let updatedGoals = {};
    console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
    console.log(req.body);
    
    // console.log(calculateMacroFromWeight, dailyCarbsConsume, dailyCaloriesConsume, dailyFatConsume, dailyProteinConsume);
    
    if (calculateMacroFromWeight) {
        const { carbs, fat, protein } = calculateMacro(user);
        updatedGoals = { ...req.body, carbs, fat, protein };
    } else {
        const { carbs, fat, protein } = calculateMacroFromCalories(dailyCaloriesConsume, dailyFatConsume, dailyProteinConsume, dailyCarbsConsume);
        updatedGoals = { ...req.body, carbs, fat, protein };
    }

    const data = await updateUser({ _id: req.user._id }, updatedGoals);
    generateResponse(data, 'Goals updated successfully', res);
});
// get all users

export const updateTerraRefId = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user = await updateUser({ _id: req.user._id }, req.body);
    generateResponse(user, 'Terra Ref Id updated successfully', res);
});

export const fetchAllUsers = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const page: number = +(req.query.page || 1);
    const limit: number = +(req.query.limit || 10);
    const search: string | undefined = req.query.search?.toString(); // Ensure search is treated as string or undefined
    let query: any = { role: { $ne: ROLES.ADMIN } }; // Define query as any type due to dynamic nature
    console.log(search);
    
    if (search) {
        query = {
            ...query,
                 email: { $regex: new RegExp(search, 'i') } 
        };
    }

    const usersData = await getAllUsers({ query, page, limit });

    if (!usersData || usersData.data.length === 0) {
        return generateResponse(null, 'No user found', res); // Handle case where no users are found
    }

    return generateResponse(usersData, 'List fetched successfully', res); // Return users data if found
});

export const checkUsername = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const username = req.body.username;
    const user = await findUser({ username: { $regex: new RegExp('^' + username + '$', 'i') } });

    if (user) return next({
        statusCode: STATUS_CODES.CONFLICT,
        message: 'username already exists'
    })

    generateResponse(null, 'Username available', res);
});

export const getUserCalories = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    const user = await findUser({ _id: req.user._id });
    const { calorieIntake, carbs, fat, protein } = calculateMacro(req.body);
    generateResponse({ calorieIntake, carbs, fat, protein }, 'Calories calculated successfully', res);
});

export const blockUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    const user = await updateUser({ _id: req.params.id }, { isBlocked: true });
    generateResponse(user, 'User blocked successfully', res);
})

export const unBlockUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    const user = await updateUser({ _id: req.params.id }, { isBlocked: false });
    generateResponse(user, 'User unblocked successfully', res);
})

