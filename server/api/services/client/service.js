'use strict'

import l from '../../../common/logger'
import ErrorResponse from '../../helpers/ErrorResponse'
import SuccessResponse from '../../helpers/SuccessResponse'
import UserManagement from '../../../common/UserManagement'
import uuidv4 from 'uuid'
import jwt from 'jsonwebtoken'
import randtoken from 'rand-token'
import Mailer from '../../../common/mailer'
import Db from '../../helpers/Db'
import Speakeasy from 'speakeasy'


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

class ClientService {
  signup (req) {
    return new Promise((resolve, reject) => {
      try {
        l.info('ClientService.signup()')
        userMan().then(users => {
          users.userExists(req.body.username,(err, exists) => {
            if (exists) {
              reject(new ErrorResponse(false, 'User already exists.', 403))
            } else {
              // existing email condition
              Db.getClient().then(dbClient => {
                const collection = dbClient.collection('users')
                collection.find({
                  'extras.email': req.body.email
                })
                .project({
                  'username':1,
                  '_id':0,
                  'extras':1
                })
                .toArray(function(err, docs) {
                  if (err) {
                    l.error(err)
                    reject(new ErrorResponse(false, 'Unable to check used email in db.', 500, err))
                  } else {
                    if (docs.length > 0) reject(new ErrorResponse(false, 'Email is not unique.', 403))
                    else {
                      // default user extras
                      let sub = uuidv4()
                      let extras = {
                        fullName: req.body.fullName,
                        email: req.body.email,
                        phone: req.body.phone,
                        activated: !process.env.ACTIVATION_REQUIRED,
                        activationCode: randtoken.generate(process.env.ACTIVATION_TOKEN_LENGTH),
                        activationCodeExpiration: new Date().getTime() + (1000 * 60 * process.env.ACTIVATION_TOKEN_EXPIRATION),
                        enabled: true,
                        roles: ['customer'],
                        sub: sub,
                        mfaType: disabled,
                        mfaCode: '',
                      }
                      users.createUser(req.body.username, req.body.password, extras, err => {
                        if (err) reject(new ErrorResponse(false, 'Server error.', 500, err))
                        else {
                          // send email for activation
                          if (process.env.ACTIVATION_REQUIRED === 'true') {
                            let mailOptions = {
                              from: process.env.SMTP_FROM,
                              to: req.body.email,
                              subject: 'Your activation code.',
                              text: 'Hello "' + req.body.username + '", your activation code is ' + extras.activationCode
                            }
                            Mailer.getMailer().sendMail(mailOptions, (error, info) => {
                              if (error) {
                                l.error(error)
                              } else {
                                l.info('Activation mail was send to ' + req.body.email)
                              }
                            })
                          }
                          // success
                          resolve(new SuccessResponse(true, { username: req.body.username, sub: sub}))
                        }
                      })
                    }
                  }
                })
              })
            }
          })
        }).catch(err => {
          reject(new ErrorResponse(false, 'Server error.', 500, err))
        })
      } catch (err) {
        console.log(err)
        reject(new ErrorResponse(false, 'Unable to signup.', 500, err))
      }
    })
  }

  activateUser (req) {
    return new Promise(function(resolve, reject) {
      try {
        l.info('ClientService.activateUser()')
        userMan().then(users => {
          users.getExtrasForUsername(req.body.username,(err, extras) => {
            if (err || extras === null) {
              reject(new ErrorResponse(false, 'User not found.', 404, err))
            } else {
              if (extras.activated === true) reject(new ErrorResponse(false, 'User already activated.', 500))
              else {
                if (extras.activationCodeExpiration < new Date().getTime()) reject(new ErrorResponse(false, 'Activation code expired.', 500))
                else {
                  if (extras.activationCode !== '' && req.body.activationCode === extras.activationCode) {
                    extras.activated = true
                    extras.activationCode = ''
                    extras.activationCodeExpiration = 0
                    users.setExtrasForUsername(req.body.username, extras, (err) => {
                      if (err) {
                        reject(new ErrorResponse(false, 'Unable to activate user.', 500, err))
                      } else {
                        resolve(new SuccessResponse(true, { username: req.body.username, activated: extras.activated}))
                      }
                    })
                  } else {
                    reject(new ErrorResponse(false, 'Activation code is incorrect.', 401))
                  }
                }
              }
            }
          })
        }).catch(err => {
          console.log(err)
          reject(new ErrorResponse(false, 'Server error.', 500, err))
        })
      } catch (err) {
        console.log(err)
        reject(new ErrorResponse(false, 'Unable to activate user.', 500, err))
      }
    })
  }

