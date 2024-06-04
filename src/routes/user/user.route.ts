import { Router } from "express";
import { checkUsername, createProfile, currentUser, editGoals, fetchAllUsers, getUserCalories, selectWearable, updateProfile } from "../../controllers";
import authMiddleware from "../../middlewares/auth.middleware";
import { ROLES } from "../../utils/constants";
import { calorieIntakeValidation, createProfileValidation, editGoalValidation, selectWearableValidation, updateProfileValidation } from "../../validator";

export default class UserAPI {
    constructor(private readonly router: Router) {
        this.router = Router();
        this.setupRoutes();
    }

    setupRoutes() {
        this.router.get('/all-users', fetchAllUsers);
        
        this.router.get('/', authMiddleware(Object.values(ROLES)),currentUser);
        this.router.post('/check/username/unique',checkUsername);
        this.router.post('/profile/create',authMiddleware(Object.values(ROLES)), createProfileValidation,createProfile);
        this.router.put('/profile/update',authMiddleware(Object.values(ROLES)),updateProfileValidation,updateProfile);
        this.router.put('/wearable',authMiddleware(Object.values(ROLES)),selectWearableValidation,selectWearable);
        this.router.put('/edit-goal',authMiddleware(Object.values(ROLES)),editGoalValidation,editGoals);
        this.router.post('/calories/calculation',authMiddleware(Object.values(ROLES)),calorieIntakeValidation,getUserCalories)
    }

    getRouter() {
        return this.router;
    }

    getRouterGroup() {
        return '/user';
    }
}