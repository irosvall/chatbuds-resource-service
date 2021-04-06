/**
 * The routers.
 *
 * @author Ida Rosvall <ir222gn@student.lnu.se
 * @version 1.0.0
 */

import express from 'express'
import createError from 'http-errors'
import { router as v1Router } from './api/v1/router.js'

export const router = express.Router()

router.use('/api/v1', v1Router)
router.get('/', (req, res) => res.json({ message: 'Welcome to the chatbuds resource service API!' }))

// Catch 404.
router.use('*', (req, res, next) => next(createError(404)))
