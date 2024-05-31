export const TEMP_POOL_DATA: Record<
	string,
	{
		id: string;
		upsaclingFactor: number;
		baseToken: string;
		amountUpscalingFactor: number;
		tickSize: number;
		minAmount: number;
		lotSize: number;
	}
> = {
	// V2 pools
	"0xc0833efe1d86978ebf57a3ce4a41b2c2b9e20faf802305f1eda306c8fc64ee40": {
		id: "0xc08",
		upsaclingFactor: 1e13,
		amountUpscalingFactor: 1e5,
		baseToken: "FUD",
		tickSize: 100,
		minAmount: 100,
		lotSize: 100000000000,
	},
	"0x4405b50d791fd3346754e8171aaab6bc2ed26c2c46efdd033c14b30ae507ac33": {
		id: "0x440",
		upsaclingFactor: 1e6,
		amountUpscalingFactor: 1e9,
		baseToken: "SUI",
		tickSize: 100,
		minAmount: 0.1,
		lotSize: 100000000,
	},
	"0x6e417ee1c12ad5f2600a66bc80c7bd52ff3cb7c072d508700d17cf1325324527": {
		id: "0x6e4",
		upsaclingFactor: 1e7,
		baseToken: "WETH",
		amountUpscalingFactor: 1e8,
		tickSize: 1000000,
		minAmount: 0.0001,
		lotSize: 10000,
	},
	"0x31d1790e617eef7f516555124155b28d663e5c600317c769a75ee6336a54c07f": {
		id: "0x31d",
		upsaclingFactor: 1e7,
		baseToken: "WBTC",
		tickSize: 1000000,
		minAmount: 0.00001,
		lotSize: 1000,
		amountUpscalingFactor: 1e8,
	},
	"0xd1f0a9baacc1864ab19534e2d4c5d6c14f2e071a1f075e8e7f9d51f2c17dc238": {
		id: "0xd1f",
		upsaclingFactor: 1e9,
		baseToken: "USDT",
		tickSize: 100000,
		minAmount: 0.1,
		lotSize: 100000,
		amountUpscalingFactor: 1e6,
	},
	// v1 pools
	"0x7f526b1263c4b91b43c9e646419b5696f424de28dda3c1e6658cc0a54558baa7": {
		id: "0x7f5",
		upsaclingFactor: 1e6,
		amountUpscalingFactor: 1e9,
		baseToken: "SUI",
		tickSize: 100,
		minAmount: 0.1,
		lotSize: 100000000,
	},
	"0xd9e45ab5440d61cc52e3b2bd915cdd643146f7593d587c715bc7bfa48311d826": {
		id: "0xd9e",
		upsaclingFactor: 1e7,
		baseToken: "WETH",
		amountUpscalingFactor: 1e8,
		tickSize: 1000000,
		minAmount: 0.0001,
		lotSize: 10000,
	},
	"0xf0f663cf87f1eb124da2fc9be813e0ce262146f3df60bc2052d738eb41a25899": {
		id: "0xf0f",
		upsaclingFactor: 1e7,
		baseToken: "WBTC",
		tickSize: 1000000,
		minAmount: 0.00001,
		lotSize: 1000,
		amountUpscalingFactor: 1e8,
	},
	"0x5deafda22b6b86127ea4299503362638bea0ca33bb212ea3a67b029356b8b955": {
		id: "0x5de",
		upsaclingFactor: 1e9,
		baseToken: "USDC",
		tickSize: 100000,
		minAmount: 0.1,
		lotSize: 100000,
		amountUpscalingFactor: 1e6,
	},
	// testnet pools
	"0xb288337ce29aff7fbce8827ba16e74f0f4c1c0b312873464bd220f2eb771edc6": {
		id: "0xb28",
		upsaclingFactor: 1e7,
		baseToken: "WBTC",
		tickSize: 1000000,
		minAmount: 0.00001,
		lotSize: 1000,
		amountUpscalingFactor: 1e6,
	},
	"0x715a62958fba1e7c8d61d849fdd0b60c734a24a6e78fbefd8049b0f7e41b7204": {
		id: "0x715",
		upsaclingFactor: 1e7,
		baseToken: "WBTC",
		tickSize: 1000000,
		minAmount: 0.00001,
		lotSize: 1000,
		amountUpscalingFactor: 1e8,
	},
	"0x22b276b1f0e2dca4e7483f7da035e7f99d8831aa9cbec131058b6bb5768f998d": {
		id: "0x22b",
		upsaclingFactor: 1e7,
		baseToken: "WBTC",
		tickSize: 1000000,
		minAmount: 0.00001,
		lotSize: 1000,
		amountUpscalingFactor: 1e8,
	},
};

export interface Pool {
	objectId: string;
	tokenXType: string;
	tokenYType: string;
	isStable?: boolean;
}

export interface Farm {
	objectId: string;
	tokenXType: string;
	tokenYType: string;
}

export interface CustodialAccount {
	tokenXFree: bigint;
	tokenYFree: bigint;
	tokenXLocked: bigint;
	tokenYLocked: bigint;
}

export interface Order {
	orderId: BigInt;
	clientOrderId: number;
	price: number;
	originalQuantity: number;
	quantity: number;
	isBid: boolean;
	owner: string;
	expireTimestamp: number;
	selfMatchingPrevention: number;
}

export interface OpenOrders {
	isBid: boolean;
	price: number;
	quantity: number;
	remainingQuantity: number;
	orderId: bigint;
}

export interface DeepbookPoolParams {
	poolId: string;
	tokenXType: string;
	tokenYType: string;
	tokenXDecimals: number;
	orderNum: number;
	priceUpscallingFactor?: number;
}

export interface PoolOrderbookData {
	bidBook: Record<number, number>;
	askBook: Record<number, number>;
	bestAsk: number;
	bestBid: number;
	minAmount: number;
}
