'use strict'

import jwt from 'jsonwebtoken'
import ErrorResponse from '../../api/helpers/ErrorResponse'

const validateRequest = (req, res, next) => {
  try {
    res.header("Content-Type",'application/json')
    res.header('Access-control-allow-origin','*')
    if (req.method.toLowerCase() !== 'options') {
      var currentScopes = req.swagger.operation["x-security-scopes"]

      // ak nie je security rola tak nemusi byt podpisany tokenom
      if (currentScopes) {
        if (!req.headers.authorization) next(res.status(403).json(new ErrorResponse(false, 'Access denied. Missing authorization.', 403, {})))
        let token = req.headers.authorization
  
        if(!token || token === null) next(res.status(403).json(new ErrorResponse(false, 'Access denied. Missing authorization.', 403, {})))
  
        // verify token
        jwt.verify(token, 'viltenauth', { algorithms: ['HS512'], issuer: 'viltensro' }, (err, decoded) => {
          if (err) next(res.status(403).json(new ErrorResponse(false, 'Access denied. Token not verified.', 403, err)))
          //success and now check roles
          let successRole = false
          currentScopes.map(role => {
            if (role == 'all') successRole = true
            decoded.roles.map(userRole => {
              if (userRole === role) successRole = true
            })
          })
          // check roles
          console.dir(currentScopes)
          console.dir(decoded.roles)
          if (successRole)
            next()
          else
            next(res.status(403).json(new ErrorResponse(false, 'Access denied. Missing role.', 403, {})))
        }, { })
      } else {
        next()
      }
    } else {
      next()
    }
  } catch (err) {
    next(res.status(403).json(new ErrorResponse(false, 'Access denied. Unable to validate request.', 403, err)))
  }
}

const JWTMiddleware = {
  validateRequest
}

export default JWTMiddleware
