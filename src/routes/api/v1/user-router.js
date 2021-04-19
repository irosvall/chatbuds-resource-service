/**
 * Account router.
 *
 * @author Ida Rosvall <ir222gn@student.lnu.se>
 * @version 1.0.0
 */

import express from 'express'
import { UserController } from '../../../controllers/api/user-controller.js'

export const router = express.Router()

const controller = new UserController()

// POST user
router.post('/', (req, res, next) => controller.create(req, res, next)
)
