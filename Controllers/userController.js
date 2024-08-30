const catchAsync = require("../utils/catchasync");
const User = require("../Models/userModel"); 
const AppError = require("../utils/appError");
const APIFeatures = require("../utils/features");
const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/mailer');

const filterObj = (obj, ...allowedFields) => {
    const newObj={}
    Object.keys(obj).forEach(el=>{
      if(allowedFields.includes(el)) newObj[el]=obj[el]
    })
    return newObj
  
  }

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createSendToken=(user,statusCode,res)=>{
  const token=signToken(user._id)
  const cookieOptions= {
    expires:new Date(Date.now()+process.env.JWT_COOKIE_EXPIRES_IN*24*60*60*1000), 
    httpOnly:true
   }
  if(process.env.NODE_ENV==='production') cookieOptions.secure=true
  res.cookie('jwt',token,cookieOptions)

  user.password=undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
}

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword
  });
  createSendToken(newUser,201,res);
});


exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;


  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  createSendToken(user,200,res);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;


  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access.', 401));
  }

 
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('The user belonging to this token no longer exists.', 401));
  }

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('User recently changed password! Please log in again.', 401));
  }

  req.user = currentUser;
  next();
});

exports.restrictTo=(...roles)=>{
  return(req,res,next)=>{
    if(!roles.includes(req.user.role)){
      return next(new AppError('You do not have permission to perform this action',403))
    }
    next()
  }
}

exports.forgotPassword=catchAsync(async(req,res,next)=>{
  const user=await User.findOne({email:req.body.email})
  if(!user){
    return next(new AppError('there is no user with this email address',404))
  }

  const resetToken=user.createPasswordResetToken()
  await user.save({validateBeforeSave:false});
  
  const resetURL=`${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`
  
  const message='forgot password? Submit a PATCH request with your new password and confirmPassword to: ${resetURL}.\nIf you did not forget your password, please ignore this email!'
 try{
  await sendEmail({
    email:user.email,
    subject:'your password reset token (valid for 10 min)',
    message
  })

  res.status(200).json({
  status:'success',
  message:'token sent to email'
  })
 }
 catch(err){
  user.PasswordResetToken=undefined;
  user.PasswordResetExpires=undefined;
  await user.save({validateBeforeSave:false});
  return next(new AppError('there was an error sending the email. Try again later!',500))
 }
 
})
exports.resetPassword=catchAsync(async (req,res,next)=>{
 const hashedToken=crypto.createHash('sha256').update(req.params.token).digest('hex')

 const user=await User.findOne({passwordResetToken: hashedToken, passwordResetExpires:{$gt:Date.now()}
 });

 if(!user){
  return next(new AppError('token is invalid',400))
 }
 user.password=req.body.password;
 user.confirmPassword=req.body.confirmPassword;
 user.passwordResetToken=undefined;
 user.passwordResetExpires=undefined;
 await user.save();
 createSendToken(user,200,res);
})

exports.updatePassword=catchAsync(async(req,res,next)=>{
  const user=await User.findById(req.user.id).select('+password')

  if(!(await user.correctPassword(req.body.passwordCurrent,user.password))){
    return next(new AppError('your current password is wrong',401))
  }

  user.password=req.body.password
  user.confirmPassword=req.body.confirmPassword
  await user.save()
  createSendToken(user,200,res);
})

exports.getMe=(req,res,next)=>{
    req.params.id=req.user.id;
    next()
  }

  exports.updateMe=catchAsync(async(req,res,next)=>{
    if(req.body.password||req.body.confirmPassword){
      return next(new AppError('this route is not for password updates. Please use /updateMyPassword',400))
    }
    const updateUser=await User.findByIdAndUpdate(req.user.id,x,{
      new:true,
      runValidators:true
    })
    
   res.status(200).json({
     status:'success',
     data:{
      user:updateUser 
     }
   })
  })
  
  exports.deleteMe=catchAsync(async(req,res,next)=>{
    await User.findByIdAndUpdate(req.user.id,{active:false})
  
    res.status(204).json({
      status:'success',
      data:null
    })
  })


exports.getAllUser = catchAsync(async (req, res, next) => {

    const features = new APIFeatures(User.find(filter), req.query)
        .filter()
        .sort()
        .search() 
        .limit()
        .paginate();

    const users = await features.query;
    res.status(200).json({
        status: "success",
        results: users.length,
        data: {
            users
        }
    });
});
exports.getUser = catchAsync(async (req, res, next) => {
    
    const user=await User.findById(req.params.id)
    res.status(200).json({
        status: "success",
        data: {
            user
        }
    });
});
exports.createUser = catchAsync(async (req, res) => {
    res.Status(500).json({
        status:"error",
        message:"this route is not yet defined"
    })    
});
exports.updateUser = catchAsync(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    });
});
exports.deleteUser = catchAsync(async (req, res, next) => {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
        return next(new AppError('No user found with that ID', 404));
    }
    res.status(204).json({
        status: "success",
        data: null
    });
});
