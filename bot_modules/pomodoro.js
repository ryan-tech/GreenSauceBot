const { MongoClient } = require('mongodb');
const MONGO_URL = process.env.MONGO_URL;
class PomodoroTimer {
    constructor(author, guildId) {
        this.Author = author;
        this.GuildId = guildId;
        this.Started = false;
        this.SecondsRemaining = 0;
        this.TotalPomodorosCompleted = 0;
    }

    debugLog() {
        console.log(
            'DEBUG: ' +
            `Author: ${this.Author} | ` +
            `GuildId: ${this.GuildId} | ` +
            `Started: ${this.Started} | ` +
            `SecondsRemaining: ${this.SecondsRemaining}`
        );
    }

    async start(interaction, focusTime, breakTime) {

        if (this.Started == true) {
            await interaction.reply('Pomodoro already running! Stop the current pomodoro with `/pomodoro stop`');
            return;
        }

        await interaction.reply(`<@${interaction.user.id}>, you have started a Pomodoro timer (Focus: ${focusTime} minutes, Break: ${breakTime} minutes). This will run until you stop it.`);

        this.Started = true;
        while (this.Started) {
            await interaction.channel.send(`<@${interaction.user.id}>, it's time to focus for ${focusTime} minutes. 📵📺`);
            this.SecondsRemaining = focusTime * 60;
            while (this.SecondsRemaining > 0 && this.Started) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                this.SecondsRemaining -= 1;
                this.debugLog();
            }
            this.TotalPomodorosCompleted += 1;
            if (this.Started == false) {
                return;
            }
            await interaction.channel.send(`<@${interaction.user.id}>, great job! You've completed ${getPomodorosCompleted(this.Author, this.GuildId) + this.TotalPomodorosCompleted} pomodoros. You may now take a break for ${breakTime} minutes. 🍵🍪`);
            this.SecondsRemaining = breakTime * 60;
            while (this.SecondsRemaining > 0 && this.Started) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                this.SecondsRemaining -= 1;
                this.debugLog();
            }

        }
    }
    async stop(interaction) {
        if (this.Started == false) {
            await interaction.reply('No pomodoro running!');
            return;
        }
        this.Started = false;
        interaction.reply(`<@${interaction.user.id}>, your pomodoro timer has been stopped! You have completed ${getPomodorosCompleted(this.Author, this.GuildId) + this.TotalPomodorosCompleted} pomodoros.`);
        // when the timer is stopped, I want to update the record in the database
        this.saveToDatabase();
    }

    async saveToDatabase() {
        try {
            const client = new MongoClient(MONGO_URL, { useUnifiedTopology: true });
            await client.connect();
            const database = client.db('GreenSauceBot');
            const collection = database.collection('pomodoro');
            const filter = {
                $and: [
                    { author: this.Author },
                    { guildId: this.GuildId }
                ]
            };

            // get record with filter
            let updatedPomodoroCount = this.TotalPomodorosCompleted;
            const doc = await collection.findOne(filter);
            if (doc) {
                updatedPomodoroCount = Number(this.TotalPomodorosCompleted) + Number(doc.data.totalPomodorosCompleted);
            }
            
            const updateDoc = {
                $set: {
                    "data": {
                        totalPomodorosCompleted: String(updatedPomodoroCount)
                    }
                }
            };
            
            const options = { upsert: true };
            const result = await collection.updateOne(filter, updateDoc, options);

            console.log(
                `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`
            );
            client.close();

        }
        catch (error) {
            console.error('Error saving to database:', error);
        }
    }
}

async function getPomodorosCompleted(author, guildId) {
    try {
        const client = new MongoClient(MONGO_URL, { useUnifiedTopology: true });
        await client.connect();
        const database = client.db('GreenSauceBot');
        const collection = database.collection('pomodoro');
        const filter = {
            $and: [
                { author: author },
                { guildId: guildId }
            ]
        };
        const doc = await collection.findOne(filter);
        if (doc) {
            return doc.data.totalPomodorosCompleted;
        }
        else {
            return 0;
        }
    }
    catch (error) {
        console.error('Error getting pomodoros completed:', error);
        return 0;
    }
}

const pomodoroTimers = {};

function getPomodoroTimer(author, guildId) {
    if (!pomodoroTimers[author]) {
        return null;
    }
    if (!pomodoroTimers[author][guildId]) {
        return null;
    }
    return pomodoroTimers[author][guildId];
}

async function pomodoroHandler(subcommand, interaction) {
    try {
        const author = interaction.user.username;
        const guildId = interaction.guild.id;
        let pomodoroTimer = getPomodoroTimer(author, guildId);

        switch (subcommand) {
            case 'start':

                // default the focus time to 25 minutes and the break time to 5 minutes
                const focusTime = 25;
                const breakTime = 5;

                // create a new pomodoro timer    
                if (!pomodoroTimer) {
                    pomodoroTimer = new PomodoroTimer(author, guildId);
                    if (!pomodoroTimers[author]) {
                        pomodoroTimers[author] = {};
                    }
                    pomodoroTimers[author][guildId] = pomodoroTimer;
                }

                // start the pomodoro timer
                await pomodoroTimer.start(interaction, focusTime, breakTime);
                break;
            case 'stop':
                // create a new pomodoro timer    
                if (!pomodoroTimer) {
                    await interaction.reply('No pomodoro running!');
                    return;
                }
                else {
                    await pomodoroTimer.stop(interaction);
                }
                break;
            case 'help':
                await interaction.reply('Usage: /pomodoro <command: help|start|stop> <focusTime: Time in minutes> <breakTime: Time in minutes>');
                break;
            case 'status':
                if (!pomodoroTimer) {
                    await interaction.reply(
                        `
                        ⋆⭒˚｡⋆ Status for ${author} in ${guildId} ⋆⭒˚｡⋆
                        Pomodoro status: Not running
                        Total pomodoros completed: ${await getPomodorosCompleted(author, guildId)}
                        `
                    );
                }
                else {
                    await interaction.reply(
                        `
                        ⋆⭒˚｡⋆ Status for ${author} in ${guildId} ⋆⭒˚｡⋆
                        Pomodoro status: ${pomodoroTimer.Started}
                        Pomodoro time remaining: ${pomodoroTimer.SecondsRemaining}
                        Total pomodoros completed: ${await getPomodorosCompleted(author, guildId)}
                        `
                    );
                }
            default:
                await interaction.reply('Unknown command. Use /pomodoro help for a list of commands.');
        }
    } catch (error) {
        console.error('Error handling pomodoro command:', error);
        await interaction.reply('An error occurred while handling the command.');
    }
}

module.exports = {
    pomodoroHandler
}
