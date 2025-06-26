import { Controller, Get, Post, Req, Res, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Response } from "express";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get("github")
  @UseGuards(AuthGuard("github"))
  async githubAuth() {
    // GitHub OAuth will handle the redirect
  }

  @Get("github/callback")
  @UseGuards(AuthGuard("github"))
  async githubAuthCallback(@Req() req: any, @Res() res: Response) {
    const token = await this.authService.login(req.user);
    res.redirect(
      `${process.env.FRONTEND_URL || "http://localhost:3000"}?token=${token}`
    );
  }

  @Get("gitlab")
  @UseGuards(AuthGuard("gitlab"))
  async gitlabAuth() {
    // GitLab OAuth will handle the redirect
  }

  @Get("gitlab/callback")
  @UseGuards(AuthGuard("gitlab"))
  async gitlabAuthCallback(@Req() req: any, @Res() res: Response) {
    const token = await this.authService.login(req.user);
    res.redirect(
      `${process.env.FRONTEND_URL || "http://localhost:3000"}?token=${token}`
    );
  }

  @Get("me")
  @UseGuards(AuthGuard("jwt"))
  async getProfile(@Req() req: any) {
    return req.user;
  }

  @Post("logout")
  async logout(@Res() res: Response) {
    res.clearCookie("auth_token");
    res.json({ message: "Logged out successfully" });
  }
}
