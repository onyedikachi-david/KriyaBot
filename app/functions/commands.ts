import { Vault } from "@wallet/vault/Vault";
import { wordlist } from "@scure/bip39/wordlists/english";
import { generateMnemonic } from "@scure/bip39";
// import { derivationHdPath } from "./../../core/src/crypto";
import { derivationHdPath } from "@wallet/crypto";
// import { TEMP_POOL_DATA } from "@app/constants/pools";
import { computeZkLoginAddressFromSeed } from "@mysten/sui/zklogin";

/**
 * Telegraf Commands
 * =====================
 *
 * @contributors: Patryk Rzucidło [@ptkdev] <support@ptkdev.io> (https://ptk.dev)
 *
 * @license: MIT License
 *
 */
import bot from "@app/functions/telegraf";
import * as databases from "@app/functions/databases";
import config from "@configs/config";
import { launchPolling, launchWebhook } from "./launcher";
import { readUser } from "@app/functions/databases";
import { WalletStatus } from "@app/types/databases.type";
import { authenticator } from "otplib";
import QRCode from "qrcode";
import { Markup } from "telegraf";
import { TEMP_POOL_DATA } from "@app/constants/pool";
import { v4 as uuidv4 } from "uuid";
import { TransactionBlock } from "@mysten/sui.js";
import { Dex } from "kriya-dex-sdk";
require("isomorphic-fetch");

/**
 * command: /quit
 * =====================
 * If user exit from bot
 *
 */
const quit = async (): Promise<void> => {
	bot.command("quit", (ctx) => {
		ctx.telegram.leaveChat(ctx.message.chat.id);
		ctx.leaveChat();
	});
};

async function fetchData() {
	try {
		const response = await fetch(
			"https://api.zettablock.com/api/v1/dataset/sq_96dd18a38e394b43b5ca5ddfe009c396/graphql",
			{
				method: "POST",
				headers: {
					Accept: "*/*",
					"User-Agent": "Thunder Client (https://www.thunderclient.com)",
					"X-API-KEY": "228ef114-329e-477f-93ff-b1c8bb320c1b",
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					query: `
          query pools {
            records {
              package_id
              token_x_symbol
              token_x_name
              token_y_symbol
              token_y_name
            }
          }`,
				}),
			},
		);
		const result = await response.json();
		return result.data.records;
	} catch (error) {
		console.error("Error fetching data:", error);
	}
}

const poolStore = {};
const generatePoolButtons = async () => {
	const pools = await fetchData();
	return pools.map((pool, index) => {
		const poolKey = uuidv4(); // Generate a unique key for each pool
		poolStore[poolKey] = pool; // Store the pool data in the in-memory store
		const label = `${pool.token_x_symbol || "Unknown"} - ${pool.token_y_symbol || "Unknown"}`;
		return Markup.button.callback(label, `select_pool:${poolKey}`);
	});
};

/**
 * command: /photo
 * =====================
 * Send photo from picsum to chat
 *
 */
const sendPhoto = async (): Promise<void> => {
	bot.command("photo", (ctx) => {
		ctx.replyWithPhoto(
			"https://www.pexels.com/photo/toddle-wearing-gray-button-collared-shirt-with-curly-hair-35537/",
		);
	});
};

async function generateWallet() {
	const mnemonic = generateMnemonic(wordlist);
	const vault = await Vault.fromMnemonic(derivationHdPath(0), mnemonic);
	const address = vault.getAddress();
	const pk = vault.getPrivateKey();
	return address;
}

