import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-github2";

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, "github") {
  constructor() {
    super({
      clientID: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
      callbackURL: `${process.env.BACKEND_URL || "http://localhost:4000"}/api/auth/github/callback`,
      scope: ["user:email"],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    const { id, username, emails, photos } = profile;

    return {
      id: id.toString(),
      username: username,
      email: emails[0]?.value,
      avatar: photos[0]?.value,
      provider: "github",
    };
  }
}