  resendActivation (req) {
    return new Promise((resolve, reject) => {
      try {
        l.info('ClientService.resendActivation()')
        userMan().then(users => {
          users.getExtrasForUsername(req.body.username,(err, extras) => {
            if (err || extras === null) {
              reject(new ErrorResponse(false, 'User not found.', 404, err))
            } else {
              if (extras.activated === true) reject(new ErrorResponse(false, 'User already activated.', 500))
              else {
                extras.activationCode = randtoken.generate(process.env.ACTIVATION_TOKEN_LENGTH)
                extras.activationCodeExpiration = new Date().getTime() + (1000 * 60 * process.env.ACTIVATION_TOKEN_EXPIRATION)
                users.setExtrasForUsername(req.body.username, extras, (err) => {
                  if (err) {
                    reject(new ErrorResponse(false, 'Unable to reset activation code.', 500, err))
                  } else {
                    // send email for activation
                    if (process.env.ACTIVATION_REQUIRED === 'true') {
                      let mailOptions = {
                        from: process.env.SMTP_FROM,
                        to: extras.email,
                        subject: 'Your activation code.',
                        text: 'Hello "' + req.body.username + '", your activation code is ' + extras.activationCode
                      }
                      Mailer.getMailer().sendMail(mailOptions, (error, info) => {
                        if (error) {
                          l.error(error)
                        } else {
                          l.info('Activation mail was send to ' + extras.email)
                        }
                      })
                    }
                    // success
                    resolve(new SuccessResponse(true, { username: req.body.username, activated: extras.activated}))
                  }
                })
              }
            }
          })
        }).catch(err => {
          reject(new ErrorResponse(false, 'Server error.', 500, err))
        })
      } catch (err) {
        console.log(err)
        reject(new ErrorResponse(false, 'Unable to resend activation.', 500, err))
      }
    })
  }

  forgotPasswordPost (req) {
    return new Promise((resolve, reject) => {
      try {
        l.info('ClientService.forgotPasswordPost()')
        Db.getClient().then(dbClient => {
          const collection = dbClient.collection('users')
          collection.find({
            'extras.email': req.body.email
          })
          .project({
            'username':1,
            '_id':0,
            'extras':1
          })
          .toArray(function(err, docs) {
            if (err) {
              l.error(err)
              reject(new ErrorResponse(false, 'Unable to get users in db.', 500, err))
            } else {
              l.info('Users with email found. ' + docs.length)
              userMan().then(users => {
                let actions = []
                if (docs.length == 0) reject(new ErrorResponse(false, 'No users found.', 404))
                else {
                  docs.map(userDoc => {
                    if (userDoc.extras.activated === true) {
                      actions.push(new Promise(function(resolve, reject) {
                        userDoc.extras.activationCode = randtoken.generate(process.env.ACTIVATION_TOKEN_LENGTH)
                        userDoc.extras.activationCodeExpiration = new Date().getTime() + (1000 * 60 * process.env.ACTIVATION_TOKEN_EXPIRATION)
                        users.setExtrasForUsername(userDoc.username, userDoc.extras, (err) => {
                          if (err) {
                            l.error(err)
                            reject(new ErrorResponse(false, 'Unable to reset activation code.', 500, err))
                          } else {
                            l.info('Extras written.')
                            // send email for activation
                            let mailOptions = {
                              from: process.env.SMTP_FROM,
                              to: userDoc.extras.email,
                              subject: 'Your forgot password code.',
                              text: 'Hello "' + userDoc.username + '", your forgot password code is ' + userDoc.extras.activationCode
                            }
                            Mailer.getMailer().sendMail(mailOptions, (error, info) => {
                              if (error) {
                                l.error(error)
                                reject(error)
                              } else {
                                l.info('Forgot password mail was send to ' + userDoc.extras.email)
                                resolve()
                              }
                            })
                          }
                        })
                      }))
                    } else {
                      reject(new ErrorResponse(false, 'User is not activated.', 401, err))
                    }
                  })
                  Promise.all(actions).then(data => {
                    resolve(new SuccessResponse(true, { email: req.body.email }))
                  }).catch(err => {
                    l.error(err)
                    reject(new ErrorResponse(false, 'Unable to send forgot password code.', 500, err))
                  })
                }
              }).catch(err => {
                l.error(err)
                reject(new ErrorResponse(false, 'Server error.', 500, err))
              })
            }
          })
        }).catch(err => {
          l.error(err)
          reject(new ErrorResponse(false, 'Unable to get db connection.', 500, err))
        })
      } catch (err) {
        console.log(err)
        reject(new ErrorResponse(false, 'Unable to resend activation.', 500, err))
      }
    })
  }

