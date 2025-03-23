const timerCache = {};

const settings = {
    FOCUS_TIME: 25,
    BREAK_TIME: 5,
}

function startTimer(author, isFocusTime) {
    let timerDuration = isFocusTime ? settings.FOCUS_TIME : settings.BREAK_TIME;
    const message = isFocusTime ? 
        `Good work! Take a break for ${settings.BREAK_TIME} minutes.` :
        `It's time to focus for ${settings.FOCUS_TIME} minutes.`;
    const timer = setTimeout(() => {
        interaction.channel.send(`<@${author}>, ${message}`);  
        startTimer(author, !isFocusTime);
    }, 1000 * 60 * timerDuration);
    timerCache[author] = timer;
}

async function pomodoroHandler(subcommand, interaction) {
    try {
        const author = interaction.user.username;

        switch (subcommand) {
            case 'start':
                startTimer(author, true)
                
                break;
            case 'stop':
                clearTimeout(timerCache[author]);
                break;
            case 'help':
                await interaction.reply('Usage: /pomodoro <command: help|start|stop> <focusTime: Time in minutes> <breakTime: Time in minutes>');
                break;
            case 'status':
                if (timerCache[author]) {
                    const remainingTime = Math.ceil((timerCache[author].getTime() - Date.now()) / 1000);
                    await interaction.reply(`Pomodoro timer is running. Time remaining: ${remainingTime} seconds.`);
                } else {
                    await interaction.reply('Pomodoro timer is not running.');
                }
                break;
            default:
                await interaction.reply('Unknown command. Use /pomodoro help for a list of commands.');
                break;
        }
    } catch (error) {
        console.error('Error handling pomodoro command:', error);
        await interaction.channel.send('ERROR: ', error);
    }
}

module.exports = {
    pomodoroHandler
}
