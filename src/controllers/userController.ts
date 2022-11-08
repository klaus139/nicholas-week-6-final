const Model = require('../models/userModel')
import { Request, Response } from "express";
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const asyncHandler = require('express-async-handler')

const generateToken = (id: number) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: '3d',
    })
}


const registerUser = asyncHandler(async (req: Request, res: Response) => {
    const { name, email, password } = req.body
  
    // Check if user exists
    const userExists = await Model.findExistingUser(email.toLowerCase())
  
    if (userExists !== 'false') {
      res.status(400)
      throw new Error('User already exists')
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create user
    const user = await Model.createUser({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    })

    // register user
    if (user) {
      const mytoken = generateToken(user.id)
      res.cookie('Token', mytoken)
      res.cookie('Uid', user.uid)
      res.cookie('Username', user.name)
      
      res.status(201).redirect('/api/books')
    }
})

const loginUser = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body
  
    // Check for user email
    const user = await Model.findUser(email.toLowerCase())
  
    if (user && (await bcrypt.compare(password, user.password))) {
      const mytoken = generateToken(user.id)
      res.cookie('Token', mytoken)
      res.cookie('Uid', user.uid)
      res.cookie('Username', user.name)
      
      res.redirect('/api/books')
    } else {
      res.status(400)
      throw new Error('Invalid credentials')
    }
})

const logoutUser = asyncHandler(async (req: Request, res: Response) => {
    res.cookie('Token', '')
    req.cookies.Token = ''
    req.cookies.Username = ''
    req.cookies.Uid = ''
    res.redirect('/api/users/login')
})
  


module.exports = {
    registerUser,
    loginUser,
    logoutUser
}