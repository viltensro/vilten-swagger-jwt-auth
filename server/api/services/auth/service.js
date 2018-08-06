'use strict'

import JSON from 'circular-json'
import l from '../../../common/logger';
import ErrorResponse from '../../helpers/ErrorResponse'
import SuccessResponse from '../../helpers/SuccessResponse'
import UserManagement from '../../../common/UserManagement'
import uuidv4 from 'uuid'
import jwt from 'jsonwebtoken'
import Speakeasy from 'speakeasy'
import randtoken from 'rand-token'
import Mailer from '../../../common/mailer'
import LastLogin from '../../helpers/Db/LastLogin'

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

class AuthService {
  login (req) {
    return new Promise((resolve, reject) => {
      try {
        l.info('AuthService.login()')
        userMan().then(users => {
          users.authenticateUser(req.body.username, req.body.password, (err, result) => {
            console.dir(result)
            if (!result.userExists) reject(new ErrorResponse(false, 'Invalid username.', 401))
            else if (!result.passwordsMatch) reject(new ErrorResponse(false, 'Invalid password.', 401))
            else {
              users.getExtrasForUsername(req.body.username, (err, extras) => {
                if (err) reject(new ErrorResponse(false, 'Server error.', 500, err))
                else {
                  // check enabled and activated
                  if (extras.enabled !== true) reject(new ErrorResponse(false, 'User not enabled.', 401, err))
                  else {
                    if (extras.activated !== true) resolve(new ErrorResponse(false, 'User not activated.', 401, err))
                    else {
                      // success
                      let jwtToken = jwt.sign({
                        sub: extras.sub,
                        username: req.body.username,
                        email: extras.email,
                        phone: extras.phone,
                        roles: extras.roles
                      },'viltenauth',{
                        expiresIn: '1h',
                        algorithm: 'HS512',
                        issuer: 'viltensro'
                      })
                      extras.expirationToken = randtoken.generate(process.env.EXPIRATION_TOKEN_LENGTH)
                      switch (extras.mfaType) {
                        case 'authenticator':
                          if (!req.body.mfaToken) {
                            resolve(new ErrorResponse(false, 'Authenticator MFA token is required.', 401, err))
                          } else {
                            const params = {
                              secret: extras.mfaCode,
                              encoding: 'base32',
                              token: req.body.mfaToken,
                              window: 6
                            }
                            const verified = Speakeasy.totp.verify(params)
                            if (verified === true) {
                              LastLogin.writeLastLogin(extras.sub, req.headers['x-forwarded-for'], req.headers['user-agent'], { token: jwtToken, expirationToken: extras.expirationToken }).then(result => {
                                resolve(new SuccessResponse(true, { username: req.body.username, token: jwtToken, expirationToken: extras.expirationToken }))
                              }).catch(err => {
                                l.error(err)
                                resolve(new SuccessResponse(true, { username: req.body.username, token: jwtToken, expirationToken: extras.expirationToken }))
                              })
                            } else {
                              reject(new ErrorResponse(false, 'Invalid MFA token.', 401, err))
                            }
                          }
                          break
                        case 'otp':
                          if (!req.body.mfaToken) {
                            extras.mfaCode = randtoken.generate(process.env.OTP_TOKEN_LENGTH)
                            extras.mfaCodeExpiration = new Date().getTime() + (1000 * 60 * process.env.OTP_TOKEN_EXPIRATION)
                            users.setExtrasForUsername(req.body.username, extras, (err) => {
                              if (err) {
                                reject(new ErrorResponse(false, 'Unable to reset otp.', 500, err))
                              } else {
                                let mailOptions = {
                                  from: process.env.SMTP_FROM,
                                  to: extras.email,
                                  subject: 'Your one time password code.',
                                  text: 'Hello "' + req.body.username + '", your one time password code is ' + extras.mfaCode
                                }
                                Mailer.getMailer().sendMail(mailOptions, (error, info) => {
                                  if (error) {
                                    l.error(error)
                                    reject(new ErrorResponse(false, 'OTP was not send.', 500, err))
                                  } else {
                                    l.info('OTP mail was send to ' + extras.email)
                                    resolve(new ErrorResponse(false, 'OTP code required. Email sent.', 401, err))
                                  }
                                })
                              }
                            })
                          } else {
                            if (extras.mfaCode === req.body.mfaToken) {
                              if (extras.mfaCodeExpiration > new Date().getTime()) {
                                extras.mfaCodeExpiration = 0
                                users.setExtrasForUsername(req.body.username, extras, (err) => {
                                  if (err) {
                                    reject(new ErrorResponse(false, 'Unable to save mfa configuration.', 500, err))
                                  } else {
                                    LastLogin.writeLastLogin(extras.sub, req.headers['x-forwarded-for'], req.headers['user-agent'], { token: jwtToken, expirationToken: extras.expirationToken }).then(result => {
                                      resolve(new SuccessResponse(true, { username: req.body.username, token: jwtToken, expirationToken: extras.expirationToken }))
                                    }).catch(err => {
                                      l.error(err)
                                      resolve(new SuccessResponse(true, { username: req.body.username, token: jwtToken, expirationToken: extras.expirationToken }))
                                    })
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
                          users.setExtrasForUsername(req.body.username, extras, (err) => {
                            if (err) {
                              reject(new ErrorResponse(false, 'Server error.', 500, err))
                            } else {
                              LastLogin.writeLastLogin(extras.sub, req.headers['x-forwarded-for'], req.headers['user-agent'], { token: jwtToken }).then(result => {
                                resolve(new SuccessResponse(true, { username: req.body.username, token: jwtToken, expirationToken: extras.expirationToken }))
                              }).catch(err => {
                                l.error(err)
                                resolve(new SuccessResponse(true, { username: req.body.username, token: jwtToken, expirationToken: extras.expirationToken }))
                              })
                            }
                          })
                      }
                    }
                  }
                }
              })
            }
          })
        }).catch(err => {
          console.log(err)
          reject(new ErrorResponse(false, 'Server error.', 500, err))
        })
      } catch (err) {
        console.log(err)
        reject(new ErrorResponse(false, 'Unable to login.', 500, err))
      }
    })
  }

  refresh (req) {
    l.info('AuthService.refresh()')
    return new Promise(function(resolve, reject) {
      try {
        userMan().then(users => {
          users.getExtrasForUsername(req.body.username, (err, extras) => {
            if (err) reject(new ErrorResponse(false, 'Server error.', 401, err))
            else {
              if (!extras) reject(new ErrorResponse(false, 'User not found', 401, err))
              else {
                // check enabled and activated
                if (extras.enabled !== true) reject(new ErrorResponse(false, 'User not enabled.', 401, err))
                else {
                  if (extras.activated !== true) reject(new ErrorResponse(false, 'User not activated.', 401, err))
                  else {
                    if (extras.expirationToken !== req.body.expirationToken) reject(new ErrorResponse(false, 'Invalid expiration token.', 401, err))
                    else {
                      // success
                      let jwtToken = jwt.sign({
                        sub: extras.sub,
                        username: req.body.username,
                        email: extras.email,
                        phone: extras.phone,
                        roles: extras.roles
                      },'viltenauth',{
                        expiresIn: '1h',
                        algorithm: 'HS512',
                        issuer: 'viltensro'
                      })
                      extras.expirationToken = randtoken.generate(process.env.EXPIRATION_TOKEN_LENGTH)
                      users.setExtrasForUsername(req.body.username, extras, (err) => {
                        if (err) {
                          reject(new ErrorResponse(false, 'Server error.', 500, err))
                        } else {
                          resolve(new SuccessResponse(true, { username: req.body.username, token: jwtToken, expirationToken: extras.expirationToken }))
                        }
                      })
                    }
                  }
                }
              }
            }
          })
        }).catch(err => {
          console.log(err)
          reject(new ErrorResponse(false, 'Server error.', 500, err))
        })
      } catch (e) {
        console.log(err)
        reject(new ErrorResponse(false, 'Unable to refresh token.', 500, err))
      }
    })
  }

  logout (req) {
    l.info('AuthService.logout()')
    return new Promise(function(resolve, reject) {
      try {
        let jwtToken = jwt.decode(req.headers.authorization)
        resolve(new SuccessResponse(true, { username: jwtToken.username }))
      } catch (err) {
        console.log(err)
        reject(new ErrorResponse(false, 'Unable to logout.', 500, err))
      }
    })
  }
}

export default new AuthService();
