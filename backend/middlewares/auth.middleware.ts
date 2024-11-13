import {Request, Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken';
import {config} from '../utils/config';
import {AppError} from '../utils/AppError';

export const authenticateJWT = (req: Request, res: Response, next: NextFunction): void=>{
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
      return next(AppError.authenticationError('Access token is missing'));
    }
    jwt.verify(token, config.jwtSecret, (err, user)=>{
        if(err){
          return next(AppError.authenticationError('Invalid access token'));
        }
        req.user = user as string;
        next();
    })
}

export const authenticateRefreshToken = (req: Request, res: Response, next: NextFunction): void=>{
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return next(AppError.authenticationError('No refresh token provided'));
    }
    jwt.verify(refreshToken, config.jwtRefreshSecret, (err: any, user: any) => {
      if (err) {
        return next(AppError.forbiddenError('Invalid refresh token'));
      }
      req.user = user as string ;
      next();
    });
  }