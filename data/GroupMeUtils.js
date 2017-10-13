import * as helpers from "./helpers";
import * as PersonalityInsights from "./PersonalityInsights";
import dotenvConfig from 'dotenv';

dotenvConfig.config();
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const BOT_ID = process.env.BOT_ID;
const GROUP_ID = process.env.GROUP_ID;
const API = require('groupme').Stateless;


// when we receive a message
export const postBotMessage = async function(req) {
    console.log("Request Payload");
    console.log(req.body);
    let consoleMessage = "";
    let botMessage = "";
    let sender_type = req.body.sender_type;
    let text = isEmpty(req.body.text) ? req.body.text : req.body.text.trim();

    // if from a bot, ignore it
    if (sender_type === "bot") {
        console.log("No action..");

        // else if it's from a user
    } else if (sender_type === "user") {
        // convert all text to lowercase for easier parsing
        text = text.toLowerCase();

        if (['hi', 'hello'].includes(text)) {
            // library of responses to the above 'if'
            let randomText = [
                'Hi, I am the ArmBot',
                'Hello you bitch, you!',
                'Seh-hent', 'Oooooop!',
                'My shoes are ruined!',
                'I was caught in a starm',
                'Hello, Rouis.',
                'We are all Blue Henns!',
                'Smells like my asshole bro..',
                'Uhhghh!! Can I get my face backkk?!'
            ];
            // pick a random index and spit it back
            let id = Math.round(Math.random() * (randomText.length - 1));
            botMessage = randomText[id];
            consoleMessage = "Bot sent hi reply.";

        } else if (text.includes("/wordcount")) {
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

        } else if (text.includes("/messages")) {
            // this whole thing needs checks to make sure the syntax is:
            // syntax:   /hearts number units
            // example:  /hearts 5 days

            // pop the command into an array
            let textArray = text.split(" ");
            // if length is greater than 1 we have a number
            let hasNumber = textArray.length > 1;
            // if length is greater than 2 we have units
            let hasUnits = textArray.length > 2;

            // if we don't have a number, numHours = 0
            let numHours = hasNumber ? textArray[1] : 0;
            // if we have units, use the units as a mulitplier

            // plural will be 1 if we are asking for more than 1 of a unit
            let plural = numHours == 1 ? 0 : 1;

            // default unitsInText
            let unitsInText =  numHours + " hour";

            if (hasUnits) {
                let units = textArray[2];

                if (units.includes("hour")) {
                    // do nothing
                }
                else if (units.includes("day")) {
                    // 24 hours in a day
                    unitsInText = numHours + " day";
                    numHours *= 24;
                }
                else if  (units.includes("week")) {
                    // 7 days in a week
                    unitsInText = numHours + " week";
                    numHours *= 24 * 7;
                }
                else if  (units.includes("month")) {
                    // 4 weeks in (most) months
                    unitsInText = numHours + " month";
                    numHours *= 24 * 7 * 4
                }
                else if  (units.includes("year")) {
                    // 365 days in a year
                    unitsInText = numHours + " year";
                    numHours *= 24 * 365;
                }

            }
            if (plural) {
                unitsInText += "s";
            }

            // if no time entered, modify to ask for ALL TIME
            if( numHours == 0 ){
                numHours = new Date().getTime()/(1000*3600)-1;
                botMessage = "Messages Sent All Time\n\n";
            } else {
                botMessage = "Messages Sent In The Last: " + unitsInText + "\n\n";
            }
          
            // request the messages from N seconds ago till now
            let messages = await getMessages( numHours * 3600 );
            let groupDetails = await helpers.callGroupDetails(ACCESS_TOKEN);
            let members = groupDetails.members;
          
            // create a 'message count' field for each member
            for(let member of members){
              member.message_count = 0;
            }

            // loop through all the messages and increment the users messages count
            let totalHumanMessages = 0;
            for (let message of messages) {
              for( let member of members ){
                if(member.user_id == message.user_id){
                  totalHumanMessages ++;
                  member.message_count++;
                }
              }            
            }

            // todo: sort these babies first
            for(let member of members){
              member.message_percentage = member.message_percentage == undefined ? 0 : member.message_percentage;
              botMessage += member.nickname + ": " + member.message_count + " messages (" + (100*(member.message_count/messages.length)).toFixed(2)+"%)\n"
            }
          
            let botCount = messages.length - totalHumanMessages;
            botMessage += "ArmBot: " + botCount + " messages (" + (100*(botCount/messages.length)).toFixed(2)+ "%)\n";
            botMessage += "\nTotal Messages: " + messages.length;
                    
        } else if (text.includes("/hearts")) {
            // this whole thing needs checks to make sure the syntax is:
            // syntax:   /hearts number units
            // example:  /hearts 5 days

            // pop the command into an array
            let textArray = text.split(" ");
            // if length is greater than 1 we have a number
            let hasNumber = textArray.length > 1;
            // if length is greater than 2 we have units
            let hasUnits = textArray.length > 2;

            // if we don't have a number, numHours = 0
            let numHours = hasNumber ? textArray[1] : 0;
            // if we have units, use the units as a mulitplier

            // plural will be 1 if we are asking for more than 1 of a unit
            let plural = numHours == 1 ? 0 : 1;

            // default unitsInText
            let unitsInText =  numHours + " hour";

            if (hasUnits) {
                let units = textArray[2];

                if (units.includes("hour")) {
                    // do nothing
                }
                else if (units.includes("day")) {
                    // 24 hours in a day
                    unitsInText = numHours + " day";
                    numHours *= 24;
                }
                else if  (units.includes("week")) {
                    // 7 days in a week
                    unitsInText = numHours + " week";
                    numHours *= 24 * 7;
                }
                else if  (units.includes("month")) {
                    // 4 weeks in (most) months
                    unitsInText = numHours + " month";
                    numHours *= 24 * 7 * 4
                }
                else if  (units.includes("year")) {
                    // 365 days in a year
                    unitsInText = numHours + " year";
                    numHours *= 24 * 365;
                }

            }
            if (plural) {
                unitsInText += "s";
            }

            let messages = await getMessages( numHours * 3600 );
            let groupDetails = await helpers.callGroupDetails(ACCESS_TOKEN);
            let members = groupDetails.members;
            let heartCounts = [];
            let groupTotal = [];

            for (let member of members) {
                let count = 0;
                for (let message of messages) {
                    if (member.user_id == message.user_id) {
                        count += message.favorited_by.length;
                    }
                }

                let heartCount = member.nickname + ": " + count;
                heartCounts.push(heartCount);

                // lets be smart about storing this so we can sort it     
                let userTotal={
                  "member": member.nickname,
                  "count": count
                }
                
                console.log(userTotal);
                
                // add data to groupTotal sorted by total
                if( groupTotal.length == 0 ){
                  // if this shit's empty, just push it
                  groupTotal.push(userTotal);
                }else{
                  let added = false;
                  
                  // else, look through the current groupTotal
                  for(let i =0; i< groupTotal.length; i++){

                    // if the userTotal at this index is less than the one we are trying to add
                    if( groupTotal[i].count <= userTotal.count ){
                      // splice this new usertotal into the group total
                      groupTotal.splice(i, 0, userTotal );
                      added = true;
                      break;
                    }
                  }
                  if(!added){
                    groupTotal.push(userTotal);
                  }
                }
            }
          
            if (numHours == 0) {
                botMessage = "Hearts Received All Time\n\n";
            } else {
                botMessage = "Hearts Received In The Last: " + unitsInText + "\n\n";
            }

            groupTotal.forEach(function(item,index,array){
                  botMessage += (index+1) + ". " + item.member + " : " + item.count + "\n";
            });
          
            consoleMessage = "Bot sent a heart count reply.";

        } else if (text.includes("/lastseen")) {
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
            if (last_seen == 0) {
                botMessage = user_id + " hasn't been seen yet."
            } else {
                let dateF = new Date(last_seen * 1000);
                botMessage = dateF.toUTCString();
            }

            console.log(last_seen);
            consoleMessage = "Bot sent a last seen timestamp reply.";

        } else if (text.includes("/personality")) {
            console.log(text);

            let sinceHours = text.match(/\d+$/);
            console.log("sinceHours: " + sinceHours);
            if (!sinceHours) {
                sinceHours = 0;
            }

            let messages = await getAllMessages();
            let user_id = req.body.attachments[0].user_ids[0];
            let dateNow = new Date();
            let contentItems = [];
            let i = 0;
            let username = "";
            for (let message of messages) {
                if (user_id === message.user_id) {
                    username = message.name;
                    let dateMsg = new Date(message.created_at * 1000);
                    let hourDiff = Math.abs(dateNow - dateMsg) / 36e5;

                    if (sinceHours !== 0 && sinceHours < hourDiff) {
                        console.log("Loop breaks at " + i + " times.");
                        break;
                    }

                    if (!message.text) {
                        console.log("Empty text.");
                        continue;
                    }

                    contentItems.push({
                        "content": message.text,
                        "contenttype": "text/plain",
                        "created": message.created_at,
                        "id": message.id,
                        "language": "en"
                    });
                    i++;
                }
            }

            let personalityInsights = await PersonalityInsights.getPersonalityInsights(contentItems);
            console.log("Personality response length: " + personalityInsights.personality.length);
            botMessage = username + " has been ";
            if (sinceHours > 0) {
                botMessage += personalityInsights.personality[0].name.toLowerCase() + " over the past " + sinceHours.toString() + " hours";
            } else {
                let id = Math.round(Math.random() * (personalityInsights.personality.length - 1));
                botMessage += personalityInsights.personality[id].name.toLowerCase();
            }

            botMessage += ".";
            consoleMessage = "Bot sent a Personality Insights reply.";
        }

    }

    if (botMessage) {
        let opts = {
            picture_url: "",
        }
        API.Bots.post(ACCESS_TOKEN, BOT_ID, botMessage, opts, function(err, ret) {
            if (!err) {
                console.log(botMessage);
                console.log(consoleMessage);
            }
        });
    }
}


