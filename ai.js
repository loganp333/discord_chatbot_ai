const Discord = require('discord.js');
const fs = require('fs');
const client = new Discord.Client();
const TOKEN = '';
const raw = fs.readFileSync('patterns.json');
const chanceToAdd = 0.5;
const chanceToRespond = 0.2;
const replyFactor = 21000;
const wordsToFilter = [];
let patterns = JSON.parse(raw);
let queue = 0; //the queue is used to avoid message spam


//Calculates the chance of adding a speech pattern to the JSON file (default is a 50/50 chance)
const addChance = () => {
    return Math.random() < chanceToAdd;
};

//Calculates the chance of responding to a user (default is a 20% chance)
const respondChance = () => {
    return Math.random() < chanceToRespond;
};

//Calculates how long the bot will be typing for
const getReplyTime = () => {
    let time = Math.floor(Math.random() * replyFactor);
    if (time < 3500) {
        return time * 7;
    } else {
        return time;
    }

};

//Sends a random message from the speech patterns JSON file and clears a spot in the message queue
const sendRand = (message) => {
    message.channel.send(patterns.speechPatterns[Math.floor(Math.random() *
        patterns.speechPatterns.length)]);
    queue--;
    message.channel.stopTyping();
};


//Checks against filters and automatically filters spam
const filterMessages = (message) => {
    if (message.content.includes('https://') || message.content.includes(
            '\n')) return '';
    speech = message.content.replace(/[!<@>\d]/g,
    ''); //Removes all mentions of a user before adding the speech pattern to the JSON file
    speech = speech.replace(/:\w*:/g, ''); //removes any emotes
    for (let i = 0; i < wordsToFilter.length; i++) {
        if (speech.includes(wordsToFilter[i])) return '';
    };
    return speech;
};

//Checks if a message is being added to the JSON file
const writeMessages = (speech) => {
    if (addChance()) {
        for (let i = 0; i < patterns.speechPatterns.length; i++) {
            if (patterns.speechPatterns[i] == speech) return;
        };
        patterns.speechPatterns.push(speech);
        fs.writeFile('patterns.json', JSON.stringify(patterns), () => {});
    }
};

//determines if and how the bot will reply to a message
const replyMessages = (message, speech) => {
    let name = client.user.username.toLowerCase();
    if (respondChance() && !message.content.toLowerCase().includes(name) &&
        !message.content.includes(client.user.id)) {
        //this for loop is used for finding common speech patterns from a user message (will make the bot seem human)
        common = commonFound(message);
        if (common != null) {
            message.channel.stopTyping();
            setTimeout(() => {
                message.channel.startTyping()
            }, Math.random() * 7000);
            queue++;
            setTimeout(() => {
                message.channel.send(common);
                queue--
                message.channel.stopTyping();
            }, getReplyTime());
            return;
        } else {
            if (Math.random() >
                0.3) { //The bot has a 50% chance of pinging the user of whose message it is responding to
                message.channel.stopTyping();
                setTimeout(() => {
                    message.channel.startTyping()
                }, Math.random() * 7000);
                queue++;
                setTimeout(() => {
                    message.channel.send(
                        `<@${message.author.id}> ${patterns.speechPatterns[Math.floor(Math.random() * patterns.speechPatterns.length)]}`
                        );
                    queue--;
                    message.channel.stopTyping();
                }, getReplyTime());
            } else {
                setTimeout(() => {
                    message.channel.startTyping()
                }, Math.random() * 7000);
                queue++;
                setTimeout(() => {
                    sendRand(message)
                }, getReplyTime());
            }
        }
    }
};

const commonFound = (message) => {
    let commonSpeech = null;
    for (let i = 0; i < patterns.speechPatterns.length; i++) {
        if (patterns.speechPatterns[i].includes(message.content) && patterns
            .speechPatterns[i] != message.content) {
            commonSpeech = patterns.speechPatterns[i];
            return commonSpeech;
        }
    };
};

const nameHeard = (message) => {
    let name = client.user.username.toLowerCase();
    if (message.content.toLowerCase().includes(name) || message.content
        .includes(client.user.id)) {
        //If a stored speech pattern has similarities with the parsed message, send that speech pattern to make the bot seem more human
        common = commonFound(message);
        if (common != null) {
            message.channel.stopTyping();
            setTimeout(() => {
                message.channel.startTyping()
            }, Math.random() * 7000);
            queue++;
            setTimeout(() => {
                message.channel.send(common);
                queue--;
                message.channel.stopTyping();
            }, getReplyTime());
            return;
        } else {
            message.channel.stopTyping();
            setTimeout(() => {
                message.channel.startTyping()
            }, Math.random() * 7000);
            queue++;
            setTimeout(() => {
                sendRand(message)
            }, getReplyTime());
        }
    }
};

//To check if the bot is online
client.on('ready', () => {
    console.log(`AI Launch: ${client.user.tag}`);
});

//Checking for messages and assigning them the message variable
client.on('message', message => {
    if (queue > 2) return;
    if (message.channel.type == "dm" || message.author.tag == client
        .user.tag || message.author.bot == true || message.content
        .length > 1200) {
        return;
    }
    speechPattern = filterMessages(message);
    writeMessages(speechPattern);
    replyMessages(message, speechPattern);
    nameHeard(message);

});

client.login(TOKEN);