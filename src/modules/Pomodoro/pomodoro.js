const timerCache = {};

const settings = {
    FOCUS_TIME: 25,
    BREAK_TIME: 5,
    LONG_BREAK: 15
}

function startTimer(interaction, isFocusTime) {
    let timerDuration = isFocusTime ? settings.FOCUS_TIME : settings.BREAK_TIME;
    const message = isFocusTime ? 
        `Good work! It's time to take a break for ${settings.BREAK_TIME} minutes.` :
        `It's time to focus for ${settings.FOCUS_TIME} minutes.`;
    const timer = setTimeout(() => {
        interaction.channel.send(`<@${interaction.user.id}>, ${message}`);  
        startTimer(interaction, !isFocusTime);
    }, 1000 * 60 * timerDuration);
    timerCache[interaction.user.id] = timer;
}

async function pomodoroHandler(subcommand, interaction) {
    try {
        const userId = interaction.user.id;
        switch (subcommand) {
            case 'start':
                if (timerCache[userId]) {
                    await interaction.reply(`<@${userId}>, Pomodoro timer is already running. Use /pomodoro stop to stop it.`);
                    return;
                }
                await interaction.reply(`<@${userId}>, Pomodoro timer started. Use /pomodoro stop to stop it.`);
                startTimer(interaction, true)
                
                break;
            case 'stop':
                if (!timerCache[userId]) {
                    await interaction.reply(`<@${userId}>, Pomodoro timer is not running.`);
                    return;
                }
                await interaction.reply(`<@${userId}>, Pomodoro timer stopped.`);
                clearTimeout(timerCache[userId]);
                delete timerCache[userId];
                break;
            case 'help':
                await interaction.reply(
                    'Use /pomodoro start to start the timer\nUse /pomodoro stop to stop the timer\nuse /pomodoro help to see this message again.'
                );
                break;
            case 'status':
                if (timerCache[userId]) {
                    const remainingTime = Math.ceil((timerCache[userId]._idleStart + timerCache[userId]._idleTimeout - Date.now()) / 1000)
                    await interaction.reply(`<@${userId}>, Pomodoro timer is running. Time remaining: ${remainingTime} seconds.`);
                } else {
                    await interaction.reply(`<@${userId}>, Pomodoro timer is not running.`);
                }
                break;
            default:
                await interaction.reply(`<@${userId}>, Unknown command. Use /pomodoro help for a list of commands.`);
                break;
        }
    } catch (error) {
        console.error('Error handling pomodoro command:', error);
        await interaction.channel.send(`<@${userId}>, ERROR ${error}`);
    }
}

module.exports = {
    pomodoroHandler
}
