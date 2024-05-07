import { Request, Response, NextFunction } from "express";
import { asyncHandler, generateResponse, hashPassword, parseBody } from "../../utils/helpers";
import {  createUser, findUser, getAllUsers, updateUser } from "../../models";
import { generateRandomOTP, REGISTER_TYPE, ROLES, STATUS_CODES } from "../../utils/constants";
import { IUser } from "../../interface";
import jwt from 'jsonwebtoken';
// register user

export const register = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    const userExists = await findUser({ email: req.body?.email });

    if (userExists) return next({
        statusCode: STATUS_CODES.CONFLICT,
        message: "User already exists",
    });

    // hash password
    req.body.password = await hashPassword(req.body.password);

    const user = await createUser(req.body);

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save();

    req.session = { accessToken };

    generateResponse({ user, accessToken,refreshToken }, "Register successful", res);
});

// login user
export const login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    const body = parseBody(req.body);

    let user = await findUser({ email: body?.email }).select('+password');

    if (!user) return next({
        statusCode: STATUS_CODES.BAD_REQUEST,
        message: 'Invalid email or password'
    });

    const isMatch = await user.isPasswordCorrect(body.password);

    if (!isMatch) return next({
        statusCode: STATUS_CODES.UNAUTHORIZED,
        message: 'Invalid password'
    });

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save();

    req.session = { accessToken };

    // remove password
    user = user.toObject();
    delete user.password;

    generateResponse({ user, accessToken,refreshToken }, 'Login successful', res);
});

export const resetPasswordLink = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    
    const user = await findUser({ email: req.body?.email })

    if (!user) {
        return next({
            statusCode: STATUS_CODES.NOT_FOUND,
            message: 'User not found'
        });
    }


    // Respond with success message
    generateResponse(req.body.link, 'OTP sent to email', res);
})

// verify otp
export const verifyOTP = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { email, otp } = req.body;

    // Find user by email
    const user = await findUser({ email }).select('+otp').select('+otpExpiresAt');

    if (!user) {
        return next({
            statusCode: STATUS_CODES.NOT_FOUND,
            message: 'User not found'
        });
    }

    // Check if OTP matches
    if (user.otp !== parseInt(otp)) {
        return next({
            statusCode: STATUS_CODES.BAD_REQUEST,
            message: 'Invalid OTP'
        });
    }

    // Check if OTP has expired
    if (user.otpExpiresAt < new Date()) {
        return next({
            statusCode: STATUS_CODES.BAD_REQUEST,
            message: 'OTP has expired'
        });
    }

    // Clear OTP and OTP expiry in user's record
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    const token = await user.generateAccessToken();

    // Respond with success message
    generateResponse(token, 'OTP verified successfully', res);
})

// reset password 
export const resetPassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    
    const user = await findUser({ email: req.user.email }).select('+password');    
    user.password = await hashPassword(req.body.password);
    await user.save();

    generateResponse(null, 'Password reset successful', res);
})

// change password
export const changePassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        
        const user = await findUser({ email: req.user.email }).select('+password');    
        
        const isMatch = await user.isPasswordCorrect(req.body.oldPassword);
    
        if (!isMatch) return next({
            statusCode: STATUS_CODES.UNAUTHORIZED,
            message: 'Invalid password'
        });
        
        user.password = await hashPassword(req.body.newPassword);
        await user.save();
        
        generateResponse(null, 'Password changed successfully', res);
    })


export const googleSignup = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    
    const isUserExist = await findUser({ email: req.body.email });

    if(isUserExist) return next({
        statusCode: STATUS_CODES.CONFLICT,
        message: 'User already exists'
    })

    req.body.registerType = REGISTER_TYPE.GOOGLE;

    const user = await createUser(req.body);

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    
    user.refreshToken = refreshToken;
    
    await user.save();

    req.session = { accessToken };

    generateResponse({ user, accessToken,refreshToken }, "Register successful", res);
});

