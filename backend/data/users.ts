import bcrypt from 'bcryptjs';
import { User } from '../models/user.model';

export const users: User[] = [
    {id: 1, username: 'user1', password: bcrypt.hashSync('password', 10)},
    {id: 2, username: 'user2', password: bcrypt.hashSync('1234', 10)}
];