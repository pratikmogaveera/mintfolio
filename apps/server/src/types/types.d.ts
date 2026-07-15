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

interface MFLatestNav {
  meta: {
    fund_house: string;
    scheme_type: string;
    scheme_category: string;
    scheme_code: number;
    scheme_name: string;
    isin_growth: string;
    isin_div_reinvestment: string | null;
  };
  data: [
    {
      date: string; // dd-mm-yyyy
      nav: string;
    },
  ];
  status: string;
}

interface NotificationMessage {
  user_id: string;
  message: { title: string; body: string };
}
