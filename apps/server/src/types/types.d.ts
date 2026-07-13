interface JwtSign {
  sub: string;
}

declare namespace Express {
  interface Request {
    user?: { sub: string };
  }
}

interface MFScheme {
  schemeCode: number;
  schemeName: string;
  isinGrowth: string | null;
  isinDivReinvestment: string | null;
}
