const {promisify} = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const dotenv = require('dotenv');


dotenv.config({path: './config.env'});

const signToken = id =>{
    return jwt.sign({id:id},process.env.JWT_SECRET,{
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};


exports.signup = catchAsync(async (req, res, next) => {
    //this is line is not secure because everything is request body
    //const newUser = await User.create(req.body);
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        photo: req.body.photo,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    });
    console.log(process.env.JWT_EXPIRES_IN)
    const token = signToken(newUser._id) ;
    res.status(201).json({
        status: 'ok',
        token: token,
        data: {
            user: newUser
        }
    })
});

exports.login = catchAsync(async (req, res, next) => {
    const {email,password}= req.body;
    // 1) Check if email and password exist
    if(!email || !password){
        return next(new AppError('Please provide email and password!',400));
    }
    // 2) Check if user exists and password is correct
    const user = await User.findOne({email: email}).select('+password');

    if(!user || !await user.correctPassword( password , user.password)){
        return next(new AppError('Incorrect email or password!',401));
    }

    // 3) If everything is ok, send token to client
    const token =signToken(user._id);
    res.status(200).json({
        status: 'ok',
        token: token
    })
});

exports.protect = catchAsync(async(req, res, next) => {
    // 1) Getting token and chek of it's exist
    let token;
    console.log(req.headers.authorization && req.headers.authorization.startsWith('Bearer '))
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer ')){
        token = req.headers.authorization.split(' ')[1];
        
    }
    if(!token){
        console.log('!Token')
        return next(new AppError('You are not logged in!',401));//401 unauthrozed
    }
    
    // 2) Verfication token 
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    
    // 3) Check if user stil exists

    // 4) check if user changed passwrd after the token was issued

    next();
})