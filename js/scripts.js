$(function() {
    
    var names = [],
        friends = {}
    
    var getUrl = function(params) {
        var defaultParams = {
            'api_key': '*****',
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

    // Region: Get Friends
    
    var getFriends = function(params, callback) {        
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
            if ((!friends[name].isFriend) && friends[name].count > 15) {
                output.push('<a href="' + friends[name].url + '">' + name + '</a> (' + friends[name].count + ' friends in common)')
            }
        })
        $("#friends_list").append('<ol><li>' + output.join('</li><li>') + '</li></ol>')
    }
    
    var addEachUser = function(data, loadMore) {
        if ($.isArray(data.friends.user)) {
            $.each(data.friends.user, function(index, user) {
                addUser(user, false);
            })
        }
        else {
            addUser(data.friends.user, false);
        }
        
        if (loadMore) {
            loadMore()
        }
    }
    
    var showLoadingMessage = function(index, total, page, totalPages) {
        $("#loading").text("Loading " + (index + 1) + " of " + total + " friends")
        if (totalPages) {
            $("#loading").append(" (" + page + "/" + totalPages + " pages)")
        }
    }
    
    var getContents = function() {
        getFriends({'user': 'pabloidz', 'limit': 300}, function(data) {
            if (data.friends) {
                var friendsTotal = data.friends.user.length
                $.each(data.friends.user, function(index, user) {
                    showLoadingMessage(index, friendsTotal)
                    addUser(user, true);
                    getFriends({'user': user.name, 'limit': 300}, function(data2) {
                        addEachUser(data2, function () {
                            var totalPages = parseInt(data2.friends['@attr'].totalPages);
                            if (totalPages > 1) {
                                for (var i = 2; i <= totalPages; i++) {
                                    getFriends({'user': user.name, 'limit': 300, 'page': i}, function(data3) {
                                        showLoadingMessage(index, friendsTotal, i, totalPages)
                                        addEachUser(data3, function() {})
                                    })
                                    
                                }
                            }    
                        })
                    })
                })
            }
        })
        $("#loading").text("Loading completed")
        showList();
    }
    
    // Region: Top 50
    
    var getTop50 = function() {
        ajax(
            $.extend({}, {'method': 'user.gettopartists'}, {'period': 'overall', 'user': 'pabloidz'}), 
            function(data) {
                var output = [],
                    artists = data.topartists.artist
                    
                // Calculate projected count (it may have a proper math name)
                var total = 0,
                    firstCount = parseInt(artists[0].playcount),
                    lastCount = parseInt(artists[artists.length - 1].playcount),
                    decrement = ((firstCount - lastCount) / (artists.length - 1)),
                    projectedCount = parseInt(artists[0].playcount),
                    difference = 0
                
                $.each(artists, function(index, artist) {
                    difference = projectedCount - parseInt(artist.playcount)
                    output.push('<td>' + artist.name + '</td><td>' + artist.playcount + '</td><td>' + parseInt(projectedCount) + '</td><td class="' + (difference >= 0 ? 'up' : 'down') + '">' + parseInt(difference) + '</td>')
                    projectedCount -= decrement
                })
            
                var tableHeader = '<table><thead><td>Artist</td><td>Play Count</td><td>Projected Count</td><td>Increment</td></thead><tr>',
                    tableFooter = '</tr></table>'
                
                $("#top_50").append(tableHeader + output.join('</tr><tr>') + tableFooter)
            }
        )
    }
    
    if ($("#friends_list").length > 0) {
        getContents();
    }
    
    if ($("#top_50").length > 0) {
        getTop50();
    }

})