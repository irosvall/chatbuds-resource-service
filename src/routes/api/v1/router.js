/**
 * API version 1 routes.
 *
 * @author Ida Rosvall <ir222gn@student.lnu.se>
 * @version 1.0.0
 */

import express from 'express'

export const router = express.Router()

router.use('/', (req, res) => res.json({ message: 'Welcome to the chatbuds resource service API version 1!' }))
