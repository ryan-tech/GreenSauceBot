const { MongoClient } = require('mongodb');
const MONGO_URL = process.env.MONGO_URL;

async function sendchannel.sendOrFollowUp(interaction, message) {
    if (interaction.replied || interaction.deferred) {
        await interaction.followUp(message);
    } else {
        await interaction.channel.send(message);
    }
}

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
            await interaction.channel.send('Pomodoro already running! Stop the current pomodoro with `/pomodoro stop`');
            return;
        }

        await interaction.channel.send(`<@${interaction.user.id}>, you have started a Pomodoro timer (Focus: ${focusTime} minutes, Break: ${breakTime} minutes). This will run until you stop it.`);

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
            await interaction.channel.send(`<@${interaction.user.id}>, great job! You've completed ${this.TotalPomodorosCompleted} pomodoros. You may now take a break for ${breakTime} minutes. 🍵🍪`);
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
            await interaction.channel.send('No pomodoro running!');
            return;
        }
        this.Started = false;
        interaction.channel.send(`<@${interaction.user.id}>, your pomodoro timer has been stopped! You have completed ${this.TotalPomodorosCompleted} pomodoros.`);
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

async function pomodoroHandler(args, interaction) {
    try {
        const author = interaction.user.username;
        const guildId = interaction.guild.id;
        let pomodoroTimer = getPomodoroTimer(author, guildId);

        // args[0] is the subcommand
        switch (args[0]) {
            case 'start':
                // console.log(args)
                // Validate focusTime and breakTime
                const focusTime = parseInt(args[1]);
                const breakTime = parseInt(args[2]);

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
                    await interaction.channel.send('No pomodoro running!');
                    return;
                }
                else {
                    await pomodoroTimer.stop(interaction);
                }
                break;
            case 'help':
                await interaction.channel.send('Usage: /pomodoro <command: help|start|stop> <focusTime: Time in minutes> <breakTime: Time in minutes>');
                break;
            default:
                await interaction.channel.send('Unknown command. Use /pomodoro help for a list of commands.');
        }
    } catch (error) {
        console.error('Error handling pomodoro command:', error);
        await sendchannel.sendOrFollowUp(interaction, 'An error occurred while handling the command.');
    }
}

module.exports = {
    pomodoroHandler
}
