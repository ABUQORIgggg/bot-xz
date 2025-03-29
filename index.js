const TelegramBot = require('node-telegram-bot-api');

// Replace with your bot token
const token = '7503005676:AAH7F3_Nyp6lyk-v_tp2iB4HdjSy5VQ-5G0';
const botOptions = {
    polling: {
        interval: 300,
        autoStart: true,
        params: {
            timeout: 10
        }
    }
};

const bot = new TelegramBot(token, botOptions);

// Group chat ID
const GROUP_CHAT_ID = '-1002656957636';

// Subscriber options
const subscriberOptions = {
  '500ta 20min': { count: 500, time: 20 },
  '1k 35min': { count: 1000, time: 35 },
  '2k 70min': { count: 2000, time: 70 },
  '3k 100min': { count: 3000, time: 100 },
  '4k 125min': { count: 4000, time: 125 },
  '5k 150min': { count: 5000, time: 150 },
  '6k 175min': { count: 6000, time: 175 },
  '7k 200min': { count: 7000, time: 200 },
  '8k 225min': { count: 8000, time: 225 },
  '9k 250min': { count: 9000, time: 250 },
  '10k 300min': { count: 10000, time: 300 },
  '20k 600min': { count: 20000, time: 600 },
};

// Payment details
const paymentDetails = `
💸 Tolov qilib chekni yuboring (cheksiz tolov qabul qilinmaydi):  
💳 Karta: **5614 6820 08451280**  
👤 Ism: **BAROTOV MUHAMMAD HABIB**  
📞 Ulangan nomer: **+998 94 232 56 07**
`;

// Store user states
const userStates = {};

// Main menu
const mainMenu = {
  reply_markup: {
    inline_keyboard: [
      [{ text: 'Obunachilar', callback_data: 'subscribers' }],
      [{ text: 'Logo/Yasash', callback_data: 'logo' }],
      [{ text: 'Rekka chiqish strategiyasi', callback_data: 'strategy' }],
    ],
  },
};

// Back button
const backButton = {
  reply_markup: {
    inline_keyboard: [[{ text: '🔙 Orqaga', callback_data: 'back' }]],
  },
};

// Handle polling errors
bot.on('polling_error', (error) => {
    console.error('Polling error:', error.code, error.message);
});

// Handle /start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, '🎉 Xush kelibsiz! Quyidagi xizmatlardan birini tanlang:', mainMenu)
    .catch(err => console.error('Error sending start message:', err));
});

