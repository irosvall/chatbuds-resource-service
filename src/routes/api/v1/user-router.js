/**
 * Account router.
 *
 * @author Ida Rosvall <ir222gn@student.lnu.se>
 * @version 1.0.0
 */

import express from 'express'
import { UserController } from '../../../controllers/api/user-controller.js'
import { AuthService } from '../../../services/auth.js'

export const router = express.Router()

const controller = new UserController()
const authService = new AuthService()

// ------------------------------------------------------------------------------
//  Routes
// ------------------------------------------------------------------------------

// Provide req.task to the route if :id is present in the route path.
router.param('userID', (req, res, next, userID) => controller.loadUser(req, res, next, userID))

// GET user
router.get('/',
  (req, res, next) => authService.authenticateJWT(req, res, next),
  (req, res, next) => controller.loadCurrentUser(req, res, next),
  (req, res, next) => controller.findCurrentUser(req, res, next)
)

router.get('/:userID',
  (req, res, next) => authService.authenticateJWT(req, res, next),
  (req, res, next) => controller.find(req, res, next)
)

// POST user
router.post('/', (req, res, next) => controller.create(req, res, next))

// PATCH user/friendrequest/:userID
router.patch('/friendrequest/:userID',
  (req, res, next) => authService.authenticateJWT(req, res, next),
  (req, res, next) => controller.loadCurrentUser(req, res, next),
  (req, res, next) => controller.sendFriendRequest(req, res, next)
)

// PATCH user/acceptfriend/:userID
router.patch('/acceptfriend/:userID',
  (req, res, next) => authService.authenticateJWT(req, res, next),
  (req, res, next) => controller.loadCurrentUser(req, res, next),
  (req, res, next) => controller.acceptFriendRequest(req, res, next)
)

// PATCH user/declinefriend/:userID
router.patch('/declinefriend/:userID',
  (req, res, next) => authService.authenticateJWT(req, res, next),
  (req, res, next) => controller.loadCurrentUser(req, res, next),
  (req, res, next) => controller.declineFriendRequest(req, res, next)
)

// DELETE user
router.delete('/',
  (req, res, next) => authService.authenticateJWT(req, res, next),
  (req, res, next) => controller.delete(req, res, next)
)

// DELETE user/removeFriend/:userID
router.delete('/removeFriend/:userID',
  (req, res, next) => authService.authenticateJWT(req, res, next),
  (req, res, next) => controller.loadCurrentUser(req, res, next),
  (req, res, next) => controller.removeFriend(req, res, next)
)
