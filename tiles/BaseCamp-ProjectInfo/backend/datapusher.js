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

var jive = require("jive-sdk");


// we're going to just use the data we received from the config for now as it isn't clear
// that the project name or description can be changed once the project is created. So ..
// no reason to query Basecamp for updated data on this tile ...

exports.task = function() {
    jive.tiles.findByDefinitionName( "BaseCamp-ProjectInfo" ).then( function(tiles) {
        console.log( "length = ", tiles.length)
        tiles.forEach( function( tile ) {
            var description = tile.config['description'] ;
            var project = tile.config['project'];

            // the actual url we get from Basecamp refers to the API url for
            // the project. It APPEARS that the HTML url follows a pattern that
            // we'll just implement here until we here otherwise ...
            // the url we get, for example is https://basecamp.com/XXXXXXX/api/v1/YYYYYYY-basecamp-pp.json
            //    where XXXXXXX = account ID
            //          YYYYYYY = project ID
            //          basecamp-pp = the first two words of the projecxt
            //
            //  we just need to get rid of the api/vi part and the .json part ...

            var url = tile.config['url'];
            url = url.replace("api/v1/", "") ;
            url = url.replace(".json", "") ;
            if (description.length > 50)
            {
                description = description.substring( 0, 46)  ;
                description += " ..";
            }
            if (project.length > 50)
            {
                project = project.substring( 0, 46);
                project += " ..";
            }
            var dataToPush = {
                "data":
                {
                    "title": "Basecamp Project Information",
                    "contents": [
                        {
                            "name": "Project Name",
                            "value" : project
                        },
                        {
                            "name": "ID",
                            "value": tile.config['id'],
                            //"url" : url
                        } ,
                        {   "name" : "Description",
                            "value" : description
                        },
                        {   "name" : "Created_By",
                            "value" : "unknown"
                        }
                    ],
                    "action":{
                        text : "Take a closer look ..." ,
                        'context' : {name: project, description: tile.config['description'], id:tile.config['id'], url: url}
                    }
                }
            };

            jive.tiles.pushData( tile, dataToPush );
        } );
    }, 10000);
};