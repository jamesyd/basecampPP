var sampleOauth = require('./sampleOauth.js');
var baseCampQueryer = require('./basecampQueryer.js');

exports.authorizeUrl = {
    'verb' : 'get',
    'route': sampleOauth.authorizeUrl.bind(sampleOauth)
};

exports.oauth2Callback = {
    'verb' : 'get',
    'route': sampleOauth.oauth2Callback.bind(sampleOauth)
};

exports.query = {
    'verb' : 'get',
    'route' : baseCampQueryer.handleGitHubQuery
};

exports.post = {
    'verb' : 'post',
    'route' : baseCampQueryer.handleGitHubPost
};

exports.isAuthenticated = {
    'path'  : '/oauth/isAuthenticated',
    'verb' : 'get',
    'route' : baseCampQueryer.isAuthenticated
};


exports.getAuthorizationInfo = {
    'path'  : '/oauth/getAuthorizationInfo',
    'verb' : 'get',
    'route' : baseCampQueryer.isAuthenticated
}