  forgotPasswordResetPost (req) {
    return new Promise(function(resolve, reject) {
      try {
        l.info('ClientService.forgotPasswordResetPost()')
        Db.getClient().then(dbClient => {
          const collection = dbClient.collection('users')
          collection.find({
            'extras.email': req.body.email
          })
          .project({
            'username':1,
            '_id':0,
            'extras':1
          })
          .toArray(function(err, docs) {
            if (err) {
              l.error(err)
              reject(new ErrorResponse(false, 'Unable to get users in db.', 500, err))
            } else {
              if (docs.length === 0) reject(new ErrorResponse(false, 'Unable to find users in db.', 403, err))
              else {
                docs.map(user => {
                  if (user.extras.activationCode !== req.body.resetCode) reject(new ErrorResponse(false, 'Wrong forgot password code.', 403, err))
                  else {
                    if (user.extras.activationCodeExpiration < new Date().getTime()) reject(new ErrorResponse(false, 'Forgot password code expired.', 403, err))
                    else {
                      // set password
                      userMan().then(users => {
                        users.setPassword(user.username, req.body.password, (err, results) => {
                          if (err) reject(new ErrorResponse(false, 'Unable to set new password.', 403, err))
                          else resolve(new SuccessResponse(true, { users: user.username }))
                        })
                      }).catch(err => {
                        l.error(err)
                        reject(new ErrorResponse(false, 'Server error.', 500, err))
                      })
                    }
                  }
                })
              }
            }
          })
        }).catch(err => {
          l.error(err)
          reject(new ErrorResponse(false, 'Unable to get db connection.', 500, err))
        })
      } catch (err) {
        console.log(err)
        reject(new ErrorResponse(false, 'Unable to resend activation.', 500, err))
      }
    })
  }

  changePassword (req) {
    return new Promise((resolve, reject) => {
      l.info('ClientService.changePassword()')
      try {
        var jwtToken = jwt.decode(req.headers.authorization)
        let username = jwtToken.username
        userMan().then(users => {
          users.authenticateUser(username, req.body.oldPassword, (err, result) => {
            if (!result.userExists) reject(new ErrorResponse(false, 'Invalid username.', 401))
            else if (!result.passwordsMatch) reject(new ErrorResponse(false, 'Invalid old password.', 401))
            else {
              users.setPassword(username, req.body.newPassword, (err, results) => {
                if (err) reject(new ErrorResponse(false, 'Unable to set new password.', 403, err))
                else resolve(new SuccessResponse(true, { users: username }))
              })
            }
          })
        }).catch(err => {
          l.error(err)
          reject(new ErrorResponse(false, 'Server error.', 500, err))
        })
      } catch (err) {
        l.error(err)
        reject(new ErrorResponse(false, 'Unable to get my user extras.', 500, err))
      }
    })
  }

  userExtrasGet (req) {
    return new Promise((resolve, reject) => {
      l.info('ClientService.userExtrasGet()')
      try {
        var jwtToken = jwt.decode(req.headers.authorization)
        let username = jwtToken.username
        userMan().then(users => {
          users.getExtrasForUsername(username,(err, extras) => {
            if (err || extras === null) {
              reject(new ErrorResponse(false, 'User not found.', 404, err))
            } else {
              // hide some values
              extras.activationCode = null
              extras.activationCodeExpiration = null
              extras.mfaCode = null
              extras.mfaCodeExpiration = null
              resolve(new SuccessResponse(true, { username: username, extras: extras}))
            }
          })
        }).catch(err => {
          reject(new ErrorResponse(false, 'Server error.', 500, err))
        })
      } catch (err) {
        l.error(err)
        reject(new ErrorResponse(false, 'Unable to get my user extras.', 500, err))
      }
    })
  }