const wallet = async (): Promise<void> => {
	bot.command("wallet", async (ctx) => {
		const user = await readUser(ctx.update.message.from);
		if (!user?.wallet_address) {
			return ctx.reply(
				`@${user?.username} you haven't a wallet yet, why not create one?\nThis is a simple 2 step process.\nFirst Please set up a 2FA.`,
				Markup.inlineKeyboard([Markup.button.callback("Create Wallet", "wallet")]),
			);
		} else {
			return ctx.reply(`Your wallet address is:\n\`${user.wallet_address}`);
		}

		// ctx.reply(address);
	});
	bot.action("wallet", async (ctx) => {
		if (!ctx.from) {
			return ctx.reply("User information is unavailable.");
		}
		const user = await readUser(ctx.from); // Logic for creating/viewing wallet
		if (user?.wallet_status !== WalletStatus.None) {
			return ctx.reply("You already have a wallet, or maybe it is in the process of being created?");
		}

		if (!user.is_2fa_active) {
			let secret;
			if (ctx.current_action && ctx.current_action === "wallet_creation") {
				secret = ctx.secret;
			} else {
				secret = authenticator.generateSecret();
				ctx.current_action = "wallet_creation";
				ctx.secret = secret;
			}
			if (!user.username) {
				return ctx.reply("Username is required to generate QR code.");
			}
			if (!secret) {
				return ctx.reply("Secret is required to generate QR code.");
			}
			const otpauth = authenticator.keyuri(user.username, "KriyaBot", secret);
			const qrcode = await QRCode.toDataURL(otpauth);
			// set session to wallet_creation and the secret to session also
			ctx.current_action = "wallet_creation";
			// @ts-ignore
			ctx.session.current_action = "wallet_creation";
			ctx.secret = secret;
			// @ts-ignore
			ctx.session.secret = secret;
			console.log(ctx.current_action, ctx.secret);
			// ctx.sess

			return ctx.replyWithPhoto(
				{ source: Buffer.from(qrcode.substring(22), "base64") },
				{
					caption: `I'll ask you your secret code anytime you want to move your funds around.\n\n*Secret*: \`${secret}\`\n*Service*: \`${"KriyaBot"}\`\nType your obtained code when you are ready`,
					parse_mode: "Markdown",
				},
			);
		}
		const address = await generateWallet();
		user.wallet_address = address;
		user.wallet_status = WalletStatus.Active;
		console.log(user.id, user.wallet_address, user.wallet_status);
		await databases.updateUserWalletDetails(user.id, user.wallet_address, user.wallet_status);
		return ctx.reply(`🎉 Here's your new wallet address: \`${address}\` 🚀`, { parse_mode: "Markdown" });
	});
};

// const getSigner = (pk: string) => {
// 	return Ed25519Keypair.fromSecretKey(base64ToUint8Array(pk));
// };

const portfolio = async (): Promise<void> => {
	bot.command("portfolio", (ctx) => {
		// Logic for displaying portfolio
	});
};

