import { IUser } from "../interface";

export enum STATUS_CODES {
    SUCCESS = 200,
    CREATED = 201,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    PAYMENT_REQUIRED = 402,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    CONFLICT = 409,
    UNPROCESSABLE_ENTITY = 422,
    TOO_MANY_REQUESTS = 429,
    INTERNAL_SERVER_ERROR = 500
}

export enum ROLES {
    USER = 'user',
    ADMIN = 'admin',
    SUB_ADMIN = "sub-admin"

}

  
  export const REGISTER_TYPE = Object.freeze({
    GOOGLE: "google",
    FACEBOOK: "facebook",
    APPLE: "apple",
    MANUAL: "manual",
  });
export const HEIGHT_UNITS = Object.freeze({
    METRIC: 'cm',
    IMPERIAL: 'in'
  });
  
  // Define and freeze  for weight units
   export const WEIGHT_UNITS = Object.freeze({
    METRIC: 'kg',
    IMPERIAL: 'lbs',
  });
  
  // Define and freeze  for gender
   export const GENDER_TYPES = Object.freeze({
    MALE: 'male',
    FEMALE: 'female',
  });
  
  // Define and freeze  for activity levels
export const ACTIVITY_LEVELS = Object.freeze({
    NEVER:"never",
    DAILY: 'daily',
    OFTEN: 'often',
    SOMETIMES:'sometimes',
    RARELY: 'rarely',
  });

  export const generateRandomOTP = () => {
    return Math.floor(100000 + Math.random() * 900000);
}

 const calculateBMR = (user: any) => {
  let bmr;
  let weightInKg;
  let heightInInches;

  if (user.weightUnit === 'lbs') {
      weightInKg = user.weightValue! * 0.453592;
  } else {
      weightInKg = user.weightValue;
  }

    if (user.heightUnit === 'cm') {
      heightInInches = Number(user.heightValue) * 0.393701;
    } else {
      heightInInches = (Number(user.heightValue) * 12) + (user.inches || 0);
    }
    if (user.gender === 'male') {
      bmr = 66.47 + (13.75 * weightInKg!) + (5.003 * heightInInches) - (6.755 * user.age!);
    } else {
      bmr = 655.1 + (9.563 * weightInKg!) + (1.850 * heightInInches) - (4.676 * user.age!);
    }
  return bmr;
};

const calculateTDEE = (user: IUser, bmr: number) => {
  let tdee;
  if (user.activityLevel == 'never') { // sedentary
    tdee = bmr * 1.2;
  } else if (user.activityLevel == 'rarely') { // lightly active
    tdee = bmr * 1.375;
  } else if (user.activityLevel == 'sometimes') { // moderately active
    tdee = bmr * 1.55;
  } else if (user.activityLevel == 'often') { // very active
    tdee = bmr * 1.725;
  } else if (user.activityLevel == 'daily') { // extra active
    tdee = bmr * 1.9;
  }
  return tdee;
};


export const calculateMacro = (user: IUser) => {
  let bmr;
  let tdee;

  bmr = calculateBMR(user);
  tdee = calculateTDEE(user, bmr);
  
  let calorieIntake = tdee;
  if(user.goalWeight){
    if (user.goalWeight > user.weightValue!) {
      // User wants to gain weight
      calorieIntake = tdee! + 500;
    } else if (user.goalWeight < user.weightValue!) {
      // User wants to lose weight
      calorieIntake = tdee! - 500;
    } 
  }

  const protein = Math.round((0.3 * calorieIntake!) / 4);
  const fat = Math.round((0.25 * calorieIntake!) / 9);
  const carbs = Math.round((0.45 * calorieIntake!) / 4);

  return { protein, fat, carbs,calorieIntake };
}

export const calculateMacroFromCalories = function (dailyCaloriesConsume: number,dailyFatConsume: number,dailyProteinConsume: number,dailyCarbsConsume: number) {
  

  // } else if (goalWeightUnit.toLowerCase() === 'lbs') {
  //     dailyGoalWeight *= 453.592; // Convert lbs to grams
  // }

  // Calculate total daily calories needed based on goal weight
  const tdee = dailyCaloriesConsume;

  const fatGrams = (dailyFatConsume! / 100) * tdee! / 9; // 1 gram of fat = 9 calories
  const proteinGrams = (dailyProteinConsume! / 100) * tdee! / 4; // 1 gram of protein = 4 calories
  const carbGrams = (dailyCarbsConsume! / 100) * tdee! / 4; // 1 gram of carbohydrate = 4 calories

  return {
      fat: fatGrams,
      protein: proteinGrams,
      carbs: carbGrams
  };
};

export const lookupFields = [
  'bodyData.dailyGlucoseLevel.watch',
  'bodyData.glucoseMonitor.watch',
  'bodyData.respiratoryRate.watch',
  'bodyData.heartrate.watch',
  'bodyData.weight.watch',
  'activityData.steps.watch',
  'activityData.activeTime.watch',
  'activityData.caloriesBurned.watch',
  'activityData.distanceTraveled.watch',
  'nutritionData.caloriesConsumed.watch',
  'nutritionData.dailyCalorieGoal.watch',
  'nutritionData.dailyMacroGoal.watch',
  'nutritionData.targetDailyNutrients.watch',
  'nutritionData.calorieBreakdown.watch',
];
