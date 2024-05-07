import { Request, Response, NextFunction, RequestHandler } from 'express';
import { createUser, findUser } from '../models';
import { hash } from 'bcrypt';
import { ROLES } from './constants';

// generate response with status code
export const generateResponse = (data: any, message: string, res: Response, code = 200) => {
    return res.status(code).json({
        statusCode: code,
        message,
        data,
    });
}

// parse body to object or json (if body is string)
export const parseBody = (body: any) => {
    if (typeof body === 'string') {
        return JSON.parse(body);
    }

    return body;
}

// pagination with mongoose paginate library
export const getMongoosePaginatedData = async (
    {
        model, page = 1, limit = 10, query = {}, populate = '', select = '-password', sort = { createdAt: -1 },
    }:
        {
            model: any,
            page?: number,
            limit?: number,
            query?: Record<string, any>,
            populate?: string | any[],
            select?: string,
            sort?: Record<string, any>,
        }) => {
    const options = {
        select,
        sort,
        populate,
        lean: true,
        page,
        limit,
        customLabels: {
            totalDocs: 'totalItems',
            docs: 'data',
            limit: 'perPage',
            page: 'currentPage',
            meta: 'pagination',
        },
    };

    const { data, pagination } = await model.paginate(query, options);
    delete pagination?.pagingCounter;

    return { data, pagination };
}

// aggregate pagination with mongoose paginate library
// export const getMongooseAggregatePaginatedData = async ({ model, page = 1, limit = 10, query = [] }) => {
//     const options = {
//         page,
//         limit,
//         customLabels: {
//             totalDocs: 'totalItems',
//             docs: 'data',
//             limit: 'perPage',
//             page: 'currentPage',
//             meta: 'pagination',
//         },
//     };

//     const myAggregate = model.aggregate(query);
//     const { data, pagination } = await model.aggregatePaginate(myAggregate, options);

//     delete pagination?.pagingCounter;

//     return { data, pagination };
// }

export const asyncHandler = (requestHandler: RequestHandler) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
    };
};

// create default admin
export const createDefaultAdmin = async () => {
    try {
        const userExist = await findUser({ email: process.env.ADMIN_DEFAULT_EMAIL, role: ROLES.ADMIN });
        if (userExist) {
            console.log('admin exists ->', userExist.email);
            return
        };

        console.log('admin not exist');
        const password = await hash(process.env.ADMIN_DEFAULT_PASSWORD as string, 10);

        // create default admin
        await createUser({
            name: 'Admin',
            email: process.env.ADMIN_DEFAULT_EMAIL,
            password,
            role: ROLES.ADMIN
        });

        console.log('Admin default created successfully');
    } catch (error) {
        console.log('error - create default admin -> ', error);
    }
};

export const hashPassword = (password:string) => {
    const hashedPassword = hash(password, 10);
    return hashedPassword;
}