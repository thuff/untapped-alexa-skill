'use strict';
var Alexa = require('alexa-sdk');
var https = require('https');

var APP_ID = undefined;  // TODO replace with your app ID (OPTIONAL).

var languageStrings = {
    "SKILL_NAME" : "Untapped",
    "FOUND_BEER_MESSAGE" : "I found a beer matching your input: ",

    // "GET_FACT_MESSAGE" : "Here's your fact: ",



    "HELP_MESSAGE" : "You can say tell me a pizza fact, or, you can say exit... What can I help you with?",
    "HELP_REPROMPT" : "What can I help you with?",
    "STOP_MESSAGE" : "Goodbye!"
};

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers = {
    'LaunchRequest': function () {
        this.emit('GetBeer');
    },
    'GetNewFactIntent': function () {
        this.emit('GetBeer');
    },
    'GetBeer': function () {

        // console.log(this.t());
        
        var alexa = this;
        
        httpGet("thuff", function (response) {

            // Parse the response into a JSON object ready to be formatted.
            var responseData = JSON.parse(response);

            var output = "";

            // Check if we have correct data, If not create an error speech out to try again.
            if (responseData == null) {
                output = "There was a problem with getting data please try again";
            }
            else {

                var article = "a";

                if(/[aeiou]/.test(responseData.response.checkins.items[0].beer.beer_style.charAt(0).toLowerCase())){
                    article = "an";
                }

               output = 'Teddy last drank: ' + 
                        responseData.response.checkins.items[0].beer.beer_name + ' from ' +
                        responseData.response.checkins.items[0].brewery.brewery_name + ', which is ' + article + ' ' +  
                        responseData.response.checkins.items[0].beer.beer_style + ' and has an ABV of ' +
                        responseData.response.checkins.items[0].beer.beer_abv + '%.'
            }

            alexa.emit(':tellWithCard', output,
                    responseData.response.checkins.items[0].beer.beer_name,
                    output,
                    {smallImageUrl: responseData.response.checkins.items[0].beer.beer_label}
                );
        });
        
        

        // // // Create speech output
        // var speechOutput = languageStrings["FOUND_BEER_MESSAGE"] + "working";
        // this.emit(':tellWithCard', speechOutput, languageStrings["SKILL_NAME"])
    },
    'AMAZON.HelpIntent': function () {
        var speechOutput = languageStrings["HELP_MESSAGE"];
        var reprompt = languageStrings["HELP_MESSAGE"];
        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', languageStrings["STOP_MESSAGE"]);
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', languageStrings["STOP_MESSAGE"]);
    }
};

function httpGet(query, callback) {
  console.log("/n QUERY: "+query);

    var clientID = '0768F4D7461700D9AB736DC8825E7FF714E4975D';
    
    var clientSecret = 'BB64C7D15B9BD57899512A93F46B7834A2BE55D4';

    var options = {
      //http://api.nytimes.com/svc/search/v2/articlesearch.json?q=seattle&sort=newest&api-key=
      
      //https://api.untappd.com/v4/user/checkins/bhedrick?client_id=&client_secret=
        host: 'api.untappd.com',
        path: '/v4/user/checkins/' + query + '?client_id=' + clientID + '&client_secret=' + clientSecret,
        method: 'GET'
    };

    var req = https.request(options, (res) => {

        var body = '';

        res.on('data', (d) => {
            body += d;
        });

        res.on('end', function () {
            callback(body);
        });

    });
    req.end();

    req.on('error', (e) => {
        console.error(e);
    });
}