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
                description: 'Start a Pomodoro timer',
                options: [
                    {
                        name: 'focus_time',
                        type: 4, // Integer
                        description: 'Focus time in minutes',
                        required: true,
                    },
                    {
                        name: 'break_time',
                        type: 4, // Integer
                        description: 'Break time in minutes',
                        required: true,
                    },
                ],
            },
            {
                name: 'stop',
                type: 1, // Subcommand
                description: 'Stop the Pomodoro timer',
            },
            {
                name: 'time',
                type: 1, // Subcommand
                description: 'Check the time remaining on the Pomodoro timer',
            },
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