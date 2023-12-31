//setting up the environment
const { Telegraf, Markup } = require("telegraf");
const rateLimit = require('telegraf-ratelimit');
require("dotenv").config();
const data = require("../../data/data.js");
const bot = new Telegraf(process.env.BOT_TOKEN);

// Set limit to 1 message per 3 seconds
const limitConfig = {
  window: 3000,
  limit: 3,
  onLimitExceeded: (ctx, next) => ctx.reply('Rate limit exceeded')
}

bot.use(rateLimit(limitConfig))

//extracting messages data
const messages = data.messages;
const facts = data.facts;
const music = data.music;

//initializing the bot
bot.start((ctx) => {
  try {
    return ctx.reply(messages.start);
  } catch (e) {
    console.error("error in start action:", e);
    return ctx.reply("Error occured");
  }
});



//setting up help command
bot.help((ctx) => ctx.reply(messages.help));

//setting up contribute command
bot.command("contribute", Telegraf.reply(messages.contribute));

//setting up podlinks command with inline buttons
bot.command("podlinks", (ctx) => {
  const inlineButtons = Markup.inlineKeyboard(data.podApps);
  ctx.reply("اپلیکیشن مورد نظر رو انتخاب کنید", inlineButtons);
});

//send music
bot.command("sagamusic", (ctx) => {
  const inlineButtons = Markup.inlineKeyboard(music.buttons);
  ctx.reply(
    "از کجا می‌خواید آهنگ‌ها رو بشنوید",
    inlineButtons
  );
});

// music.tracks.forEach(track=>{
//   bot.action(track.episode, (ctx)=>{
//       const files = track.id;
//       const mediaFiles = files.map(file => ({ type: 'audio', media: file }));
//       ctx.replyWithMediaGroup(mediaFiles)
//       ctx.answerCbQuery();
//   })
// })

//send random track
//  Function to get a random track
// function getRandomTrack(tracks) {
//   const tracksCount = tracks.length;
//   const randomTrackIndex = Math.floor(Math.random() * tracksCount);
//   return tracks[randomTrackIndex];
// }

//  Function to get a random id
// function getRandomId(ids) {
//   const idsCount = ids.length;
//   const randomIdIndex = Math.floor(Math.random() * idsCount);
//   return ids[randomIdIndex];
// }

// function getRandomTrackId(tracks) {
//   const track = getRandomTrack(tracks);
//   return getRandomId(track.id);
// }

// bot.action("randomtrack",(ctx)=>{
//   const trackId = getRandomTrackId(music.tracks);
//   ctx.replyWithAudio(trackId)
//   ctx.answerCbQuery();
// })

//setting up facts command
bot.command("randomfacts", (ctx) => {
  const inlineButtons = Markup.inlineKeyboard([
    [{ text: "اساطیر یونان", callback_data: "greek" }],
    [{ text: "اساطیر نورس", callback_data: "norse" }],
    [{ text: "اساطیر مصر", callback_data: "egypt" }],
    [{ text: "اساطیر ژاپن", callback_data: "japan" }],
    [{ text: "اساطیر سلتیک (ایرلند)", callback_data: "celtic" }],
  ]);
  ctx.reply(
    "برای دریافت یک دانستنی کوتاه اساطیر مورد نظرتون رو انتخاب کنید: ",
    inlineButtons
  );
});


//setting up message forwarding behaviour
bot.on("message", (ctx) => {
  const chatId = process.env.CHAT_ID;
  if (ctx.message.text || ctx.message.voice || ctx.message.photo) {
    return ctx.telegram
      .forwardMessage(chatId, ctx.chat.id, ctx.message.message_id)
      .then(() => ctx.reply("✅ پیام شما با موفقیت دریافت شد! "));
  } else {
    return ctx.reply(messages.notext);
  }
});

//setting up callback query data
bot.on("callback_query", async (ctx) => {
  const callbackData = ctx.callbackQuery.data;
  let randomFact;
  if (Object.keys(facts).includes(callbackData)) {
    const factList = facts[callbackData];
    const randomIndex = Math.floor(Math.random() * factList.length);
    randomFact = factList[randomIndex];
  }
  if (randomFact) {
    await ctx.reply(randomFact);
    await ctx.answerCbQuery();
    await ctx.reply("یه دانستنی دیگه /randomfacts");
  }
});



// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

exports.handler = async (event) => {
  try {
    await bot.handleUpdate(JSON.parse(event.body));
    return { statusCode: 200, body: "" };
  } catch (e) {
    console.error("error in handler:", e);
    return {
      statusCode: 400,
      body: "This endpoint is meant for bot and telegram communication",
    };
  }
};

 
