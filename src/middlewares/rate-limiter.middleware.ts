import { RateLimitRequestHandler, rateLimit } from "express-rate-limit";
import { STATUS_CODES } from "../utils/constants";

export const rateLimiter: RateLimitRequestHandler = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // Limit each IP to 500 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    keyGenerator: (req, res): any => {
        // console.log('req.clientIp from rateLimiter >>>> ', req.clientIp);
        return req.clientIp; // IP address from requestIp.mw(), as opposed to req.ip
    },
    handler: (req, res, next, options) => {
        next({
            statusCode: STATUS_CODES.TOO_MANY_REQUESTS,
            message: `Too many requests, You are only allowed ${options?.max} requests per ${options.windowMs / 60000} minutes`
        });
    },
});