export const getAllMessages = async function() {
    let messages = [];
    const limit = 100;
    console.log("Get messages.");
    let messageTemp = await helpers.callGetMessages({
        group_id: GROUP_ID,
        token: ACCESS_TOKEN,
        before_id: 0
    });
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

export const countWords = function(messages) {
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

export const groupMeWordCount = function(messages, word) {
    let wordsCount = 0;
    for (let message of messages) {

        if ("bot" === message.sender_type) { // Ignore bot messages
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

export const isEmpty = function(str) {
    return (!str || 0 === str.length);
}

export const getMessages = async function(seconds) {
  console.log("Getting " + seconds + " seconds worth of messages.");
  
	// array to hold the messages we return
  let messages = [];	
	// getTime returns milli seconds since epoch, divide by 1k to conver to seconds and subtract how many seconds we care about
	let seekTime = (new Date().getTime()/1000) - seconds;

	let searchComplete = false;
	let beforeId = 0;
  let limit = 100;
  let totalMessageCount = 0;
	do{
		// get a chunk of messages 
		let data = await helpers.getMessageWrapper({
			group_id: GROUP_ID,
			token: ACCESS_TOKEN,
			before_id: beforeId,
      limit: limit
		});

    // set our request limit to the number of messages remaining
    limit = data.count - messages.length;
    totalMessageCount = data.count;
    
    // if limit is greater than 100, default to 100
    limit = limit > 100 ? 100 : limit;
    
    // if limit is less than 100, set to 0.. who knows why.
    limit = limit < 100 ? 0 : limit;
    
		// loop through the chunk
		for( let i = 0; i< data.messages.length; i++){
      // see if this message timestamp is after our seek time
			if( data.messages[i].created_at > seekTime ){
        // add it to our messages array
        messages.push(data.messages[i]);
			}else{
        // search is complete! set some flag and gtfo
				searchComplete = true;
        break;
			}
		}
    		
		// reassign the before id for the next chunk request
    beforeId = data.messages[data.messages.length - 1 ].id;
  }while( searchComplete == false && limit > 0);

  console.log("Received " + messages.length + " of " + totalMessageCount + " messages.");
  return messages;
}