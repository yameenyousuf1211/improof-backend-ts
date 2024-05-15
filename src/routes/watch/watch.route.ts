import { attachWatch, deleteWatches, getWatch, updateWatches,  } from "../../controllers";
import { Router } from "express";
import authMiddleware from "../../middlewares/auth.middleware";
import { ROLES } from "../../utils/constants";
import { validateCreateWatch, validateUpdateWatch } from "../../validator/watch/watch.validator";

export default class WatchAPI {
    constructor(private readonly router: Router) {
        this.router = Router();
        this.setupRoutes();
    }

    setupRoutes() {
        this.router.get('/',authMiddleware(Object.values(ROLES)) ,getWatch);
        this.router.post('/connect',authMiddleware(Object.values(ROLES)),validateCreateWatch,attachWatch);
        this.router.put('/:id',authMiddleware(Object.values(ROLES)),validateUpdateWatch,updateWatches);
        this.router.delete('/:id',authMiddleware(Object.values(ROLES)),deleteWatches)
    }

    getRouter() {
        return this.router;
    }

    getRouterGroup() {
        return '/watch';
    }
}