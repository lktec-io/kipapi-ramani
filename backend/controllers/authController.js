import jwt from 'jsonwebtoken'
import * as User from '../models/userModel.js'

const signToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' })
    }

    const existing = await User.findByEmail(email)
    if (existing) {
      return res.status(409).json({ message: 'An account with that email already exists' })
    }

    const id = await User.createUser({ name, email, password })
    const user = await User.findById(id)
    const token = signToken(user)

    res.status(201).json({ token, user })
  } catch (err) {
    next(err)
  }
}

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const user = await User.findByEmail(email)
    if (!user || !(await User.verifyPassword(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const token = signToken(user)
    const { password: _, ...safeUser } = user

    res.json({ token, user: safeUser })
  } catch (err) {
    next(err)
  }
}

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json(user)
  } catch (err) {
    next(err)
  }
}
