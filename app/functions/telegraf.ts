/**
 * Telegraf
 * =====================
 *
 * @contributors: Patryk Rzucidło [@ptkdev] <support@ptkdev.io> (https://ptk.dev)
 *
 * @license: MIT License
 *
 */
import { Context, Telegraf, session } from "telegraf";
import configs from "@configs/config";
// import { SQLite } from "@telegraf/session/sqlite";
import LocalSession from "telegraf-session-local";

// const store = SQLite({
// 	filename: "./telegraf-sessions.sqlite",
// });

// Define your own context type
interface KriyaBotContext extends Context {
	current_action?: string;
	secret?: string;
}
const bot = new Telegraf<KriyaBotContext>(configs.telegram.token);
bot.use(new LocalSession({ database: "example_db.json" }).middleware());

// bot.use(session)
// bot.use(session({ store: store as any }));

export { bot };
export default bot;
