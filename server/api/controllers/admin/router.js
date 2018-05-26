import * as express from 'express';
import controller from './controller';

export default express
  .Router()
  .delete('/user-delete/:username', controller.userDelete)
  .post('/user-list', controller.userList)
  .get('/user-extras/:username', controller.userExtrasGet)
  .post('/user-extras/:username', controller.userExtrasSet)
  .get('/user-reset-password/:username', controller.userResetPassword)
