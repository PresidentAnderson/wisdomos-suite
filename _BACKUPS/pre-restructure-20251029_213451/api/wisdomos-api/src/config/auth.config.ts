/**
 * @fileoverview Authentication Configuration for WisdomOS API
 * @author Jonathan Anderson <contact@axaiinnovations.com>
 * @license PROPRIETARY - All rights reserved. Unauthorized copying or distribution is prohibited.
 * @copyright © 2025 AXAI Innovations. Phoenix Operating System.
 */

import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
    algorithm: 'HS256',
    issuer: 'wisdomos-api',
    audience: 'wisdomos-app',
  },
  
  // Password hashing
  password: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
    minLength: parseInt(process.env.PASSWORD_MIN_LENGTH || '8', 10),
    maxLength: parseInt(process.env.PASSWORD_MAX_LENGTH || '128', 10),
    requireNumbers: process.env.PASSWORD_REQUIRE_NUMBERS === 'true',
    requireUppercase: process.env.PASSWORD_REQUIRE_UPPERCASE === 'true',
    requireLowercase: process.env.PASSWORD_REQUIRE_LOWERCASE === 'true',
    requireSpecialChars: process.env.PASSWORD_REQUIRE_SPECIAL === 'true',
  },
  
  // Session configuration
  session: {
    name: 'wisdomos-session',
    maxAge: parseInt(process.env.SESSION_MAX_AGE || '604800000', 10), // 7 days
    rolling: process.env.SESSION_ROLLING === 'true',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.COOKIE_SAME_SITE || 'lax',
    domain: process.env.COOKIE_DOMAIN,
  },
  
  // OAuth providers
  oauth: {
    google: {
      clientId: process.env.GOOGLE_OAUTH_CLIENT_ID,
      clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
      redirectUri: process.env.GOOGLE_OAUTH_REDIRECT_URI,
      scope: ['profile', 'email'],
    },
    github: {
      clientId: process.env.GITHUB_OAUTH_CLIENT_ID,
      clientSecret: process.env.GITHUB_OAUTH_CLIENT_SECRET,
      redirectUri: process.env.GITHUB_OAUTH_REDIRECT_URI,
      scope: ['user:email'],
    },
  },
  
  // Account lockout
  lockout: {
    enabled: process.env.ACCOUNT_LOCKOUT_ENABLED === 'true',
    maxAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5', 10),
    lockoutDuration: parseInt(process.env.LOCKOUT_DURATION || '900000', 10), // 15 minutes
    resetAfter: parseInt(process.env.LOCKOUT_RESET_AFTER || '3600000', 10), // 1 hour
  },
  
  // Email verification
  emailVerification: {
    required: process.env.EMAIL_VERIFICATION_REQUIRED === 'true',
    tokenExpiry: parseInt(process.env.EMAIL_VERIFICATION_TOKEN_EXPIRY || '86400000', 10), // 24 hours
    maxResends: parseInt(process.env.EMAIL_VERIFICATION_MAX_RESENDS || '3', 10),
  },
  
  // Password reset
  passwordReset: {
    tokenExpiry: parseInt(process.env.PASSWORD_RESET_TOKEN_EXPIRY || '3600000', 10), // 1 hour
    maxRequests: parseInt(process.env.PASSWORD_RESET_MAX_REQUESTS || '3', 10),
    cooldown: parseInt(process.env.PASSWORD_RESET_COOLDOWN || '300000', 10), // 5 minutes
  },
  
  // Rate limiting
  rateLimit: {
    login: {
      windowMs: parseInt(process.env.LOGIN_RATE_LIMIT_WINDOW || '900000', 10), // 15 minutes
      maxAttempts: parseInt(process.env.LOGIN_RATE_LIMIT_MAX || '5', 10),
    },
    register: {
      windowMs: parseInt(process.env.REGISTER_RATE_LIMIT_WINDOW || '3600000', 10), // 1 hour
      maxAttempts: parseInt(process.env.REGISTER_RATE_LIMIT_MAX || '3', 10),
    },
    passwordReset: {
      windowMs: parseInt(process.env.PASSWORD_RESET_RATE_LIMIT_WINDOW || '3600000', 10), // 1 hour
      maxAttempts: parseInt(process.env.PASSWORD_RESET_RATE_LIMIT_MAX || '3', 10),
    },
  },
}));