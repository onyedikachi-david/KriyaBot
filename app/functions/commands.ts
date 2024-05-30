import { Vault } from "@wallet/vault/Vault";
import { wordlist } from "@scure/bip39/wordlists/english";
import { generateMnemonic } from "@scure/bip39";
// import { derivationHdPath } from "./../../core/src/crypto";
import { derivationHdPath } from "@wallet/crypto";
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
			ctx.secret = secret;
			console.log(ctx.current_action, ctx.secret);

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

const portfolio = async (): Promise<void> => {
	bot.command("portfolio", (ctx) => {
		// Logic for displaying portfolio
	});
};

const swap = async (): Promise<void> => {
	bot.command("swap", (ctx) => {
		// Logic for swapping tokens
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