export const googleLogin = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    const { email, socialId } = req.body;

    // Find user by email
    const user = await findUser({ email });

    if (!user) {
      return next({
        statusCode: STATUS_CODES.NOT_FOUND,
        message: "User not found."
      });
    }

    // Check if the user is registered manually
    if (user.registerType != 'google') {
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save();
      return generateResponse({ accessToken, user }, "Login successful.", res);
    }

    // Check if the socialId matches
    if (user.socialId !== socialId) {
      return next({
        statusCode: STATUS_CODES.BAD_REQUEST,
        message: "Social id does not match."
      });
    }


    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save();

    req.session = { accessToken };

    generateResponse({ user, accessToken,refreshToken }, 'Login successful', res);
});

export const facebookSignup = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        
        const isUserExist = await findUser({ email: req.body.email });
    
        if(isUserExist) return next({
            statusCode: STATUS_CODES.CONFLICT,
            message: 'User already exists'
        })
    
        req.body.registerType = REGISTER_TYPE.FACEBOOK;
    
        const user = await createUser(req.body);
    
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();
        
        user.refreshToken = refreshToken;
        
        await user.save();
    
        req.session = { accessToken };
    
        generateResponse({ user, accessToken,refreshToken }, "Register successful", res);
    });

export const facebookLogin = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
            
            const { email, socialId } = req.body;
        
            // Find user by email
            const user = await findUser({ email });
        
            if (!user) {
            return next({
                statusCode: STATUS_CODES.NOT_FOUND,
                message: "User not found."
            });
            }
        
            // Check if the user is registered manually
            if (user.registerType != 'facebook') {
                const accessToken = await user.generateAccessToken();
                const refreshToken = await user.generateRefreshToken();
                user.refreshToken = refreshToken;
                await user.save();
                generateResponse({ accessToken, user }, "Login successful.", res);
                return
            }
        
            // Check if the socialId matches
            if (user.socialId !== socialId) {
            return next({
                statusCode: STATUS_CODES.BAD_REQUEST,
                message: "Social id does not match."
            });
            }
        
        
            const accessToken = await user.generateAccessToken();
            const refreshToken = await user.generateRefreshToken();
        
            user.refreshToken = refreshToken;
            await user.save();
        
            req.session = { accessToken };
        
            generateResponse({ user, accessToken,refreshToken }, 'Login successful', res);
        });


export const appleSignup = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
 
    const isUserExist = await findUser({ socialId: req.body.socialId });

    if(isUserExist) return next({
        statusCode: STATUS_CODES.CONFLICT,
        message: 'User already exists'
    })

    req.body.registerType = REGISTER_TYPE.APPLE;
    const user = await createUser(req.body);

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save();

    generateResponse({user,accessToken}, "Register successful", res);

})       

export const appleLogin = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        
        const { socialId } = req.body;
    
        // Find user by socialId
        const user = await findUser({ socialId });
    
        if (!user) {
        return next({
            statusCode: STATUS_CODES.NOT_FOUND,
            message: "User not found."
        });
        }
    
       
        // Check if the socialId matches
        if (user.socialId !== socialId) {
        return next({
            statusCode: STATUS_CODES.BAD_REQUEST,
            message: "Social id does not match."
        });
        }
    
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();
    
        user.refreshToken = refreshToken;
        await user.save();
    
        req.session = { accessToken };
    
        generateResponse({ user, accessToken,refreshToken }, 'Login successful', res);
    })

export const logout = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    req.session = null;
    generateResponse(null, 'Logout successful', res);
})


export const getRefeshToken = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { refreshToken } = req.body;

    const decodedRefreshToken = decodeRefreshToken(refreshToken);

    if (!decodedRefreshToken) {
        return next({
            statusCode: STATUS_CODES.UNAUTHORIZED,
            message: 'Invalid refresh token'
        })
    }

    
    const user = await findUser({ _id: decodedRefreshToken._id});

    if (!user) {
        return next({
            statusCode: STATUS_CODES.NOT_FOUND,
            message: 'user not found'
        })
    }

    const newRefreshToken = await user.generateRefreshToken();
    const accessToken = await user.generateAccessToken();

    user.refreshToken = newRefreshToken;
    await user.save();

    generateResponse({ refreshToken: newRefreshToken, accessToken }, 'Refresh token generated successfully', res);
});


function decodeRefreshToken(refreshToken: string): { _id: string } | null {
    try {
        const decoded = jwt.verify(refreshToken, 'secret') as { _id: string };
        return decoded;
    } catch (error) {
        return null;
    }
}