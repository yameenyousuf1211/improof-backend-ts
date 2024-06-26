import { Router } from "express";
import authMiddleware from "../../middlewares/auth.middleware";
import { ROLES } from "../../utils/constants";
import { createType, getType, getTypes, updateTypePosition } from "../../controllers/dataType/types.controller";
import { dataTypeValidation } from "../../validator/type/type.validator";

export default class DataTypeAPI {
    constructor(private readonly router: Router) {
        this.router = Router();
        this.setupRoutes();
    }

    setupRoutes() {
        this.router.get('/',authMiddleware(Object.values(ROLES)),getTypes);
        this.router.get('/:id',authMiddleware(Object.values(ROLES)),getType);
        this.router.post('/',authMiddleware(Object.values(ROLES)),dataTypeValidation,createType);
        this.router.put('/',authMiddleware(Object.values(ROLES)),dataTypeValidation,updateTypePosition);        
    }

    getRouter() {
        return this.router;
    }

    getRouterGroup() {
        return '/data-types';
    }
}