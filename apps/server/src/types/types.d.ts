interface JwtSign {
  sub: string;
}

declare namespace Express {
  interface Request {
    user?: { sub: string };
  }
}
