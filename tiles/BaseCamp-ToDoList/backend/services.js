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

var jive = require("jive-sdk");
var basecamp_Helpers = require( "./routes/oauth/basecamp_helpers");
var sampleOauth = require("./routes/oauth/sampleOauth") ;

var colorMap = {
    'green':'http://cdn1.iconfinder.com/data/icons/function_icon_set/circle_green.png',
    'red':'http://cdn1.iconfinder.com/data/icons/function_icon_set/circle_red.png',
    'disabled':'http://cdn1.iconfinder.com/data/icons/function_icon_set/warning_48.png'
};

function processTileInstance(instance) {
    jive.logger.debug('running pusher for ', instance.name, 'instance', instance.id);

    var config = instance.config;

    var query = "/projects/" + config['projectID']  + "/todolists/" + config['todoListID'] + ".json";

    basecamp_Helpers.queryBasecampV1( config['accountID'], config['ticketID'], sampleOauth, query).then(
        function(response){
            // good return ...
            var data = response.entity.todos.remaining   ;


           var fields = Object.keys(data).map( function(field) {

               if (field > 9) return;

               var title = data[field].content;
               if (data[field].content.length >= 40)
               {
                   title = data[field].content.substring(0,36);
                   title += " ..";

               }
               var assignee = "** unassigned **" ;
               if (data[field].assignee  != undefined)
                    assignee =  data[field].assignee.name;
               var dueOn = "** unspecified **";
                if (data[field].due_on != null)
                    dueOn =  data[field].due_on;
               var url;
               url = "https://basecamp.com/" + tile.config['accountID']  + "/projects/" + tile.config['id'] ;
               var icon = data[field]['creator']['avatar_url']  ;
                return {
                    text: '' + title,
                    icon: data[field]['creator']['avatar_url'],
                    'linkDescription' : 'Visit this To Do item in Basecamp' ,
                    'action' : {
                        //url : jive.service.options['clientUrl'] + 'BaseCamp-ToDoList/action?id=' + new Date().getTime(),
                        context : {title: data[field].content, project:config['project'], todoList:config['todoListDescription'],
                                   projectDescription:config['description'] ,dueOn:dueOn, assignee:assignee , url:url
                                   }

                    }
                }

            } );

            var dataToPush={
                data: {
                    title : config['project'] + " To-Dos",
                    contents: fields,
                    action :
                    {
                        text: 'Basecamp' ,
                        url : 'https://www.basecamp.com'
                    }
                }
            };

            //console.log("Prepared data", JSON.stringify(dataToPush));

            jive.tiles.pushData( instance, dataToPush );
        },
        function(response)
        {
            // bad return
            console.log( "bad query");
        }
    );

    jive.tiles.pushData(instance, dataToPush);
}

exports.task = new jive.tasks.build(
    // runnable
    function() {
        jive.tiles.findByDefinitionName( 'BaseCamp-ToDoList' ).then( function(instances) {
            if ( instances ) {
                instances.forEach( function( instance ) {
                    processTileInstance(instance);
                });
            }
        });
    },

    // interval (optional)
    10000
);
