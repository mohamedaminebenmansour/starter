const express = require('express');
const userController = require('./../contorollers/userController');
const authController = require('./../contorollers/authController');
const router =express.Router(); 

router.post('/signup',authController.signup);
router.post('/login',authController.login);

router.post('/forgetPassword',authController.forgotPasswrd);
router.post('/resetPassword',authController.resetPassword);


router
    .route('/')
    .get(userController.getAllUsers)
    .post(userController.createUser)

router
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser)

module.exports =router;