/**
 * Created by omolina on 6/19/2017.
 */

export const getPersonalityInsights = async function (contentItems) {
    return new Promise(function (resolve, reject) { //can't get 'await' to work with
        console.log("Calling Personality Insights API");
        let PersonalityInsightsV3 = require('watson-developer-cloud/personality-insights/v3');
        let personality_insights = new PersonalityInsightsV3({
            username: '950c87e1-660c-4dac-82ae-e27334d64267',
            password: 'BCp2en2kSWFm',
            version_date: '2016-10-20'
        });

        let params = {
            // Get the content items from the JSON file.
            content_items: contentItems,
            consumption_preferences: true,
            raw_scores: true,
            headers: {
                'accept-language': 'en',
                'accept': 'application/json'
            }
        };

        personality_insights.profile(params, function (error, response) {
                if (error)
                    resolve(error);
                else
                    resolve(JSON.parse(JSON.stringify(response, null, 2)));
            }
        );
    });
}



