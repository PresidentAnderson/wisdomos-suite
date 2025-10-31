import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as bcrypt from 'bcrypt';

export interface User {
  id: string;
  email: string;
  name?: string;
  passwordHash: string;
}

@Injectable()
export class AuthService {
  private supabase: SupabaseClient;
  private users: Map<string, User> = new Map();

  constructor(private jwtService: JwtService) {
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });
      console.log('Supabase auth client initialized successfully');
    } else {
      console.warn('Supabase credentials not found, using in-memory auth');
    }

    // Initialize with a demo user for fallback
    const demoUser: User = {
      id: 'demo-user-id',
      email: 'demo@wisdomos.com',
      name: 'Demo User',
      passwordHash: bcrypt.hashSync('password123', 10),
    };
    this.users.set(demoUser.email, demoUser);
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = this.users.get(email);
    if (user && await bcrypt.compare(password, user.passwordHash)) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(email: string, password: string) {
    if (this.supabase) {
      try {
        // Use Supabase Auth for login
        const { data, error } = await this.supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          console.error('Supabase login error:', error);
          throw new UnauthorizedException('Invalid credentials');
        }

        if (data.user && data.session) {
          return {
            access_token: data.session.access_token,
            user: {
              id: data.user.id,
              email: data.user.email || email,
              name: data.user.user_metadata?.name || 'User',
            },
          };
        }
      } catch (error) {
        console.error('Error logging in with Supabase:', error);
        // Fall through to in-memory fallback
      }
    }

    // Fallback to in-memory login
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  async register(email: string, password: string, name?: string) {
    if (this.supabase) {
      try {
        // Use Supabase Auth for registration
        const { data, error } = await this.supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name || 'User'
            }
          }
        });

        if (error) {
          console.error('Supabase registration error:', error);
          throw new UnauthorizedException(error.message);
        }

        if (data.user) {
          // Return user data
          return {
            access_token: data.session?.access_token || this.jwtService.sign({ email, sub: data.user.id }),
            user: {
              id: data.user.id,
              email: data.user.email || email,
              name: data.user.user_metadata?.name || name,
            },
          };
        }
      } catch (error) {
        console.error('Error registering with Supabase:', error);
        // Fall through to in-memory fallback
      }
    }

    // Fallback to in-memory registration
    if (this.users.has(email)) {
      throw new UnauthorizedException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser: User = {
      id: Date.now().toString(),
      email,
      name,
      passwordHash: hashedPassword,
    };

    this.users.set(email, newUser);

    const payload = { email: newUser.email, sub: newUser.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      },
    };
  }

  async getProfile(userId: string) {
    const user = Array.from(this.users.values()).find(u => u.id === userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    
    const { passwordHash, ...profile } = user;
    return profile;
  }
}