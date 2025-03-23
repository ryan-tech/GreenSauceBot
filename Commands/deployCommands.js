const { REST, Routes } = require('discord.js');
require('dotenv').config();
const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

const commands = [
    {
        name: 'pomodoro',
        description: 'Manage your Pomodoro timer',
        options: [
            {
                name: 'start',
                type: 1, // Subcommand
                description: 'Start a Pomodoro timer with a focus time of 25 minutes and a break time of 5 minutes',
            },
            {
                name: 'status',
                type: 1, // Subcommand
                description: 'Prints the status of the user',
            },
            {
                name: 'stop',
                type: 1, // Subcommand
                description: 'Stop the Pomodoro timer',
            },
            {
                name: 'help',
                type: 1, // Subcommand
                description: 'Prints the help message',
            }
        ],
    },
    {
        name: 'joke',
        description: 'Tell a joke',
    },
    {
        name: 'quote',
        description: 'Say a quote',
    },
    {
        name: 'riddle',
        description: 'Tell a riddle',
    },
    {
        name: 'ping',
        description: 'Replies with Pong!',
    },
    {
        name: 'help',
        description: 'List all commands',
    },
];

const rest = new REST({ version: '10' }).setToken(TOKEN);

const deployCommands = async (guildID) => {
    try {
        console.log(`Started refreshing application (/) commands for guild ${guildID}.`);

        await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, guildID),
            { body: commands },
        );

        console.log(`Successfully reloaded application (/) commands for guild ${guildID}.`);
    } catch (error) {
        console.error(error);
    }
};

module.exports = {
    deployCommands
}