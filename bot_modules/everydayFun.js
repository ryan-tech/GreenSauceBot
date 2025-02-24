let everydayFun = require('everyday-fun')

function sayJoke(message) {
    let joke = everydayFun.getRandomJoke();
    console.log(joke.body);
    message.reply(joke.body);
}

function sayQuote(message) {
    let quote = everydayFun.getRandomQuote();
    console.log(quote.quote + " - " + quote.author);
    message.reply(quote.quote + " - " + quote.author);
}

function sayRiddle(message) {
    let riddle = everydayFun.getRandomRiddle();
    console.log(riddle.riddle + " \nAnswer: " + riddle.answer);
    message.reply(riddle.riddle + " \nAnswer: " + riddle.answer);
}

module.exports = { sayJoke, sayQuote, sayRiddle };