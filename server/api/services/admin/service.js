'use strict'

import l from '../../../common/logger';
import ErrorResponse from '../../helpers/ErrorResponse'
import SuccessResponse from '../../helpers/SuccessResponse'
import UserManagement from '../../../common/UserManagement'
import Db from '../../helpers/Db'

var usersMan = null

function userMan() {
  return new Promise(function(resolve, reject) {
    if (usersMan !== null && usersMan.loaded === true) {
      resolve(usersMan)
    } else {
      usersMan = new UserManagement({
        hostname: process.env.MONGO_HOST,
        port: process.env.MONGO_PORT,
        database: process.env.MONGO_DB
      })
      usersMan.load(err => {
        if (err) reject(err)
        else resolve(usersMan)
      })
    }
  })
}

class AdminService {
  userDelete (req) {
    return new Promise((resolve, reject) => {
      l.info('AdminService.userDelete()')
      try {
        let username = req.pathParams.username
        userMan().then(users => {
          users.removeUser(username,(err) => {
            if (err) {
              reject(new ErrorResponse(false, 'Unable to delete user.', 500, err))
            } else {
              resolve(new SuccessResponse(true, {}))
            }
          })
        }).catch(err => {
          reject(new ErrorResponse(false, 'Server error.', 500, err))
        })
      } catch (err) {
        console.log(err)
        reject(new ErrorResponse(false, 'Unable to delete user.', 500, err))
      }
    })
  }

  userList (req) {
    return new Promise(function(resolve, reject) {
      l.info('AdminService.userList()')
      try {
        let users = []
        let filter = {}
        if (req.body) filter = req.body
        Db.getClient().then(dbClient => {
          const collection = dbClient.collection('users')
          collection.find(filter)
            .project({
              'username':1,
              '_id':0,
              'extras':1
            })
            .toArray(function(err, docs) {
              if (err) {
                console.log(err)
                reject(new ErrorResponse(false, 'Unable to get users in db.', 500, err))
              } else {
                users = docs
                resolve(new SuccessResponse(true, { users: users }))
              }
          })
        }).catch(err => {
          console.log(err)
          reject(new ErrorResponse(false, 'Unable to get db connection.', 500, err))
        })
      } catch (e) {
        console.log(err)
        reject(new ErrorResponse(false, 'Unable to get  user extras.', 500, err))
      }
    })
  }

  userExtrasGet (req) {
    return new Promise((resolve, reject) => {
      l.info('AdminService.userExtrasGet()')
      try {
        let username = req.pathParams.username
        userMan().then(users => {
          users.getExtrasForUsername(username,(err, extras) => {
            if (err || extras === null) {
              reject(new ErrorResponse(false, 'User not found.', 404, err))
            } else {
              resolve(new SuccessResponse(true, { username: username, extras: extras}))
            }
          })
        }).catch(err => {
          reject(new ErrorResponse(false, 'Server error.', 500, err))
        })
      } catch (err) {
        console.log(err)
        reject(new ErrorResponse(false, 'Unable to get user extras.', 500, err))
      }
    })
  }

  userExtrasSet (req) {
    return new Promise((resolve, reject) => {
      l.info('AdminService.userExtrasPost()')
      try {
        let username = req.pathParams.username
        let newExtras = req.body
        userMan().then(users => {
          users.getExtrasForUsername(username,(err, extras) => {
            if (err || extras === null) {
              reject(new ErrorResponse(false, 'User not found.', 404, err))
            } else {
              Object.keys(newExtras).map(extraKey => {
                if (
                  extraKey !== 'sub' // &&
                  // extraKey !== 'email' &&
                  // extraKey !== 'activated' &&
                  // extraKey !== 'enabled' &&
                  // extraKey !== 'roles'
                )
                extras[extraKey] = newExtras[extraKey]
              })
              users.setExtrasForUsername(username, extras, (err) => {
                if (err) {
                  reject(new ErrorResponse(false, 'Unable to set user extras.', 500, err))
                } else {
                  resolve(new SuccessResponse(true, { username: username, extras: extras}))
                }
              })
            }
          })
        }).catch(err => {
          reject(new ErrorResponse(false, 'Server error.', 500, err))
        })
      } catch (err) {
        console.log(err)
        reject(new ErrorResponse(false, 'Unable to set user extras.', 500, err))
      }
    })
  }

  userResetPassword (req) {
    return new Promise((resolve, reject) => {
      l.info('AdminService.userResetPassword()')
      try {
        let username = req.pathParams.username
        userMan().then(users => {
          users.resetPassword(username,(err, extras) => {
            if (err) {
              reject(new ErrorResponse(false, 'Unable to delete user.', 500, err))
            } else {
              resolve(new SuccessResponse(true, { username: username, otp: extras}))
            }
          })
        }).catch(err => {
          reject(new ErrorResponse(false, 'Server error.', 500, err))
        })
      } catch (err) {
        console.log(err)
        reject(new ErrorResponse(false, 'Unable to delete user.', 500, err))
      }
    })
  }
}

export default new AdminService();
