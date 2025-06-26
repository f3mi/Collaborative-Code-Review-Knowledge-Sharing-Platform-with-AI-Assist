import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  provider: "github" | "gitlab";
}

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async login(user: User): Promise<string> {
    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      provider: user.provider,
    };

    return this.jwtService.sign(payload);
  }

  async validateUser(payload: any): Promise<User> {
    // In a real application, you would validate against the database
    return {
      id: payload.sub,
      username: payload.username,
      email: payload.email,
      provider: payload.provider,
    };
  }
}