const swap = async (): Promise<void> => {
	bot.command("swap", async (ctx) => {
		const poolButtons = await generatePoolButtons();
		await ctx.reply("Select a pool to swap from:", Markup.inlineKeyboard(poolButtons, { columns: 2 }));
	});

	bot.action(/^select_pool:(.+)$/, async (ctx) => {
		const poolKey = ctx.match[1];
		const pool = poolStore[poolKey]; // Retrieve the pool data using the shortened key
		ctx.session.pool = {
			objectId: pool.package_id,
			tokenXType: pool.token_x_symbol,
			tokenYType: pool.token_y_symbol,
		};
		ctx.session.poolKey = poolKey;
		await ctx.reply(
			`Pool selected: ${pool.token_x_symbol || "Unknown"} - ${
				pool.token_y_symbol || "Unknown"
			}. Now, please enter the token type ('tokenX' or 'tokenY'):`,
		);
	});

	bot.hears(/^(tokenX|tokenY)$/, async (ctx) => {
		// @ts-ignore
		if (!ctx.session.pool) {
			return ctx.reply("Please select a pool first.");
		}
		// @ts-ignore
		ctx.session.inputCoinType = ctx.message.text;
		await ctx.reply(
			"Enter the amount to swap and the minimum amount to receive, separated by space (e.g., '1000 900'):",
		);
	});

	bot.hears(/^\d+\s\d+$/, async (ctx) => {
		const [inputCoinAmount, minReceived] = ctx.message.text.split(" ");
		if (!inputCoinAmount || !minReceived) {
			return ctx.reply("Invalid command format. Usage: <inputCoinAmount> <minReceived>");
		}
		ctx.session.inputCoinAmount = inputCoinAmount;
		ctx.session.minReceived = minReceived;

		const confirmationMessage = `Confirm swap:\n- Pool: ${ctx.session.pool.tokenXType} - ${ctx.session.pool.tokenYType}\n- Type: ${ctx.session.inputCoinType}\n- Amount: ${inputCoinAmount}\n- Min Received: ${minReceived}`;
		await ctx.reply(
			confirmationMessage,
			Markup.inlineKeyboard([
				Markup.button.callback("Confirm Swap", "confirm_swap"),
				Markup.button.callback("Cancel", "cancel_swap"),
			]),
		);
	});

	bot.action("confirm_swap", async (ctx) => {
		if (
			// @ts-ignore
			!ctx.session.pool ||
			// @ts-ignore
			!ctx.session.inputCoinType ||
			// @ts-ignore
			!ctx.session.inputCoinAmount ||
			// @ts-ignore
			!ctx.session.minReceived
		) {
			return ctx.reply("Session expired or invalid. Please start over.");
		}
		const txb = new TransactionBlock(); // Placeholder for transaction block handling
		// const txb = "hjsjkbjhsaikjmds"; // Placeholder for transaction block handling

		const dex = new Dex("https://fullnode.mainnet.sui.io:443");
		const result = await kriyaSDK.swap(
			// @ts-ignore
			ctx?.session.pool,
			// @ts-ignore
			ctx.session.inputCoinType,
			// @ts-ignore
			ctx.session.inputCoinAmount,
			// @ts-ignore
			ctx.session.inputCoinType === "tokenX" ? ctx.session.pool.tokenX : ctx.session.pool.tokenY,
			// @ts-ignore
			ctx.session.minReceived,
			txb,
		);

		if (result) {
			ctx.reply(`Swap successful! Transaction ID: ${result.message}`);
		} else {
			ctx.reply("Swap failed. Please try again.");
		}
		// Clear session after operation
		// @ts-ignore
		delete ctx.session.pool;
		// @ts-ignore
		delete ctx.session.inputCoinType;
		// @ts-ignore
		delete ctx.session.inputCoinAmount;
		// @ts-ignore
		delete ctx.session.minReceived;
	});

	bot.action("cancel_swap", async (ctx) => {
		await ctx.reply("Swap cancelled.");
		// Clear session
		// @ts-ignore
		delete ctx.session.pool;
		// @ts-ignore
		delete ctx.session.inputCoinType;
		// @ts-ignore
		delete ctx.session.inputCoinAmount;
		// @ts-ignore
		delete ctx.session.minReceived;
	});
};

const addlp = async (): Promise<void> => {
	bot.command("addlp", (ctx) => {
		// Logic for adding liquidity
	});
};

const removelp = async (): Promise<void> => {
	bot.command("removelp", (ctx) => {});
};

const stake = async (): Promise<void> => {
	bot.command("stake", (ctx) => {});
};

const deposit = async (): Promise<void> => {
	bot.command("deposit", (ctx) => {
		// Logic for depositing in CLMM vault
	});
};

const withdraw = async (): Promise<void> => {
	bot.command("withdraw", (ctx) => {
		// Logic for withdrawing from CLMM vault
	});
};

/**
 * command: /start
 * =====================
 * Send welcome message
 *
 */
const start = async (): Promise<void> => {
	bot.start((ctx) => {
		databases.writeUser(ctx.update.message.from);

		ctx.telegram.sendMessage(ctx.message.chat.id, `Welcome! Try send /photo command or write any text`);
	});
};

/**
 * Run bot
 * =====================
 * Send welcome message
 *
 */
const launch = async (): Promise<void> => {
	const mode = config.mode;
	if (mode === "webhook") {
		launchWebhook();
	} else {
		launchPolling();
	}
};

export { launch, quit, sendPhoto, start, wallet, portfolio, swap, addlp, removelp, stake, deposit, withdraw };
export default launch;