  userExtrasPost (req) {
    return new Promise((resolve, reject) => {
      l.info('ClientService.userExtrasPost()')
      try {
        let jwtToken = jwt.decode(req.headers.authorization)
        let username = jwtToken.username
        let newExtras = req.body
        userMan().then(users => {
          users.getExtrasForUsername(username,(err, extras) => {
            if (err || extras === null) {
              reject(new ErrorResponse(false, 'User not found.', 404, err))
            } else {
              Object.keys(newExtras).map(extraKey => {
                if (
                  extraKey !== 'sub' &&
                  extraKey !== 'email' &&
                  extraKey !== 'activated' &&
                  extraKey !== 'activationCode' &&
                  extraKey !== 'activationCodeExpiration' &&
                  extraKey !== 'enabled' &&
                  extraKey !== 'mfaType' &&
                  extraKey !== 'mfaCode' &&
                  extraKey !== 'mfaCodeExpiration' &&
                  extraKey !== 'roles'
                )
                extras[extraKey] = newExtras[extraKey]
              })
              users.setExtrasForUsername(username, extras, (err) => {
                if (err) {
                  reject(new ErrorResponse(false, 'Unable to set my user extras.', 500, err))
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
        l.error(err)
        reject(new ErrorResponse(false, 'Unable to set my user extras.', 500, err))
      }
    })
  }

  resetMfa (req) {
    return new Promise(function(resolve, reject) {
      l.info('ClientService.resetMfa')
      try {
        let jwtToken = jwt.decode(req.headers.authorization)
        let username = jwtToken.username
        userMan().then(users => {
          users.getExtrasForUsername(username,(err, extras) => {
            if (err || extras === null) {
              reject(new ErrorResponse(false, 'User not found.', 404, err))
            } else {
              switch (req.body.mfaType) {
                case 'authenticator':
                  extras.mfaType = 'authenticator_not_verified'
                  extras.mfaCodeExpiration = 0
                  let secret = Speakeasy.generateSecret({length: 30})
                  let url = secret.otpauth_url
                  extras.mfaCode = secret.base32
                  users.setExtrasForUsername(username, extras, (err) => {
                    if (err) {
                      reject(new ErrorResponse(false, 'Unable to save mfa configuration.', 500, err))
                    } else {
                      resolve(new SuccessResponse(true, { username: username, mfaCode: extras.mfaCode, mfaUrl: url }))
                    }
                  })
                  break
                case 'otp':
                  extras.mfaType = 'otp'
                  extras.mfaCode = randtoken.generate(process.env.OTP_TOKEN_LENGTH)
                  extras.mfaCodeExpiration = new Date().getTime() + (1000 * 60 * process.env.OTP_TOKEN_EXPIRATION)
                  users.setExtrasForUsername(username, extras, (err) => {
                    if (err) {
                      reject(new ErrorResponse(false, 'Unable to save mfa configuration.', 500, err))
                    } else {
                      resolve(new SuccessResponse(true, { username: username, otp: true }))
                    }
                  })
                  break
                default:
                  reject(new ErrorResponse(false, 'Unknown MFA type.', 401, err))
              }
            }
          })
        }).catch(err => {
          reject(new ErrorResponse(false, 'Server error.', 500, err))
        })
      } catch (err) {
        l.error(err)
        reject(new ErrorResponse(false, 'Unable to reset mfa.', 500, err))
      }
    })
  }

  verifyMfa (req) {
    return new Promise(function(resolve, reject) {
      l.info('ClientService.verifyMfa')
      try {
        let jwtToken = jwt.decode(req.headers.authorization)
        let username = jwtToken.username
        userMan().then(users => {
          users.getExtrasForUsername(username,(err, extras) => {
            if (err || extras === null) {
              reject(new ErrorResponse(false, 'User not found.', 404, err))
            } else {
              switch (extras.mfaType) {
                case 'authenticator':
                  reject(new ErrorResponse(false, 'MFA code already verified.', 403, err))
                  break
                case 'authenticator_not_verified':
                  const params = {
                    secret: extras.mfaCode,
                    encoding: 'base32',
                    token: req.body.mfaToken,
                    window: 6
                  }
                  const verified = Speakeasy.totp.verify(params)
                  if (verified === true) {
                    extras.mfaType = 'authenticator'
                    users.setExtrasForUsername(username, extras, (err) => {
                      if (err) {
                        reject(new ErrorResponse(false, 'Unable to save mfa configuration.', 500, err))
                      } else {
                        resolve(new SuccessResponse(true, { username: username }))
                      }
                    })
                  } else {
                    reject(new ErrorResponse(false, 'Invalid MFA token.', 401, err))
                  }
                  break
                default:
                  reject(new ErrorResponse(false, 'Authenticator MFA not set.', 401, err))
              }
            }
          })
        }).catch(err => {
          reject(new ErrorResponse(false, 'Server error.', 500, err))
        })
      } catch (err) {
        l.error(err)
        reject(new ErrorResponse(false, 'Unable to verify mfa.', 500, err))
      }
    })
  }

  disableMfa (req) {
    return new Promise(function(resolve, reject) {
      l.info('ClientService.disableMfa')
      try {
        let jwtToken = jwt.decode(req.headers.authorization)
        let username = jwtToken.username
        userMan().then(users => {
          users.getExtrasForUsername(username,(err, extras) => {
            if (err || extras === null) {
              reject(new ErrorResponse(false, 'User not found.', 404, err))
            } else {
              switch (extras.mfaType) {
                case 'authenticator':
                  const params = {
                    secret: extras.mfaCode,
                    encoding: 'base32',
                    token: req.body.mfaToken,
                    window: 6
                  }
                  const verified = Speakeasy.totp.verify(params)
                  if (verified === true) {
                    extras.mfaType = 'disabled'
                    users.setExtrasForUsername(username, extras, (err) => {
                      if (err) {
                        reject(new ErrorResponse(false, 'Unable to save mfa configuration.', 500, err))
                      } else {
                        resolve(new SuccessResponse(true, { username: username }))
                      }
                    })
                  } else {
                    reject(new ErrorResponse(false, 'Invalid MFA token.', 401, err))
                  }
                  break
                case 'otp':
                  if (req.body.mfaToken === 'new_otp') {
                    extras.mfaCode = randtoken.generate(process.env.OTP_TOKEN_LENGTH)
                    extras.mfaCodeExpiration = new Date().getTime() + (1000 * 60 * process.env.OTP_TOKEN_EXPIRATION)
                    users.setExtrasForUsername(username, extras, (err) => {
                      if (err) {
                        reject(new ErrorResponse(false, 'Unable to reset otp.', 500, err))
                      } else {
                        let mailOptions = {
                          from: process.env.SMTP_FROM,
                          to: extras.email,
                          subject: 'Your one time password code.',
                          text: 'Hello "' + username + '", your one time password code is ' + extras.mfaCode
                        }
                        Mailer.getMailer().sendMail(mailOptions, (error, info) => {
                          if (error) {
                            l.error(error)
                            reject(new ErrorResponse(false, 'OTP was not send.', 500, err))
                          } else {
                            l.info('OTP mail was send to ' + extras.email)
                            resolve(new SuccessResponse(true, { username: username, otpSent: true}))
                          }
                        })
                      }
                    })
                  } else {
                    if (extras.mfaCode === req.body.mfaToken) {
                      if (extras.mfaCodeExpiration > new Date().getTime()) {
                        extras.mfaType = 'disabled'
                        extras.mfaCodeExpiration = 0
                        users.setExtrasForUsername(username, extras, (err) => {
                          if (err) {
                            reject(new ErrorResponse(false, 'Unable to save mfa configuration.', 500, err))
                          } else {
                            resolve(new SuccessResponse(true, { username: username }))
                          }
                        })
                      } else {
                        reject(new ErrorResponse(false, 'Expired OTP answer.', 401, err))
                      }
                    } else {
                      reject(new ErrorResponse(false, 'Invalid OTP answer.', 401, err))
                    }
                  }
                  break
                default:
                  reject(new ErrorResponse(false, 'MFA is not enabled.', 401, err))
              }
            }
          })
        }).catch(err => {
          reject(new ErrorResponse(false, 'Server error.', 500, err))
        })
      } catch (err) {
        l.error(err)
        reject(new ErrorResponse(false, 'Unable to verify mfa.', 500, err))
      }
    })
  }
}

export default new ClientService();
