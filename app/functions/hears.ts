/**
 * Telegraf Hears
 * =====================
 *
 * @contributors: Patryk Rzucidło [@ptkdev] <support@ptkdev.io> (https://ptk.dev)
 *
 * @license: MIT License
 *
 */
import bot from "@app/functions/telegraf";
import { readUser } from "./databases";
import { WalletStatus } from "@app/types/databases.type";
// import { callback } from "telegraf/typings/button";
import { inlineKeyboard } from "telegraf/typings/markup";
import Telegraf, { Context, Markup } from "telegraf";
import { authenticator } from "otplib";

/**
 * hears: any taxt
 * =====================
 * Listen any text user write
 *
 */
const text = async (): Promise<void> => {
	bot.on("text", (ctx) => {
		ctx.telegram.sendMessage(ctx.message.chat.id, `Your text --> ${ctx.update.message.text}`);
	});
};
function escapeMarkdownV2(text: string): string {
	return text.replace(/([_~[\](){}>#+-=|\\<>!])/g, "\\$1");
}
const setupMainMenu = async (): Promise<void> => {
	bot.hears("Main Menu", async (ctx) => {
		const user = await readUser(ctx.update.message.from);
		const message = user?.is_2fa_active
			? `@${user?.username} your 2FA is activated!\n Now when you're ready, you can create your wallet`
			: `@${user?.username} you haven't a wallet yet, why not create one?\nThis is a simple 2 step process.\nFirst Please set up a 2FA.`;
		const cta = user?.is_2fa_active ? "Create Wallet" : "Set Up 2FA";
		console.log("User wallet status", user?.wallet_status);
		if (user?.wallet_status === WalletStatus.None || user?.wallet_status === undefined) {
			return ctx.reply(message, Markup.inlineKeyboard([Markup.button.callback(cta, "wallet")]));
		} else {
			const walletStatus = user?.wallet_status === WalletStatus.Active ? "ready to go 🚀" : "being created..";
			// `@${user!.username}, your wallet is ${walletStatus}, please choose an option:`,
			console.log(ctx.message.from.username);
			return ctx.reply(
				`@${ctx.message.from.username}, your wallet is ${walletStatus}, please choose an option:`,
				Markup.inlineKeyboard(
					[
						Markup.button.callback("Wallet", "wallet"),
						Markup.button.callback("Portfolio", "portfolio"),
						Markup.button.callback("Swap", "swap"),
						Markup.button.callback("Add Liquidity", "addlp"),
						Markup.button.callback("Remove Liquidity", "removelp"),
						Markup.button.callback("Stake", "stake"),
						Markup.button.callback("Deposit", "deposit"),
						Markup.button.callback("Withdraw", "withdraw"),
					],
					{ columns: 2 },
				),
			);
		}

		// ctx.telegram
	});
};

const setUpCatch2FA = async (): Promise<void> => {
	bot.hears(/^\d{6}$/, async (ctx) => {
		console.log(ctx.current_action, ctx.secret);

		if (ctx.current_action !== "wallet_creation" && !ctx.secret) {
			return ctx.reply("Sorry, I can't do it, something got wrong");
		}

		// const user = await users.findById(ctx.from?.id!);
		const secret = ctx.secret;
		if (!secret) {
			return ctx.reply("Sorry, secret not found");
		}
		const isValid = authenticator.check(ctx.message?.text, secret);

		if (isValid) {
			// user.is_2fa_active = true;
			// user.secret_2fa = secret;
			// await users.update(user);

			delete ctx.current_action;
			delete ctx.secret;

			return ctx.reply("Great, your 2fa is now activate");
		} else {
			return ctx.reply("Sorry, your token not corresponding with secret, retry !");
		}
	});
};

export { text, setupMainMenu, setUpCatch2FA };
export default text;
