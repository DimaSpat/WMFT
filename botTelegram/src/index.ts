
import { config } from 'dotenv';
config();

// @ts-ignore
import TelegramBot from 'node-telegram-bot-api';

interface UserSession {
    step: 'INITIAL' | 'USERNAME_PROMPT' | 'COMPLETE';
    telegramId: number;
    email: string;
    firstName: string;
    lastName?: string;
}

const userSessions = new Map<number, UserSession>();

// Initialize the bot
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// Command handler for /start
bot.onText(/\/start/, async (msg: any): Promise<void> => {
    const { chat: { id }, from } = msg;

    userSessions.set(id, {
        step: 'INITIAL',
        telegramId: from.id,
        username: from.username || '',
        firstName: from.first_name,
        lastName: from.last_name
    });

    const welcomeMessage = `👋 Welcome ${from.first_name}!\n\n`
        + `I'll help you authenticate with our application.\n`
        + `Your current username is: ${from.username || 'Not set'}\n\n`
        + `Choose an action:`;

    await bot.sendMessage(id, welcomeMessage, {
        reply_markup: {
            inline_keyboard: [
                [{ text: '🔑 Authenticate', callback_data: 'auth' }],
                [{ text: '❓ Help', callback_data: 'help' }],
                [{ text: '❌ Cancel', callback_data: 'cancel' }]
            ]
        }
    });
});

// Command handler for /help
bot.onText(/\/help/, async (msg: any): Promise<void> => {
    const { chat: { id } } = msg;
    const helpMessage =
        "Available actions:\n\n"
        + "🔑 Authenticate - Start the authentication process\n"
        + "❓ Help - Show this help message\n"
        + "❌ Cancel - Cancel current operation\n"
        + "🔄 Start Over - Restart the bot";

    await bot.sendMessage(id, helpMessage, {
        reply_markup: {
            inline_keyboard: [
                [{ text: '🔑 Authenticate', callback_data: 'auth' }],
                [{ text: '🔄 Start Over', callback_data: 'start' }]
            ]
        }
    });
});

// Command handler for /cancel
bot.onText(/\/cancel/, async (msg: any): Promise<void> => {
    const { chat: { id } } = msg;
    const session = userSessions.get(id);

    if (session) {
        session.step = 'INITIAL';
        userSessions.set(id, session);
    }

    await bot.sendMessage(id,
        "Operation cancelled.\n"
        + "What would you like to do next?", {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🔑 Authenticate', callback_data: 'auth' }],
                    [{ text: '❓ Help', callback_data: 'help' }]
                ]
            }
        });
});

