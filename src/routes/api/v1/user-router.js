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

// GET user
router.get('/:username',
  (req, res, next) => authService.authenticateJWT(req, res, next),
  (req, res, next) => controller.find(req, res, next)
)

// POST user
router.post('/', (req, res, next) => controller.create(req, res, next))
