import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-gitlab2";

@Injectable()
export class GitlabStrategy extends PassportStrategy(Strategy, "gitlab") {
  constructor() {
    super({
      clientID: process.env.GITLAB_CLIENT_ID || "",
      clientSecret: process.env.GITLAB_CLIENT_SECRET || "",
      callbackURL: `${process.env.BACKEND_URL || "http://localhost:4000"}/api/auth/gitlab/callback`,
      scope: ["read_user"],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    const { id, username, emails, photos } = profile;

    return {
      id: id.toString(),
      username: username,
      email: emails[0]?.value,
      avatar: photos[0]?.value,
      provider: "gitlab",
    };
  }
}
