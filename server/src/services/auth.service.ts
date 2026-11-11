import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';
import { IUser, AuthUserPayload } from '../types';
import { config } from '../config';
import { ensureDatabaseConnected } from '../config/database';
import { UnauthorizedError, NotFoundError } from '../utils/errors';

export class AuthService {
  async login(
    email: string,
    plainPassword: string
  ): Promise<{ token: string; user: Omit<IUser, 'passwordHash'> }> {
    ensureDatabaseConnected();

    const normalizedEmail = email.toLowerCase().trim();
    const user = await UserModel.findOne({ email: normalizedEmail, isActive: true });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password credentials');
    }

    const isMatch = await bcrypt.compare(plainPassword, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password credentials');
    }

    const payload: AuthUserPayload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const token = jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn as any,
    });

    const userObj = user.toObject();
    delete (userObj as any).passwordHash;

    return {
      token,
      user: userObj as Omit<IUser, 'passwordHash'>,
    };
  }

  async getUserById(id: string): Promise<Omit<IUser, 'passwordHash'>> {
    ensureDatabaseConnected();

    const user = await UserModel.findById(id).select('-passwordHash').lean();
    if (!user) {
      throw new NotFoundError(`User account not found with identifier: ${id}`);
    }

    return user as unknown as Omit<IUser, 'passwordHash'>;
  }

  async getAllBrokers(): Promise<Array<{ id: string; name: string; email: string; role: string; title?: string }>> {
    ensureDatabaseConnected();

    const users = await UserModel.find({ isActive: true })
      .select('_id name email role title')
      .lean();

    return users.map((u) => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      role: u.role,
      title: u.title,
    }));
  }
}

export const authService = new AuthService();

