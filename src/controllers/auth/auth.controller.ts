import { Request, Response, NextFunction } from "express";
import { asyncHandler, generateResponse, hashPassword, parseBody } from "../../utils/helpers";
import {  createUser, deleteTwoFactorAuthentication, findUser, findUserTwoFactorAuthentication, getAllUsers, updateTwoFactorAuthentication, updateUser } from "../../models";
import { generateRandomOTP, REGISTER_TYPE, ROLES, STATUS_CODES } from "../../utils/constants";

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
    
    const user = await createUser({...req.body,fcmTokens:req.body.fcmToken});

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

    const checkTwoFactorAuthentication = await findUserTwoFactorAuthentication({ user: user._id })

    if(checkTwoFactorAuthentication && !checkTwoFactorAuthentication.verify) {
        req.user = user;
        return next({
            statusCode: STATUS_CODES.UNAUTHORIZED,
            message: 'Two factor authentication required'
        });
    }
    
    if(checkTwoFactorAuthentication){
        if(!user.fcmTokens.includes(body.fcmToken)) {
            req.user = user;
         return  enableTwoFactor(req,res,next);
        }
    }
  
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
    const {link} = req.body;

    if (!user) {
        return next({
            statusCode: STATUS_CODES.NOT_FOUND,
            message: 'User not found'
        });
    }
    // add accessToken
    const accessToken = user.generateAccessToken(user);
    // Respond with success message
    generateResponse({accessToken,link}, 'OTP sent to email', res);
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

export const enableTwoFactor = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { authenticationMethod,contact } = req.body;
 
    const otpCode = generateRandomOTP();
    const otpExpiry = Date.now() + 30000;

    if(authenticationMethod === 'text') {
        console.log("Send OTP code to phone number");
        // need twilio or any other service to send otp code to phone number
    }
    if(authenticationMethod === 'email') {
    console.log("Send OTP code to phone number");
    // need resend service to send code to email
    }

    await updateTwoFactorAuthentication({ user: req.user._id }, { authenticationMethod, otpCode, otpExpiry,contact,user: req.user._id});
    generateResponse({otpCode,otpExpiry,authenticationMethod}, 'Two factor authentication code sended', res);
})


export const verifyTwoFactor = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { otpCode } = req.body;

    const user = await findUser({ _id: req.user._id });
    const twoFactor = await findUserTwoFactorAuthentication({ user: user._id });

    if (!twoFactor) {
        return next({
            statusCode: STATUS_CODES.NOT_FOUND,
            message: 'Two factor authentication not enabled'
        })
    }

    if (twoFactor.otpCode !== otpCode) {
        return next({
            statusCode: STATUS_CODES.BAD_REQUEST,
            message: 'Invalid OTP code'
        })
    }

    if (twoFactor.otpExpiry < Date.now()) {
        return next({
            statusCode: STATUS_CODES.BAD_REQUEST,
            message: 'OTP code expired'
        })
    }

    await updateTwoFactorAuthentication({ user: user._id }, { verify: true });
   
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save();

    req.session = { accessToken };
    generateResponse({accessToken,refreshToken}, 'Two factor authentication verified', res);
})

export const disableTwoFactor = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user = await findUser({ _id: req.user._id });
    const data =  await deleteTwoFactorAuthentication({ user: user._id });

    if(!data) return next({
        statusCode: STATUS_CODES.NOT_FOUND,
        message: 'Two factor authentication not enabled'
    })
    generateResponse(data, 'Two factor authentication disabled', res);
})

export const deleteAccount = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    
    const isUserExist = await findUser({ _id: req.user._id });
    
    if(!isUserExist) return next({
        statusCode: STATUS_CODES.NOT_FOUND,
        message: 'User not found'
    });

    const user = await updateUser(
        { _id: req.user._id },
        { $set: { isDeleted: true } }
    );
    
    req.session = null;
    generateResponse(user, 'Account deleted successfully', res);
})
