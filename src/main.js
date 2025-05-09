const { Client, GatewayIntentBits, Events } = require('discord.js');
require('dotenv').config();
const TOKEN = process.env.TOKEN;
console.log(TOKEN)
const { deployCommands } = require('./Commands/deployCommands.js');
const { sayJoke, sayQuote, sayRiddle } = require('./modules/EverydayFun/everydayFun.js');
const { pomodoroHandler } = require('./modules/Pomodoro/pomodoro.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

// deploy commands for all guilds the bot is in
client.once(Events.ClientReady, async () => {
    console.log(`Logged in as ${client.user.tag}!`);

    // Deploy commands for all guilds the bot is in
    const guilds = client.guilds.cache.map(guild => guild.id);
    for (const guildID of guilds) {
        await deployCommands(guildID);
    }
});

// Listen for the bot joining a new guild
client.on(Events.GuildCreate, async (guild) => {
    console.log(`Joined new guild: ${guild.name} (ID: ${guild.id})`);
    await deployCommands(guild.id);
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName, options } = interaction;

    switch (commandName) {
        case 'pomodoro':
            const subcommand = options.getSubcommand();
            pomodoroHandler(subcommand, interaction);
            break;
        case 'joke':
            sayJoke(interaction);
            break;
        case 'quote':
            sayQuote(interaction);
            break;
        case 'riddle':
            sayRiddle(interaction);
            break;
        case 'ping':
            await interaction.reply('Pong!');
            break;
        case 'help':
            await interaction.reply('Commands: /pomodoro start <focus_time> <break_time>, /pomodoro stop, /help');
            break;
        default:
            break;
    }
});

client.login(TOKEN);
