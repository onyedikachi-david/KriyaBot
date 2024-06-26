# KriyaBot

A hack project made during [SUI-Overflow](https://sui-overflow.devfolio.co/) 2024 edition.

Bot: [Telegram](https://telegram.me/KriyaDexBot)

## Demo

Soon

## User flow diagram

```mermaid
flowchart TD
    subgraph Telegram Bot
        A1(User) -->|Interact| A2(Telegram Bot)
    end

    subgraph Command Processing
        B1 -->|DeFi Operations| B2(Kriya DEX SDK)
        B1 -->|Blockchain Queries| B3(Sui.js SDK)
    end

    subgraph Data Handling
        C1 -->|Store/Fetch| C2(Firebase Realtime Database)
        C3 -->|Fetch| C4(Zetta Block API)
    end

    subgraph Security Check
        D1 -->|Authenticate| D2(OTPlib 2FA)
    end

    A2 -->|Send Commands| B1[Process Command]
    B1 --> C1[Database Interaction]
    B1 --> D1[Perform 2FA]
    C1 --> A2[Return Data]
    B2 --> C1
    B3 --> C1
    C3 --> A2
```

## KriyaBot Commands

**General:**

- `/start`: Send a welcome message and initialize user data.
- `/quit`: Leave the bot and the chat.

**Wallet:**

- `/wallet`: View your wallet address or create a new one.
- `/portfolio`: View your portfolio balance.
- `/swap`: Swap tokens between different pools.
- `/addlp`: Add liquidity to a pool.
- `/removelp`: Remove liquidity from a pool.
- `/stake`: Stake tokens to earn rewards.
- `/deposit`: Deposit tokens into a CLMM vault.
- `/withdraw`: Withdraw tokens from a CLMM vault.

**2FA:**

- `/2fa`: Set up two-factor authentication for your wallet.


**Additional Notes:**

- Some commands require the user to have a wallet set up.
- The  `/swap`  command is currently in development and may not be fully functional.
- The bot is still under development and new features may be added in the future.

## Example Usage

- To create a new wallet, send the  `/wallet`  command.
- To view your portfolio balance, send the  `/portfolio`  command.
- To swap tokens, send the  `/swap`  command and follow the instructions.
- To set up two-factor authentication, send the  `/2fa`  command.

## Short Description

KriyaDexBot is a trustless messaging bot that allows easy interaction with the Kriya finance. The bot generates a wallet for the user for now; zklogin will be implemented in the future.

## Long description

### Wallet Management

- Create and manage wallets.
- Generate new wallets.
- View wallet addresses.
- Manage 2FA security.

### Portfolio Tracking

Track balances and holdings of various SUI tokens.

### DeFi Operations

Swap tokens directly within Telegram.
Add and remove liquidity from pools.
Stake tokens for passive income.
Deposit and withdraw funds from the CLMM vault.

### User-Friendly Interface

Simple and intuitive commands for easy interaction.
2FA security for enhanced protection.

### Seamless Integration with Telegram

Perform DeFi actions directly within the familiar Telegram interface.


Future Development:

Integrate with additional DeFi protocols and services.
Implement advanced features like limit orders and stop-loss orders.
Enhance the user interface with more interactive elements.
Expand support for multiple languages.
Conclusion:

KriyaBot is a promising project that aims to simplify DeFi interactions for SUI users. Its user-friendly interface and comprehensive features make it a valuable tool for both beginners and experienced DeFi enthusiasts. As the project continues to develop, it has the potential to become a leading DeFi platform within the SUI ecosystem.

Additional Notes:

The project utilizes the Sui.js SDK for interacting with the SUI blockchain.
The bot is currently in development and may have limited functionality.
The project is open-source and contributions are welcome.

## How It's Made

### Tech Stack

Language: [Typescript](https://www.typescriptlang.org/).
Prod environment: [Firebase](https://firebase.google.com/) will be used, still locally housed for now.
CI: [Github Actions](https://help.github.com/en/actions)
API: [Zetta Block](zettablock.com)
Defi: [Kriya finance](kriya.finance)
Lib:  [telegraf](https://telegraf.js.org), [@mysten/sui](https://www.npmjs.com/package/sui), [Kriya DEX SDK](https://www.npmjs.com/package/kriya-dex-sdk)

For the telegram bot development, I started from this [starter kit template](https://github.com/ptkdev-boilerplate/node-telegram-bot-boilerplate), which is a **Telegraf** JS library template

For the production environment, **Firebase** will be chosen for its convenience as a serverless solution and zero cost for a humble app.

### Software Architecture

The KriyaBot project utilizes a modular architecture to ensure maintainability and scalability. The following components are involved:

**1. Telegram Bot:**

- This is the primary interface for users to interact with the bot.
- It is built using the Telegraf library and deployed on Firebase.
- The bot handles user commands, provides information, and executes DeFi operations.

**2. DeFi SDK:**

- The Kriya DEX SDK is used to interact with the Kriya finance protocol.
- It provides functions for swapping tokens, adding/removing liquidity, staking, and depositing/withdrawing funds.

**3. Sui.js SDK:**

- The Sui.js SDK is used to interact with the Sui blockchain.
- It provides functions for querying balances, sending transactions, and managing wallets.

**4. Database:**

- A database is used to store user information, wallet details, and transaction history.
- Currently, Firebase Realtime Database is used for this purpose.

**5. API:**

- The Zetta Block API is used to fetch data about available liquidity pools.
- This data is used to populate the bot's swap functionality.
- Zetta block is also used to notify users of new pools using webhook.

**6. Security:**

- Two-factor authentication (2FA) is implemented using the OTPlib library.
- This ensures that only authorized users can access their wallets and perform DeFi operations.

**7. CI/CD:**

- Github Actions are used for continuous integration and deployment.
- This automates the build, test, and deployment process.

**9. Future Development:**

- The project will continue to be developed with a focus on adding new features and improving the user experience.
- This includes integrating with additional DeFi protocols, implementing advanced features, and expanding support for multiple languages.


### Sponsor Prizes Applicability

Kriya finance, Zetta block.

## Technical documentation

See [Developers documentation](docs/00-Developers-documentation.md)
