const {validationResult, body, param, query} = require("express-validator");

const validate = (req,res,next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }
    next();
};
const registerValidation = [
    body("firstName").trim().notEmpty().withMessage("First name is required").isLength({min: 2}).withMessage("First name must be at least 2 characters long"),
    body("lastName").optional().trim().isLength({min: 2}).withMessage("Last name must be at least 2 characters long"),
    body("email").trim().notEmpty().withMessage("Email is required").isEmail().withMessage("Invalid email format"),
    body("password").trim().notEmpty().withMessage("Password is required").isLength({min: 6}).withMessage("Password must be at least 6 characters long"),
    body("confirmPassword").trim().notEmpty().withMessage("Confirm password is required").custom((value, {req}) => {
        if(value !== req.body.password){
            throw new Error("Passwords do not match");
        }
        return true;
    })
];
const loginValidation = [
    body("email").trim().notEmpty().withMessage("Email is required").isEmail().withMessage("Invalid email format"),
    body("password").trim().notEmpty().withMessage("Password is required")
];
const forgotPasswordValidation = [
    body("email").trim().notEmpty().withMessage("Email is required").isEmail().withMessage("Invalid email format")
];
const resetPasswordValidation = [
    body("token").trim().notEmpty().withMessage("Reset token is required"),
    body("password").trim().notEmpty().withMessage("Password is required").isLength({min: 6}).withMessage("Password must be at least 6 characters long"),
    body("confirmPassword").trim().notEmpty().withMessage("Confirm password is required").custom((value, {req}) => {
        if(value !== req.body.password){
            throw new Error("Passwords do not match");
        }
        return true;
    })
];
const updateProfileValidation = [
    body("firstName").optional().trim().isLength({min: 2}).withMessage("First name must be at least 2 characters long"),
    body("lastName").optional().trim().isLength({min: 2}).withMessage("Last name must be at least 2 characters long"),
    body("email").optional().trim().isEmail().withMessage("Invalid email format")
];
const paginationValidation = [
    query("page").optional().isInt({min: 1}).withMessage("Page must be a positive integer"),
    query("limit").optional().isInt({min: 1}).withMessage("Limit must be a positive integer"),
    query("search").optional({ checkFalsy: true }).trim().isLength({min: 3}).withMessage("Search term must be at least 3 characters long")
];
module.exports = {
    validate,
    registerValidation,
    loginValidation,
    forgotPasswordValidation,
    resetPasswordValidation,
    updateProfileValidation,
    paginationValidation    
}