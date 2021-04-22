/**
 * Module for the authentication service.
 *
 * @author Ida Rosvall <ir222gn@student.lnu.se>
 * @version 1.0.0
 */

import createError from 'http-errors'
import fs from 'fs/promises'
import jwt from 'jsonwebtoken'

/**
 * Encapsulates the auth service.
 */
export class AuthService {
  /**
   * Authenticates requests.
   *
   * If authentication is successful, `req.account` is populated and the
   * request is authorized to continue.
   * If authentication fails, an unauthorized response will be sent.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async authenticateJWT (req, res, next) {
    try {
      const authorization = req.headers.authorization?.split(' ')

      if (authorization?.[0] !== 'Bearer') {
        next(createError(401))
        return
      }

      const publicKey = await fs.readFile(process.env.PUBLIC_KEY_FILEPATH)
      const payload = jwt.verify(authorization[1], publicKey)
      req.account = {
        username: payload.name
      }

      next()
    } catch (error) {
      let err = error
      if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        err = createError(403)
      }

      next(err)
    }
  }
}