// Handle callback queries
bot.on('callback_query', async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const userId = callbackQuery.from.id;
  const data = callbackQuery.data;
  const messageId = callbackQuery.message.message_id;

  try {
    if (data === 'subscribers') {
      const options = Object.keys(subscriberOptions).map((key) => [{ text: key, callback_data: key }]);
      options.push([{ text: '🔙 Orqaga', callback_data: 'back' }]);
      await bot.editMessageText('📈 Obuna tanlang:', {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: { inline_keyboard: options }
      });
    } 
    else if (subscriberOptions[data]) {
      userStates[userId] = { selectedPlan: data, type: 'subscribers' };
      await bot.editMessageText(`✅ Siz "${data}" tanladingiz.\n\n${paymentDetails}\n\n🔄 Tolov chekini yuboring va tasdiqlanishini kuting...`, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'Markdown',
        reply_markup: backButton.reply_markup
      });
    } 
    else if (data === 'logo') {
      await bot.editMessageText('🎨 Logo yasash uchun quyidagi Telegram manziliga murojaat qiling:\nhttps://t.me/m_design77\nShu yerda logolar zakaz qilishingiz mumkin!', {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: backButton.reply_markup
      });
    } 
    else if (data === 'strategy') {
      userStates[userId] = { type: 'strategy' };
      await bot.editMessageText(`💰 Narxi: 150,000 so'm\nSiz bu tarifni sotib olganda Instagramda qanday reklama chiqish kerakligini tushunib olasiz.\n\n${paymentDetails}\n\n🔄 Tolov chekini yuboring va tasdiqlanishini kuting...`, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'Markdown',
        reply_markup: backButton.reply_markup
      });
    } 
    else if (data === 'back') {
      await bot.editMessageText('🏠 Bosh menuga qaytdingiz:', {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: mainMenu.reply_markup
      });
      delete userStates[userId];
    } 
    else if (data === 'confirm') {
      const state = userStates[chatId] || {};
      if (state.photoMessageId && state.userId) {
        if (state.type === 'subscribers') {
          await bot.sendMessage(state.userId, '✅ Chek qabul qilindi. Instagram useringizni yozib qoldiring:', {
            reply_markup: backButton.reply_markup
          });
        } 
        else if (state.type === 'strategy') {
          await bot.sendMessage(state.userId, '✅ Tolov tasdiqlandi. Quyidagi havolaga o‘ting:\nhttps://t.me/+_rlb-Byzm8w1OTQy', {
            reply_markup: backButton.reply_markup
          });
        }
        userStates[state.userId] = { type: state.type };
        delete userStates[chatId];
      }
    } 
    else if (data === 'reject') {
      const { userId } = userStates[chatId] || {};
      if (userId) {
        await bot.sendMessage(userId, '❌ Chek bekor qilindi. Qayta urinib ko‘ring.', {
          reply_markup: backButton.reply_markup
        });
        delete userStates[chatId];
      }
    }
  } catch (error) {
    console.error('Error handling callback:', error);
    if (error.code === 400 && error.response?.description?.includes('message to edit not found')) {
      // If message editing fails, send a new message
      if (data === 'back') {
        await bot.sendMessage(chatId, '🏠 Bosh menuga qaytdingiz:', mainMenu);
      }
    }
  }
});

// Handle photo uploads (receipts)
bot.on('photo', async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  if (userStates[userId] && (userStates[userId].type === 'subscribers' || userStates[userId].type === 'strategy')) {
    try {
      const photoId = msg.photo[msg.photo.length - 1].file_id;
      const caption = userStates[userId].type === 'subscribers'
        ? `👤 Foydalanuvchi ID: ${userId}\n📈 Tanlangan obuna: ${userStates[userId].selectedPlan}`
        : `👤 Foydalanuvchi ID: ${userId}\n📊 Xizmat: Reklama chiqish strategiyasi`;

      const sentMsg = await bot.sendPhoto(GROUP_CHAT_ID, photoId, {
        caption,
        reply_markup: {
          inline_keyboard: [
            [
              { text: '✅ Tasdiqlash', callback_data: 'confirm' },
              { text: '❌ Bekor qilish', callback_data: 'reject' },
            ],
          ],
        },
      });

      userStates[sentMsg.chat.id] = { 
        photoMessageId: sentMsg.message_id, 
        userId, 
        type: userStates[userId].type 
      };
      delete userStates[userId];
    } catch (error) {
      console.error('Error handling photo:', error);
      await bot.sendMessage(chatId, '⚠️ Xatolik yuz berdi. Iltimos, qayta urinib ko‘ring.', mainMenu);
    }
  } else {
    await bot.sendMessage(chatId, '⚠️ Iltimos, avval xizmat tanlang!', mainMenu);
  }
});

// Handle Instagram username submission
bot.on('text', async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const text = msg.text;

  if (userStates[userId] && userStates[userId].type === 'subscribers' && !text.startsWith('/')) {
    try {
      await bot.sendMessage(GROUP_CHAT_ID, `👤 Foydalanuvchi ID: ${userId}\n📷 Instagram username: ${text}`);
      await bot.sendMessage(chatId, '🚀 Tez orada obunachilaringiz boradi!', mainMenu);
      delete userStates[userId];
    } catch (error) {
      console.error('Error handling username submission:', error);
    }
  }
});

console.log('Bot is running...');