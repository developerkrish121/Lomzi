import bcrypt from 'bcrypt';
import { userRepository } from '@/repositories/userRepository.js';
import { AppError } from '@/utils/AppError.js';
import { toPublicUser } from '@/utils/publicUser.js';
import { signAuthToken } from '@/utils/token.js';

const PASSWORD_ROUNDS = 12;

export const authService = {
  async register(input) {
    if (await userRepository.findByEmail(input.email)) {
      throw new AppError('An account with this email already exists', 409, 'EMAIL_IN_USE');
    }
    const password = await bcrypt.hash(input.password, PASSWORD_ROUNDS);
    try {
      const user = await userRepository.create({
        name: input.name,
        email: input.email,
        password,
        phone: input.phone || null,
      });
      return { user: toPublicUser(user), token: signAuthToken(user, input.remember) };
    } catch (error) {
      if (error.code === 'P2002')
        throw new AppError('An account with this email already exists', 409, 'EMAIL_IN_USE');
      throw error;
    }
  },

  async login(input) {
    const user = await userRepository.findByEmail(input.email);
    if (!user || !(await bcrypt.compare(input.password, user.password)) || !user.isActive) {
      throw new AppError('Email or password is incorrect', 401, 'INVALID_CREDENTIALS');
    }
    return { user: toPublicUser(user), token: signAuthToken(user, input.remember) };
  },

  async adminLogin(input) {
    const result = await this.login(input);
    if (result.user.role !== 'ADMIN') {
      throw new AppError('Email or password is incorrect', 401, 'INVALID_CREDENTIALS');
    }
    return result;
  },
};
