require("dotenv").config();
const procenv = process.env,
  date = require("date.js"),
  Discord = require("discord.js"),
  client = new Discord.Client({
    intents: [
      "GUILDS",
      "GUILD_MEMBERS",
      "GUILD_MESSAGES",
      "GUILD_MESSAGE_REACTIONS",
    ],
  });

function logger(msg) {
  console.log(`[${new Date()}] ${msg}`);
}

function login() {
  client.login(procenv.TOKEN).catch(() => {
    logger("Failed to login, retrying in 5 seconds...");
    setTimeout(login, 5000);
  });
}

login();

client.on("ready", () => {
  logger(`Logged in as ${client.user.tag}`);
});

client.on("messageCreate", (message) => {
  let msg = message.content.trim().trimEnd();
  if (message.author.bot || !msg.toLowerCase().startsWith(procenv.BOTPREFIX))
    return;
  let args = msg.slice(procenv.BOTPREFIX.length).split(/ +/g),
    cmd = args.shift().toLowerCase();

  if (cmd == "time") {
    // Check if a duration was specified
    if (!args.length > 1) {
      message.reply({
        content: `You must specify a duration!`,
        allowedMentions: false,
      });
      return;
    }

    // Check if a timezone offset was specified, and check if valid offset
    let offsetRegex = /\[[0-9]+]/im,
      offset;
    if (offsetRegex.test(args[0])) {
      offset = args[0].match(offsetRegex)[0].replace(/[\[\]]/g, "");
      if (isNaN(offset)) {
        message.reply({
          content: `Invalid timezone offset!`,
          allowedMentions: false,
        });
        return;
      }
      args.shift();
    } else {
      offset = 7;
    }

    let duration = Math.floor(
        (date(args.join(" ")).getTime() +
          date(args.join(" ")).getTimezoneOffset() * 60 * 1000 +
          parseInt(offset) * 60 * 60 * 1000) /
          1000
      ),
      embed = new Discord.MessageEmbed()
        .setColor("#0099ff")
        .setTitle("Timestamps for days")
        .setAuthor({
          name: `Kek's Timestamps ⌚✍️`,
          iconURL: client.user.avatarURL(),
        })
        .setDescription(
          `Utilty for ppl who are so lazy that they cbb to open **[hammertime](https://hammertime.djdavid98.art/)**`
        )
        .addFields(
          {
            name: "1. Short Time",
            value: `<t:${duration}:t> \`<t:${duration}:t>\``,
            inline: true,
          },
          {
            name: "2. Long Time",
            value: `<t:${duration}:T> \`<t:${duration}:T>\``,
            inline: true,
          },
          {
            name: "3. Short Date",
            value: `<t:${duration}:d> \`<t:${duration}:d>\``,
            inline: true,
          },
          {
            name: "4. Long Date",
            value: `<t:${duration}:D> \`<t:${duration}:D>\``,
            inline: true,
          },
          {
            name: "5. Short Date/Time",
            value: `<t:${duration}:f> \`<t:${duration}:f>\``,
            inline: true,
          },
          {
            name: "6. Long Date/Time",
            value: `<t:${duration}:F> \`<t:${duration}:F>\``,
            inline: true,
          },
          {
            name: "7. Relative Time",
            value: `<t:${duration}:R> \`<t:${duration}:R>\``,
            inline: true,
          }
        )
        .addField(
          "\u200b",
          "**React with the corresponding emoji to get the timestamp!**"
        )
        .setFooter({
          text: `Requested by ${message.author.tag}`,
          iconURL: message.author.avatarURL(),
        })
        .setTimestamp();

    message.channel.send({ embeds: [embed] }).then((msg) => {
      msg
        .react("1️⃣")
        .then(() => msg.react("2️⃣"))
        .then(() => msg.react("3️⃣"))
        .then(() => msg.react("4️⃣"))
        .then(() => msg.react("5️⃣"))
        .then(() => msg.react("6️⃣"))
        .then(() => msg.react("7️⃣"))
        .then(() => {
          const filter = (reaction, user) =>
            ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣"].includes(
              reaction.emoji.name
            ) && user.id == message.author.id;
          msg
            .awaitReactions({ filter, max: 1, time: 60000, errors: ["time"] })
            .then((collected) => {
              let emoji = collected.first().emoji.name,
                timestamp;

              switch (emoji) {
                case "1️⃣":
                  timestamp = `<t:${duration}:t>`;
                  break;
                case "2️⃣":
                  timestamp = `<t:${duration}:T>`;
                  break;
                case "3️⃣":
                  timestamp = `<t:${duration}:d>`;
                  break;
                case "4️⃣":
                  timestamp = `<t:${duration}:D>`;
                  break;
                case "5️⃣":
                  timestamp = `<t:${duration}:f>`;
                  break;
                case "6️⃣":
                  timestamp = `<t:${duration}:F>`;
                  break;
                case "7️⃣":
                  timestamp = `<t:${duration}:R>`;
                  break;
              }

              msg.channel.send(`${timestamp} \`${timestamp}\``);
              msg.delete();
            })
            .catch(() => {
              msg.channel.send("Timestamp selection timed out!");
              msg.delete();
            });
        });
    });
  }
});
