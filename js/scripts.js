$(function() {
    
    var names = [],
        friends = {}
    
    var getUrl = function(params) {
        var defaultParams = {
            'api_key': '712951dccf80f3d19b4555af570187c5',
            'format': 'json'
        }
    
        return "http://ws.audioscrobbler.com/2.0/?" + $.param($.extend({}, defaultParams, params))
    }
    
    var ajax = function(params, callback) {    
        $.ajax({
            url: getUrl(params),
            async: false,
            dataType: 'json',
            success: callback
        });    
    }
    
    var getFriends = function(params, callback) {
        /*var callbackFn = function (data) {
            var page = parseInt(data.friends['@attr'].page) + 1
            var totalPages = parseInt(data.friends['@attr'].totalPages)
            if (page <= totalPages) {
                getFriends($.extend({}, {'page': page}, params), callback)
            }
            callback(data);
        }*/
        
        ajax(
            $.extend({}, {'method': 'user.getfriends'}, params), 
            callback
        )
    }
    
    var addUser = function(user, isFriend) {
        if (user.name === 'pabloidz') {
            return false;
        }
        if (!friends[user.name]) {
            friends[user.name] = user;
            names.push(user.name);
        }
        friends[user.name].count = (friends[user.name].count || 0) + 1;
        friends[user.name].isFriend = (friends[user.name].isFriend || isFriend);
    }
    
    var showList = function() {
        names.sort(function (nameA, nameB) {
            return friends[nameB].count - friends[nameA].count;
        })
        
        var output = []
        $.each(names, function (i, name) {
            if ((!friends[name].isFriend) && friends[name].count > 10) {
                output.push('<a href="' + friends[name].url + '">' + name + ' (' + friends[name].count + ' friends in common)</a>')
            }
        })
        
        $("#friends_list").append(output.join('<br />'))
        //console.info(friends)
    }
    
    var getContents = function() {
        getFriends({'user': 'pabloidz', 'limit': 300}, function(data) {
            if (data.friends) {
                $.each(data.friends.user, function(i, user) {
                    addUser(user, true);
                    getFriends({'user': user.name, 'limit': 20000}, function(data2) {
                        if ($.isArray(data2.friends.user)) {
                            $.each(data2.friends.user, function(i, user2) {
                                addUser(user2, false);
                            })
                        }
                        else {
                            addUser(data2.friends.user, false);
                        }
                    })
                    console.info(names.length)
                })
            }
        })
        showList();
    }
    
    getContents();

})