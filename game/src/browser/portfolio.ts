export type Direction = 'long' | 'short';

export const FEE_RATE = 0.001;

export function calcFee(notional: number): number {
  return +(notional * FEE_RATE).toFixed(2);
}

export interface Position {
  id: string;
  assetId: string;
  symbol: string;
  direction: Direction;
  amount: number;
  entryPrice: number;
  entryFee: number;
}

export function calcPL(position: Position, currentPrice: number): number {
  return position.direction === 'long'
    ? (currentPrice - position.entryPrice) * position.amount
    : (position.entryPrice - currentPrice) * position.amount;
}

export function calcNetPL(position: Position, currentPrice: number, closeFee: number): number {
  return +(calcPL(position, currentPrice) - position.entryFee - closeFee).toFixed(2);
}

export type TradeKind = 'buy' | 'short' | 'close';

export interface Trade {
  id: string;
  t: number;
  kind: TradeKind;
  assetId: string;
  symbol: string;
  direction: Direction;
  amount: number;
  price: number;
  total: number;
  fee: number;
  pl?: number;
  netPl?: number;
  entryPrice?: number;
}
