export interface Holding {
  id: string;
  scheme_name: string;
  scheme_code: string;
  units: string;
  amount_invested: string;
}

export interface PortfolioLog {
  id: string;
  date: string;
  total_invested: string;
  current_value: string;
}
