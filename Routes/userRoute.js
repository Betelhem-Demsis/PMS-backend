const express = require('express');
const userController = require('../Controllers/userController');

const router = express.Router();

router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.patch('/forgotPassword', userController.forgotPassword);
router.patch('/resetPassword', userController.resetPassword);

router.use(userController.protect);

router.patch('/updateMyPassword', userController.updatePassword);
router.get('/me', userController.getMe, userController.getUser);
router.patch('/updateme', userController.updateMe);
router.delete('/deleteme', userController.deleteMe);

router.use(userController.restrictTo('admin'));

router
  .route('/')
  .get(userController.getAllUser)  
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
