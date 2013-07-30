/*
 * Copyright 2013 Jive Software
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */

var count = 0;
// /Users/jim.dickerson/basecampPP/tiles/BaseCamp-ProjectCalendar/backend/datapusher.js
var jive = require("jive-sdk");
var basecamp_Helpers = require( "./routes/oauth/basecamp_helpers");
var sampleOauth = require("./routes/oauth/sampleOauth") ;

exports.task = function() {
    jive.tiles.findByDefinitionName( "BaseCamp-ProjectCalendar" ).then( function(tiles) {
        tiles.forEach( function( tile) {

            var calendarUrl = tile.config['url'];
            // not sure how to display the calendar just for this project ... so for now just create a link to
            // the calendar for the account ..
            var n = calendarUrl.indexOf("/api/v1");
            if (n > 0)
            {
                calendarUrl = calendarUrl.slice(0,n) ;
                calendarUrl += "/calendar" ;
            }
            else
                calendarUrl = "";

            var query = "/projects/" + tile.config['id']  + "/calendar_events.json";

            // the following 2 lines don't do it ... (trying to get calendar for specific project
            //calendarUrl = calendarUrl.replace("api/v1/", "") ;
            //calendarUrl = calendarUrl.replace(".json", "/calender") ;
            basecamp_Helpers.queryBasecampV1( tile.config['accountID'], tile.config['ticketID'], sampleOauth, query).then(
                function(response){
                 // good return ...
                    var url = tile.config['url'];
                    url = url.replace("api/v1/", "") ;
                    url = url.replace(".json", "") ;
                    console.log( "good query");
                    var dataToPush={
                        data : {"title" : tile.config['project'] + " ToDos",
                            "events" :[{}] ,
                            "action" : {"text" : "Check out the Account Calendar" , "url" : calendarUrl}
                        }
                    };
                    console.log( "number of events=" + response.entity.length) ;
                    var start;
                    for (var i=0; i<response.entity.length; i++ )
                    {
                        dataToPush.data.events[i] = {};
                        dataToPush.data.events[i].title = response.entity[i].summary;
                        dataToPush.data.events[i].location = "" ;  // not provided by API or the App !
                        start =  response.entity[i].starts_at;
                        if (start.length == 10)
                            start +=  "T12:00:00-08:00";
                        else
                        {
                            start = start.replace(".000", "");
                            dataToPush.data.events[i].location = start ;
                        }

                        dataToPush.data.events[i].start = start;
                        dataToPush.data.events[i].description = response.entity[i].description;
                        dataToPush.data.events[i].action = {text : "Take a closer look ..." ,
                            'context' : {name: tile.config['project'],
                                description: tile.config['description'],
                                id:tile.config['id'],
                                url:  url}};

                    }

                    jive.tiles.pushData( tile, dataToPush );
                },
                function(response)
                {
                    // bad return
                    console.log( "bad query");
                }
            );

        } );
    }, 10000);
};