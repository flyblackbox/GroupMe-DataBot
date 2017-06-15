const request = require('request');
const GROUP_ME_BASE_URL = "https://api.groupme.com/v3/";

export const getGroupDetails = () => {
        return async (_, args) => {
        console.log("Function: getGroupDetails");
        let group = await callGroupDetails(args.token);
        return group;
    }
}

export const getBots = () => {
    return async (_, args) => {
        console.log("Function: getBots");
        let data = JSON.parse(await callGroupMe("bots", args.token, "GET", {}));
        let response = data.response;
        return response;
    }
}

export const getMessages = () => {
    return async (_, args) => {
        console.log("Function: getMessages");
        let response = await callGetMessages(args);
        return response;
    }
}

export const getWordCount = () => {
    return async (_, args) => {
        console.log("Function: getWordCount");
        let response = await callGetMessages(args);
        let messages = response.messages;
        let count = 0;
        for (let i = 0; i < messages.length; i++) {
            let message = messages[i];
            let text = message.text;
            if (text.includes(args.word)) {
                count++;
            }
        }

        let groupDetails = await callGroupDetails(args.token);
        let output = {
            group_name: groupDetails.name,
            word: args.word,
            count: count
        }
        return output;
    }
}


export const sendBotMessage = () => {
    return async (_, args) => {
        console.log("Function: sendBotMessage");
        let formData = {
            bot_id: args.bot_id,
            text: args.text
        };
        let data = await callGroupMe("bots/post", args.token, "POST", formData);

        let message = {
            id: 1,
            bot_id: args.bot_id,
            text: args.text
        };


        return message;
    }
}

export const callGroupMe = async (subUri, token, request_type, formData, before_id) => {
    console.log("Calling GroupMe API...");

    let uri = GROUP_ME_BASE_URL + subUri + "?limit=100&token=" + token;
    if (before_id > 0) {
        uri = uri + "&before_id=" + before_id;
    }

    let requestObject = {
        url: uri,
        method: request_type,
    }
    if (request_type === "POST") {
        console.log(formData);
        requestObject.form = formData;
        requestObject.json = true;
    }

    console.log(requestObject);

    return new Promise(function (resolve, reject) { //can't get 'await' to work with 'request'
        request(requestObject, (error, response, body) => {
            if (!error && response.statusCode === 200) {
                resolve(body || response);
            } else {
                console.log("Response:" + response);
                console.log("Error: " + error);
                resolve({error: "Empty Response"});
            }
        })
    });
}

export const callGroupDetails = async (token) => {
    let data = JSON.parse(await callGroupMe("groups", token, "GET", {}));
    let response = data.response[0];
    let group = {
        id: response.id,
        group_id: response.group_id,
        name: response.name,
        members: response.members
    };
    return group;
}


export const callGetMessages = async (args) => {
    let data = JSON.parse(await callGroupMe("groups/" + args.group_id + "/messages", args.token, "GET", {}, args.before_id));
    let response = data.response;
    return response;
}

export const getUserLastSeen = () => {
    return async (_, args) => {
        console.log("Function: getUserLastSeen");
        let groupDetails = await callGroupDetails(args.token);
        let members = groupDetails.members;
        let user_id = 0;
        for (let member of members) {
            console.log(member.nickname);
            if (args.username === member.nickname) {
                user_id = member.user_id;
                break;
            }
        }

        if (user_id === 0) {
            let error = {
                code: 1001,
                message: "User name not found."
            }

            throw error;
        }


        let response = await callGetMessages(args);

        let messages = response.messages;

        let last_seen = 0;
        for (let message of messages) {
            if (user_id === message.user_id) {
                last_seen = message.created_at;
            }
        }
        let output = {
            username: args.username,
            last_seen: new Date(last_seen)
        };
        return output;
    }
}

export const getHeartCount = () => {
    return async (_, args) => {
        console.log("Function: getUserLastSeen");
        let groupDetails = await callGroupDetails(args.token);
        let members = groupDetails.members;
        let response = await callGetMessages(args);
        let messages = response.messages;
        let heartCounts = [];
        for (let member of members) {
            let count = 0;
            for (let message of messages) {
                if (member.user_id == message.user_id) {
                    count += message.favorited_by.length;
                }
            }

            let heartCount = {
                username: member.nickname,
                count: count
            }
            heartCounts.push(heartCount);
        }

        return heartCounts;
    }
}