$(function() {
    
    var friends = []
    
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
    
    var getContents = function() {
        getFriends({'user': 'pabloidz', 'limit': 300}, function(data) {
            if (data.friends) {
                $.each(data.friends.user, function(i, user) {
                    getFriends({'user': user.name, 'limit': 1}, function(data2) {
                        if (data2.friends["@attr"]) {
                            var total = parseInt(data2.friends["@attr"].total)
                            //if (total > 100) { 
                                friends.push(user.name + ' (' + data2.friends["@attr"].total + ')')
                            //}
                        }
                    })
                })
            }
        })
        $("#friends_list").append(friends.join('<br />'))
    }
    
    getContents();

})