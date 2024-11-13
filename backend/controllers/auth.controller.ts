import {Request, Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import {config} from '../utils/config';
import {AppError} from '../utils/AppError';
import {users} from '../data/users';

// generate the access and refresh tokens
const generateAccessToken = (user: object) => {
    return jwt.sign(user, config.jwtSecret, {expiresIn: config.jwtExpireIn});
};
const generateRefreshToken = (user: object) => {
    return jwt.sign(user, config.jwtRefreshSecret, {expiresIn: config.jwtRefreshExpireIn});
}

export const login = (req: Request, res: Response, next: NextFunction): void => {
    try{
        const {username, password} = req.body;
        const user = users.find(user => user.username === username && bcrypt.compareSync(password, user.password)) || null;
    
        if(!user){
            return next(AppError.validationError('Invalid username or password'));
        } else{
            const userPayload = {username: user.username, role: 'user'};
            const accessToken = generateAccessToken(userPayload);
            const refreshToken = generateRefreshToken(userPayload);
    
            res.cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'strict' }).header('Authorization', accessToken).json({accessToken});
        }
    }catch(err){
        return next(err)
    }
}

// Refresh the Access token after it got expired(exchange the refreshToken with a new AccessToken(check the JWT_EXPIRES_IN in the .env file)
export const refreshAccessToken = (req: Request, res: Response, next: NextFunction) => {
    try{
        if(!req.user){
            return next(AppError.authenticationError('Unauthorized access'));
        }
        const userPayload = req.user as any;
        const newAccessToken = generateAccessToken({username: userPayload.username, role: 'user'});
        res.json({accessToken: newAccessToken});
    }catch(err){
        return next(err)
    }
}

// Logout, just remove the refreshToken
export const logout = (req: Request, res: Response, next: NextFunction)=>{
    try {
        res.clearCookie('refreshToken').json({ message: 'Logged out' });
    } catch (err) {
        return next(err);
    }
} 