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
   * Sends a JSON response containing the current user.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async findCurrentUser (req, res, next) {
    try {
      const user = await User.getById(req.account.userID)

      if (!user) {
        next(createError(404))
        return
      }

      res
        .status(200)
        .json(user)
    } catch (error) {
      next(error)
    }
  }

  /**
   * Sends a JSON response containing the specified user.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async find (req, res, next) {
    try {
      const user = await User.getById(req.params.userID)

      if (!user) {
        next(createError(404))
        return
      }

      // Sends full user information if the user is requesting itself.
      if (req.params.userID === req.account.userID) {
        res
          .status(200)
          .json(user)
      } else {
        res
          .status(200)
          .json({
            userID: user.userID,
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
        userID: req.body.userID,
        email: req.body.email,
        about: req.body.about
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

  /**
   * Sends a friend request to the specified user.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async sendFriendRequest (req, res, next) {
    try {
      const currentUser = await User.getById(req.account.userID)
      const targetedUser = await User.getById(req.params.userID)

      if (!currentUser || !targetedUser) {
        next(createError(404))
        return
      }

      const sentFriendRequests = currentUser.sentFriendRequests
      const recievedFriendRequests = targetedUser.recievedFriendRequests

      sentFriendRequests.push(targetedUser)
      recievedFriendRequests.push(currentUser)

      await currentUser.update({ sentFriendRequests: sentFriendRequests })
      await targetedUser.update({ recievedFriendRequests: recievedFriendRequests })

      res
        .status(204)
        .end()
    } catch (error) {
      let err = error
      if (err.code === 11000) {
        err = createError(409)
        err.innerException = error
      } else if (error.name === 'ValidationError') {
        err = createError(400)
        err.innerException = error
      }
      next(err)
    }
  }
}
