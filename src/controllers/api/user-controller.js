/**
 * Module for the user controller.
 *
 * @author Ida Rosvall <ir222gn@student.lnu.se>
 * @version 1.0.0
 */

import createError from 'http-errors'
import { User } from '../../models/user.js'

/**
 * Encapsulates the user controller.
 */
export class UserController {
  /**
   * Sends a JSON response containing the specified image.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async find (req, res, next) {
    try {
      const user = await User.getByName(req.params.username)

      if (!user) {
        next(createError(404))
        return
      }

      // Sends full user information if the user is requesting itself.
      if (req.params.username === req.account.username) {
        res
          .status(200)
          .json(user)
      } else {
        res
          .status(200)
          .json({
            username: user.username,
            about: user.about
          })
      }
    } catch (error) {
      next(error)
    }
  }

  /**
   * Creates a new user.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async create (req, res, next) {
    try {
      await User.insert({
        username: req.body.username,
        email: req.body.email,
        about: req.body.about,
        friends: req.body.friends,
        chats: req.body.chats
      })

      res
        .status(201)
        .end()
    } catch (error) {
      let err = error
      if (err.code === 11000) {
        let message = ''

        if (err.keyPattern.email) {
          message = 'The email is already taken'
        } else if (err.keyPattern.username) {
          message = 'The username is already taken'
        }

        err = createError(409, message)
        err.innerException = error
      } else if (error.name === 'ValidationError') {
        err = createError(400)
        err.innerException = error
      }
      next(err)
    }
  }
}