// Handler for callback queries (button clicks)
bot.on('callback_query', async (callbackQuery: any) => {
    const message = callbackQuery.message;
    const action = callbackQuery.data;
    const chatId = message.chat.id;

    // Answer the callback query to remove the loading state
    await bot.answerCallbackQuery(callbackQuery.id);

    switch (action) {
        case 'auth':
            const session = userSessions.get(chatId);
            if (!session) {
                await bot.sendMessage(chatId,
                    "Please start the bot first using /start or click the button below:", {
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: '🔄 Start Over', callback_data: 'start' }]
                            ]
                        }
                    });
                return;
            }

            try {
                await bot.sendMessage(chatId, "🔄 Processing your authentication...");

                // First, check if the API is reachable
                const apiHealthCheck = await fetch(`${process.env.API_BASE_URL}/health`).catch(() => null);
                if (!apiHealthCheck) {
                    await bot.sendMessage(chatId,
                        "❌ Unable to reach the authentication server.\n\n"
                        + "Please try again in a few minutes.", {
                            reply_markup: {
                                inline_keyboard: [
                                    [{ text: '🔄 Try Again', callback_data: 'auth' }],
                                    [{ text: '❌ Cancel', callback_data: 'cancel' }]
                                ]
                            }
                        });
                    return;
                }

                const verifyResponse = await fetch(`${process.env.API_BASE_URL}/api/auth/telegram/verify`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        telegramId: session.telegramId,
                        username: session.username,
                        firstName: session.firstName,
                        lastName: session.lastName
                    })
                });

                if (!verifyResponse.ok) {
                    const errorText = await verifyResponse.text().catch(() => 'Unknown error');
                    console.error('Verify response error:', errorText);

                    await bot.sendMessage(chatId,
                        "❌ Verification failed.\n\n"
                        + "Error: " + (verifyResponse.status === 429 ? "Too many attempts. Please wait a few minutes." : errorText), {
                            reply_markup: {
                                inline_keyboard: [
                                    [{ text: '🔄 Try Again', callback_data: 'auth' }],
                                    [{ text: '❌ Cancel', callback_data: 'cancel' }]
                                ]
                            }
                        });
                    return;
                }

                const verifyData = await verifyResponse.json();

                if (verifyData.success) {
                    const completeResponse = await fetch(`${process.env.API_BASE_URL}/api/auth/telegram/complete-auth`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            telegramId: session.telegramId
                        })
                    });

                    if (!completeResponse.ok) {
                        const errorText = await completeResponse.text().catch(() => 'Unknown error');
                        console.error('Complete auth error:', errorText);

                        await bot.sendMessage(chatId,
                            "❌ Failed to complete authentication.\n\n"
                            + "Please try again.", {
                                reply_markup: {
                                    inline_keyboard: [
                                        [{ text: '🔄 Try Again', callback_data: 'auth' }],
                                        [{ text: '❌ Cancel', callback_data: 'cancel' }]
                                    ]
                                }
                            });
                        return;
                    }

                    const completeData = await completeResponse.json();

                    if (completeData.success) {
                        // Instead of using a URL button, send the link as text
                        const loginUrl = `${process.env.FRONTEND_URL}/telegram-callback?token=${completeData.token}`;

                        await bot.sendMessage(chatId,
                            "✅ Authentication successful!\n\n"
                            + "Please copy and open this link to complete the process:\n"
                            + `${loginUrl}\n\n`
                            + "The link will expire in 15 4minutes.", {
                                reply_markup: {
                                    inline_keyboard: [
                                        [{ text: '🔄 Start Over', callback_data: 'start' }]
                                    ]
                                }
                            });
                    } else {
                        new Error(completeData.message || 'Failed to complete authentication');
                    }
                } else {
                    await bot.sendMessage(chatId,
                        `❌ Authentication failed:\n${verifyData.message || 'Unknown error'}\n\n`
                        + `Please try again.`, {
                            reply_markup: {
                                inline_keyboard: [
                                    [{ text: '🔄 Try Again', callback_data: 'auth' }],
                                    [{ text: '❌ Cancel', callback_data: 'cancel' }]
                                ]
                            }
                        });
                }
            } catch (error) {
                console.error('Authentication error:', error);

                await bot.sendMessage(chatId,
                    "❌ An unexpected error occurred.\n\n"
                    + "Technical details have been logged for investigation.\n"
                    + "Please try again later or contact support.", {
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: '🔄 Try Again', callback_data: 'auth' }],
                                [{ text: '❌ Cancel', callback_data: 'cancel' }]
                            ]
                        }
                    });
            }
            break;

        case 'help':
            const helpMessage =
                "Available actions:\n\n"
                + "🔑 Authenticate - Start the authentication process\n"
                + "❓ Help - Show this help message\n"
                + "❌ Cancel - Cancel current operation\n"
                + "🔄 Start Over - Restart the bot";

            await bot.sendMessage(chatId, helpMessage, {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🔑 Authenticate', callback_data: 'auth' }],
                        [{ text: '🔄 Start Over', callback_data: 'start' }]
                    ]
                }
            });
            break;

        case 'cancel':
            const userSession = userSessions.get(chatId);
            if (userSession) {
                userSession.step = 'INITIAL';
                userSessions.set(chatId, userSession);
            }

            await bot.sendMessage(chatId,
                "Operation cancelled.\n"
                + "What would you like to do next?", {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: '🔑 Authenticate', callback_data: 'auth' }],
                            [{ text: '❓ Help', callback_data: 'help' }]
                        ]
                    }
                });
            break;

        case 'start':
            // Simulate /start command
            await bot.sendMessage(chatId, "🔄 Starting over...");
            bot.emit('text', {chat: {id: chatId}, from: callbackQuery.from}, '/start');
            break;
    }
});

// Error handler
bot.on('error', (error: Error) => {
    console.error('Telegram bot error:', error);
});

// Polling error handler
bot.on('polling_error', (error: Error) => {
    console.error('Telegram bot polling error:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});