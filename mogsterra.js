/**
 * ╔══════════════════════════════════════════════════════╗
 * ║   MOGS·TERRA Logistic — Telegram Bot Server           ║
 * ║   Node.js + node-telegram-bot-api                    ║
 * ╚══════════════════════════════════════════════════════╝
 *
 * Установка:
 *   npm install node-telegram-bot-api
 *
 * Запуск:
 *   node bot.js
 *
 * Требования:
 *   - Файл index.html должен быть доступен по HTTPS-URL
 *     (например, через Vercel / GitHub Pages / Railway / ngrok)
 *   - Установите WEB_APP_URL ниже
 */

const TelegramBot = require('node-telegram-bot-api');

// ─── КОНФИГ ──────────────────────────────────────────────
const BOT_TOKEN  = '8804085864:AAHPDD7iabUezvGiEEDhDnfStkUR6beZDZU';
const WEB_APP_URL = 'https://YOUR_DOMAIN/index.html'; // ← замените на свой URL
// ─────────────────────────────────────────────────────────

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// ════════════════════════════════════════
//  /start — главное приветствие
// ════════════════════════════════════════
bot.onText(/\/start/, (msg) => {
  const chatId    = msg.chat.id;
  const firstName = msg.from.first_name || 'друг';

  bot.sendMessage(chatId,
    `👋 Привет, ${firstName}!\n\nДобро пожаловать в *MOGS·TERRA Logistic* — доставка товаров из Китая по всему миру.\n\n📦 Нажми кнопку ниже, чтобы открыть личный кабинет:`,
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [[
          {
            text: '🚀 Открыть приложение',
            web_app: { url: WEB_APP_URL }
          }
        ]]
      }
    }
  );
});

// ════════════════════════════════════════
//  /help — справка
// ════════════════════════════════════════
bot.onText(/\/help/, (msg) => {
  bot.sendMessage(msg.chat.id,
    `📋 *Команды:*\n\n` +
    `/start — открыть приложение\n` +
    `/track — добавить трек-номер\n` +
    `/status — статус посылок\n` +
    `/help — это сообщение`,
    { parse_mode: 'Markdown' }
  );
});

// ════════════════════════════════════════
//  Получение данных из Mini App
//  (когда пользователь нажимает кнопку
//   "Подтвердить" / "Отправить заявку")
// ════════════════════════════════════════
bot.on('message', (msg) => {
  if (!msg.web_app_data) return;

  const chatId = msg.chat.id;
  let data;

  try {
    data = JSON.parse(msg.web_app_data.data);
  } catch {
    bot.sendMessage(chatId, '⚠️ Получены некорректные данные от приложения.');
    return;
  }

  // ── Добавление трека ──────────────────
  if (data.action === 'add_track') {
    const { track, name, marketplace } = data;
    bot.sendMessage(chatId,
      `✅ *Трек добавлен!*\n\n` +
      `📦 Трек-номер: \`${track}\`\n` +
      `📝 Товар: ${name}\n` +
      `🛒 Маркетплейс: ${marketplace}\n\n` +
      `Мы начнём отслеживание, как только посылка поступит на наш склад.`,
      { parse_mode: 'Markdown' }
    );

    // Уведомление менеджеру (замените на chat_id менеджера)
    const MANAGER_CHAT_ID = null; // например: 123456789
    if (MANAGER_CHAT_ID) {
      bot.sendMessage(MANAGER_CHAT_ID,
        `🆕 *Новый трек от пользователя*\n` +
        `User ID: ${data.user_id}\n` +
        `Трек: \`${track}\`\n` +
        `Товар: ${name}\n` +
        `Маркетплейс: ${marketplace}`,
        { parse_mode: 'Markdown' }
      );
    }
    return;
  }

  // ── Заявка на выкуп ──────────────────
  if (data.action === 'buyout') {
    const { url, variant, qty, country } = data;
    bot.sendMessage(chatId,
      `✅ *Заявка на выкуп принята!*\n\n` +
      `🔗 Ссылка: ${url}\n` +
      `🎨 Вариант: ${variant}\n` +
      `🔢 Количество: ${qty}\n` +
      `🌍 Страна: ${country}\n\n` +
      `Наш менеджер свяжется с вами в течение 1-2 часов для подтверждения стоимости.`,
      { parse_mode: 'Markdown' }
    );

    const MANAGER_CHAT_ID = null;
    if (MANAGER_CHAT_ID) {
      bot.sendMessage(MANAGER_CHAT_ID,
        `🛒 *Новая заявка на выкуп*\n` +
        `User ID: ${data.user_id}\n` +
        `URL: ${url}\n` +
        `Вариант: ${variant}\n` +
        `Кол-во: ${qty} · Страна: ${country}`,
        { parse_mode: 'Markdown' }
      );
    }
    return;
  }

  // Неизвестное действие
  bot.sendMessage(chatId, '⚙️ Данные получены. Менеджер обработает ваш запрос.');
});

// ════════════════════════════════════════
//  Обработка ошибок
// ════════════════════════════════════════
bot.on('polling_error', (err) => {
  console.error('[polling error]', err.message);
});

console.log('✅ MOGS·TERRA bot запущен и ожидает сообщений...');
