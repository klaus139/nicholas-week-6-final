"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Model = require('../models/userModel');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const protect = asyncHandler(async (req, res, next) => {
    let token = req.cookies.Token;
    if (token) {
        try {
            // Verify token
            if (process.env.JWT_SECRET) {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                // Get user from the token
                if (decoded) {
                    const user = await Model.findUserById(decoded._id);
                    next();
                }
            }
        }
        catch (error) {
            res.status(401);
            throw new Error('Not authorized');
        }
    }
    else if (req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];
            // Verify token
            if (process.env.JWT_SECRET) {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                // Get user from the token
                if (typeof (decoded) !== "string") {
                    const user = await Model.findUserById(decoded.id);
                }
                next();
            }
        }
        catch (error) {
            res.status(401);
            throw new Error('Not authorized');
        }
    }
    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});
module.exports = { protect };
