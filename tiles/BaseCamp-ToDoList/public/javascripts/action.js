var ticketErrorCallback = function() {
    alert('ticketErrorCallback error');
};

var jiveAuthorizeUrlErrorCallback = function() {
    alert('jiveAuthorizeUrlErrorCallback error');
};


var preOauth2DanceCallback = function() {
    //debugger;
    $("#j-card-authentication").show();
    $("#j-card-action").hide();
    gadgets.window.adjustHeight(400);

    var config = onLoadContext['config'];

    if (typeof config === 'string')
    {
        config = JSON.parse(config) ;
    }

};

var onLoadCallback = function( config, identifiers ) {
    onLoadContext = {
        config: config,
        identifiers : identifiers
    };
};
function doIt( host ) {

    // research - jQuery doesn't like cards that have the same ids .. there is probably a better way
    // than how I did it here!

    var qTicketID;

    // Discussion stuff
    var parent;
    jive.tile.getContainer(function(container) {
        parent = container['resources']['self']['ref'];
    });

    $("#basecampview").click(function() {
        //window.parent.open(jirahost+"/issues/?filter="+config['filter']);
    });

    /*  This was borrowed from another tile, probably don't need it here at all ...
    var rows = config.rows;
    var items = [];
    for (var i=0;i<rows.length;i++) {
        items.push('<tr><td style="white-space:nowrap"><b>'+rows[i].name+'</b></td><td style="white-space:nowrap">'+rows[i].value+'</td></tr>');
    }


    $("#issue-table .table").append(items.join(''));
//    $("#issue-table").show();
    */

    var people = {};
    var sharedPeople = {};

    osapi.jive.corev3.people.get().execute(function(result) {
        function alerts(item) {
            var itemtag = item.replace(/ /g,"-");
            sharedPeople[item] = true;
            if($("#alert-"+itemtag).length) {
                console.log("already in list:", itemtag);
                return;
            }
            $("#shared-people").append('<div class="alert" id="alert-' + itemtag + '"><button type="button" class="close" data-dismiss="alert">x</button>' + item + '</div>');
            $("#alert-" + itemtag).bind('close', function () {
                sharedPeople[item] = false;
                gadgets.window.adjustHeight();
            });
            gadgets.window.adjustHeight();
        }

        result = result.list;
        //debugger;
        $("#people").typeahead({
            source:function(query, process) {
                var names = [];
                for (var i in result) {
                    people[result[i].displayName] = result[i];
                    names.push(result[i].displayName);
                }
                process(names);
            },
            items:3,
            updater:function(item) {
                alerts(item);
                $("#people").val('');
                return item;
            }
        });
        gadgets.window.adjustHeight();
    });

    $("#create-discussion").click(function() {
        debugger;
        //var table = $("#issue-table").html();
        var msgBody="";
        msgBody += ("Project=" + $("#BasecampLinkB").text() +"<br>");
        msgBody += ("To Do List=" + $("#todoListB").text() +"<br>");
        msgBody += ("To Do Task=" + $("#todoNameB").text());

        var message = $("#message").val();
        var shares = [];
        for (var p in people) {
            if (sharedPeople[p]) {
                shares.push(people[p]);
            }
        }
        var visibility = (shares.length > 0) ? "people":"place";
        var obj = {
            "content": {
                "type": "text/html",
                "text": '<p>'+message+'</p><br>'+$("#todo-panel").html()
            },
            "subject": $("#subject").val(),
            "visibility": visibility,
            "users":shares
        }
        if (shares.length == 0) {
            obj["parent"] = parent;
        }
        osapi.jive.corev3.discussions.create(obj).execute(function(result) {
            console.log("result:", result);
        });
        $("#message").val('');
        $("#subject").val('');
        $("#people").val('');
        $("#shared-people").fadeOut();
        alertBox('success', "The discussion has been posted.");
    });

    window.setTimeout( function() {
        gadgets.window.adjustHeight();
    }, 1000);

    gadgets.window.adjustHeight();

//    }, 1000);


function alertBox(type, message) {
    if(!type) {
        type = 'success';
    }

    var alertBox = $(".alert-area").removeClass().addClass('alert-' + type).text(message).fadeIn();
    gadgets.window.adjustHeight();

    setTimeout(function(){
        alertBox.fadeOut();
        alertBox.removeClass().addClass('alert-area');
        jive.tile.close({"message": "The discussion has been created."});
    }, 2000);
}

// End Discussion stuff

    var oauth2SuccessCallback = function(ticketID) {

        // If we are here, we have been successfully authenticated and now can display some useful data ...

        //debugger;
        $("#j-card-authentication").hide();
        $("#j-card-action").show();

        // how do we resize after adding stuff?
        gadgets.window.adjustHeight(700);  // do this here in case preOauth2DanceCallback wasn't called

        //debugger;
        var identifiers = jive.tile.getIdentifiers();
        var viewerID = identifiers['viewer'];   // user ID
        // handle the case of a callback with no ticketID passed .. this happens if
        // we verified that the viewer ID already has a valid token without doing the OAuth2 dance ...
        if (ticketID == undefined)    ticketID = viewerID;
        qTicketID = ticketID;       // save globally for comments, close, and other actions ....
        //alert( "Success! ticketID="+ticketID );

        var config = onLoadContext['config'];

        if (typeof config === 'string')
        {
            config = JSON.parse(config) ;
        }
        //debugger;

        //$("#projectB").text(config.project) ;
        $("#BasecampLinkB").text(config.project) ;
        $("#BasecampLinkB").attr( "href", config.url)
        $("#descriptionB").text(config.projectDescription);
        $("#todoListB").text(config.todoList);
        $("#todoNameB").text(config.title);
        $("#assigneeB").text(config.assignee)  ;
        $("#dueOnB").text(config.dueOn)  ;


        gadgets.window.adjustHeight();

    }    // end OAuth2SuccessCallback ...

    // 'host' was defined, now replaced by a hardcoded one for now ...
    var options = {
        serviceHost : host,
        grantDOMElementID : '#oauth',
        ticketErrorCallback : ticketErrorCallback,
        jiveAuthorizeUrlErrorCallback : jiveAuthorizeUrlErrorCallback,
        oauth2SuccessCallback : oauth2SuccessCallback,
        preOauth2DanceCallback : preOauth2DanceCallback,
        onLoadCallback : onLoadCallback,
        authorizeUrl : host + '/BaseCamp-ToDoList/oauth/authorizeUrl',
        ticketURL: '/oauth/isAuthenticated',
        extraAuthParams: {
            type: 'web_server'
        }
    };

    $("#btn_done").click( function() {
        jive.tile.close(null, {} );
    });
    $("#btn_doneA").click( function() {
        jive.tile.close(null, {} );
    });

    //debugger;
    OAuth2ServerFlow( options ).launch();
//        });
//    });


}  ;