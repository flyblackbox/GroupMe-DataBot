const ACCESS_TOKEN = "LPePyCbtapwQw1QeWEU2XyzvJLXifUK7tifCTgJg";
const API = require('groupme').Stateless;
const BOT_ID = "6d7733b10d45fe2f444fed3640";
const GROUP_ID = 28798408;

import * as helpers from "./helpers"
import * as PersonalityInsights from "./PersonalityInsights";

export const postBotMessage = async function (req) {
    console.log("Request Payload");
    console.log(req.body);
    let consoleMessage = "";
    let botMessage = "";
    let sender_type = req.body.sender_type;
    let text = isEmpty(req.body.text) ? req.body.text : req.body.text.replace(/\s+/g, '');

    if ("bot" === sender_type) {
        console.log("No action..");
    }

    if ("user" === sender_type && ['Hi', 'Hello', 'hi', 'hello'].includes(text)) {
        let randomText = ["Hello to you!", "Hi!", "Hola!"];
        let id = Math.round(Math.random() * (randomText.length - 1));
        botMessage = randomText[id];
        consoleMessage = "Bot sent hi reply.";
    } else if ("user" === sender_type && text.includes("/wordcount")) {
        let textArray = text.split(" ");
        let messages = await getAllMessages();

        console.log("Command length: " + textArray.length);
        if (textArray.length > 1) {
            let word = textArray[1];
            console.log("Count word instances: " + word);
            let wordCount = await groupMeWordCount(messages, word);
            botMessage = "\"" + word + "\" was said " + wordCount.toString() + " times";
        } else {
            let totalWords = await countWords(messages);
            botMessage = "Total words of all time: " + totalWords;
        }
        consoleMessage = "Bot sent a word count reply.";
    } else if ("user" === sender_type && text.includes("/hearts")) {
        let textArray = text.split(" ");
        let hasNumber = textArray.length > 1;
        let sinceHours = hasNumber ? textArray[1] : 0;

        console.log("Hearts count has number: " + hasNumber);

        let messages = await getAllMessages();
        let groupDetails = await helpers.callGroupDetails(ACCESS_TOKEN);
        let members = groupDetails.members;
        let heartCounts = [];
        for (let member of members) {
            let count = 0;
            for (let message of messages) {
                if (member.user_id == message.user_id) {
                    let last_seen = message.created_at;
                    let dateNow = new Date();
                    let dateMsg = new Date(last_seen * 1000);
                    let hourDiff = Math.abs(dateNow - dateMsg) / 36e5;

                    if (hasNumber && sinceHours < hourDiff) {
                        break;
                    }

                    count += message.favorited_by.length;
                }
            }

            let heartCount = member.nickname + ": " + count;
            heartCounts.push(heartCount);
        }

        botMessage = heartCounts.toString();
        consoleMessage = "Bot sent a heart count reply.";
    } else if ("user" === sender_type && text.includes("/lastseen")) {
        let user_id = req.body.attachments[0].user_ids[0];
        let last_seen = 0;
        let messages = await getAllMessages();
        console.log(user_id);
        for (let message of messages) {
            if (user_id === message.user_id) {
                last_seen = message.created_at;
                break;
            }
        }
        console.log(last_seen);
        let dateF = new Date(last_seen * 1000);
        botMessage = dateF.toUTCString();
        consoleMessage = "Bot sent a last seen timestamp reply.";
    } else if ("user" === sender_type && text.includes("/personality")) {
        let messages = await getAllMessages();
        let user_id = req.body.attachments[0].user_ids[0];
        let contentItems = [];
        for (let message of messages) {
            if (user_id === message.user_id) {
                contentItems.push({
                    "content": message.text,
                    "contenttype": "text/plain",
                    "created": message.created_at,
                    "id": message.id,
                    "language": "en"
                });
            }
        }

        // botMessage = await PersonalityInsights.getPersonalityInsights(contentItems);
        botMessage = "Command is not yet available.";
        consoleMessage = "Bot sent a Personality Insigths reply.";
    }

    if (botMessage) {
        let opts = {
            picture_url: "",
        }
        API.Bots.post(ACCESS_TOKEN, BOT_ID, botMessage, opts, function (err, ret) {
            if (!err) {
                console.log(consoleMessage);
                console.log(botMessage);
            }
        });
    }

}


export const getAllMessages = async function () {
    let messages = [];
    const limit = 100;
    console.log("Get messages.");
    let messageTemp = await helpers.callGetMessages({group_id: GROUP_ID, token: ACCESS_TOKEN, before_id: 0});
    let messageCount = messageTemp.count;
    messages = messageTemp.messages;

    console.log(messageTemp.count);
    console.log(messageTemp.messages.length);
    if (messageCount > limit) {
        let beforeId = messageTemp.messages[messageTemp.messages.length - 1].id;
        for (let i = limit; i < messageCount; i += limit) {
            console.log("Before ID: " + beforeId + " Count: " + i);
            if (i >= limit) {
                messageTemp = await helpers.callGetMessages({
                    group_id: GROUP_ID,
                    token: ACCESS_TOKEN,
                    before_id: beforeId
                });
                console.log("Next message count: " + messageTemp.count + " -- " + messageTemp.messages.length);
                beforeId = messageTemp.messages[messageTemp.messages.length - 1].id;
                Array.prototype.push.apply(messages, messageTemp.messages);
            }
        }
    }
    console.log("Get messages done.");
    console.log("Total messages: " + messages.length);
    return messages;
}

export const countWords = function (messages) {
    let totalWords = 0;
    for (let message of messages) {
        if ("bot" === message.sender_type) { // Ignore bot messages
            continue;
        }

        let text = message.text;
        if (isEmpty(text)) {
            continue;
        }
        totalWords += text.trim().split(/\s+/).length;
    }
    return totalWords;

}

export const groupMeWordCount = function (messages, word) {
    let wordsCount = 0;
    for (let message of messages) {

        if ("bot" === message.sender_type) {  // Ignore bot messages
            continue;
        }

        let text = message.text;
        if (isEmpty(text)) {
            continue;
        }
        if (text.includes(word)) {
            wordsCount++;
        }
    }
    return wordsCount;
}

export const isEmpty = function (str) {
    return (!str || 0 === str.length);
}
