/**
 * Database: lowdb
 * =====================
 *
 * @contributors: Patryk Rzucidło [@ptkdev] <support@ptkdev.io> (https://ptk.dev)
 *
 * @license: MIT License
 *
 */
import { WalletStatus, type TelegramUserInterface } from "@app/types/databases.type";
import configs from "@configs/config";
import lowdb from "lowdb";
import lowdbFileSync from "lowdb/adapters/FileSync";

const databases = { users: lowdb(new lowdbFileSync<{ users: TelegramUserInterface[] }>(configs.databases.users)) };

databases.users = lowdb(new lowdbFileSync(configs.databases.users));
databases.users.defaults({ users: [] }).write();

/**
 * writeUser()
 * =====================
 * Write user information from telegram context to user database
 *
 * @Context: ctx.update.message.from
 *
 * @interface [TelegramUserInterface](https://github.com/ptkdev-boilerplate/node-telegram-bot-boilerplate/blob/main/app/webcomponent/types/databases.type.ts)
 *
 * @param { TelegramUserInterface } json - telegram user object
 *
 */
const writeUser = async (json: TelegramUserInterface): Promise<void> => {
	const user_id = databases.users.get("users").find({ id: json.id }).value();

	const extendedJson = {
		...json,
		is_2fa_active: false,
		wallet_status: WalletStatus.None,
		wallet_address: "",
	};

	if (user_id) {
		databases.users.get("users").find({ id: user_id.id }).assign(extendedJson).write();
	} else {
		databases.users.get("users").push(extendedJson).write();
	}
};

const updateUserWalletDetails = async (userId: number, walletAddress: string, walletStatus: WalletStatus): Promise<void> => {
    databases.users.get("users")
        .find({ id: userId })
        .assign({ wallet_address: walletAddress, wallet_status: walletStatus }).value();
};


// Read a user by ID
const readUser = async (json: TelegramUserInterface): Promise<TelegramUserInterface | undefined> => {
	return databases.users.get("users").find({ id: json.id }).value();
};

// Update a user; this functionality is already handled in writeUser
// If needed separately, it can be refactored or called directly.

// Delete a user by ID
const deleteUser = async (json: TelegramUserInterface): Promise<void> => {
	databases.users.get("users").remove({ id: json.id }).write();
};

export { databases, writeUser, readUser, deleteUser, updateUserWalletDetails };
export default databases;
