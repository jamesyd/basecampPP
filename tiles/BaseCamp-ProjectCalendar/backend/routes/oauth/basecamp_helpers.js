var jive = require("jive-sdk");
var util = require('util');
var request = require("request") ;


// generic requests that go through the basecamp.com  API endpoint ..
exports.queryBasecampV1 = queryBasecampV1;
exports.postBasecampV1 = postBasecampV1;

exports.getAuthorizationInfo = getAuthorizationInfo;

function queryBasecampV1(ticketID, myOauth, uri){

    var tokenStore = myOauth.getTokenStore();

    return tokenStore.find('tokens', {'ticket': ticketID }).then( function(found) {
        if ( found[0] != undefined ) {
            var accessToken = found[0]['accessToken'];
            //var host = found[0]['accessToken']['instance_url'];

            var headers = {
                'User-Agent': 'Purposeful Places (jim.dickerson@jivesoftware.com',
                'Authorization' : 'Bearer ' + accessToken
            };

            console.log("queryBasecampV1: " + "https://basecamp.com:" + uri );
            return jive.util.buildRequest(
                // special case - set port to 0 to tell underlying SDK not to default to port 443
                // we need to have NO port numbert attached to this request ....
                "https://basecamp.com" + uri,
                'GET', null, headers, null );
        }

        throw Error('No token record found for ticket ID=' + ticketID);
    }).then(
        // success
        function(response) {
            return response;
        },

        // fail
        function(err) {
            jive.logger.error('Error querying Basecamp', err);
            return err;
        }
    );
};

function postBasecampV1(ticketID, myOauth, uri, data){

    var tokenStore = myOauth.getTokenStore();

    return tokenStore.find('tokens', {'ticket': ticketID }).then( function(found) {
        if ( found ) {
            var accessToken = found[0]['accessToken'];
            //var host = found[0]['accessToken']['instance_url'];

            var headers = {
                'User-Agent': 'Purposeful Places'  ,
                'Content-Type': 'application/json'
            };


            return jive.util.buildRequest(
                // special case - set port to 0 to tell underlying SDK not to default to port 443
                // we need to have NO port numbert attached to this request ....
                "https://api.github.com" + uri + "?access_token=" + accessToken,
                'POST', data, headers, null)

        }

        throw Error('No token record found for ticket ID');
    }).then(
        // success
        function(response) {
            return response;
        },

        // fail
        function(err) {
            jive.logger.error('Error posting to GitHub', err);
        }
    );
};

function getAuthorizationInfo(ticketID, myOauth){

    var tokenStore = myOauth.getTokenStore();
    var uri = "/authorization.json" ;
    var headers = {};

    return tokenStore.find('tokens', {'ticket': ticketID }).then( function(found) {
        if ( found[0] != undefined ) {
            var accessToken = found[0]['accessToken'];

            headers = {
                'User-Agent': 'Basecamp PP interface (jim.dickerson@jivesoftware.com)',
                'Authorization' : 'Bearer ' + accessToken
            };

            console.log("getAuthorizationInfo: " + "https://launchpad.37signals.com" + uri );
            return jive.util.buildRequest(
                "https://launchpad.37signals.com" + uri ,
                'GET', null, headers, null).then (function(response)
            {
                // Ok, we have the account info, now get the projects ....
                // can the user have more than one account? Assume not for now .. just use the first one for scoping ...
                uri = "/" + response.entity.accounts[0].id + "/api/v1/projects.json";
                return jive.util.buildRequest( "https://basecamp.com" + uri, 'GET', null, headers, null ) ;

            });
        }

        throw Error('No token record found for ticket ID=' + ticketID);
    }).then(
        // success
        function(response) {
            return response;
        },

        // fail
        function(err) {
            jive.logger.error('Error querying Basecamp', err);
            return err;
        }
    );
};
