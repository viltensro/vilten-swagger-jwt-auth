import * as express from 'express';
import controller from './controller';

export default express
  .Router()
  .get('/test', controller.test)
  .post('/signup', controller.signup)
  .post('/activate-user', controller.activateUser)
  .post('/resend-activation', controller.resendActivation)
  .post('/forgot-password', controller.forgotPasswordPost)
  .post('/forgot-password-reset', controller.forgotPasswordResetPost)
  .post('/change-password', controller.changePassword)
  .get('/user-extras', controller.userExtrasGet)
  .post('/user-extras', controller.userExtrasPost)
  .post('/reset-mfa', controller.resetMfa)
  .post('/verify-mfa', controller.verifyMfa)
  .post('/disable-mfa', controller.disableMfa)
