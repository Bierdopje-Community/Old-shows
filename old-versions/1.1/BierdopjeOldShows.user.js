// ==UserScript==
// @name         Bierdopje Old Shows
// @namespace    http://www.bierdopje.com/
// @version      1.1
// @description  Adds a menu which loads includes a brand new page for the older (finished) shows.
// @match        http://*.bierdopje.com/shows
// @match        http://*.bierdopje.com/shows/
// @match        http://*.bierdopje.com/shows/new
// @match        http://*.bierdopje.com/shows/new/
// @match        http://*.bierdopje.com/shows/finished
// @match        http://*.bierdopje.com/shows/finished/
// @run-at       document-start
// @grant        unsafeWindow
// @require      http://code.jquery.com/jquery-1.10.2.js
// @author       Tom
// @copyright    2016+, Tom
// ==/UserScript==

$(function() {
    var BD_API_URL = 'https://bierdopje-api.houtevelts.com';
    var sourceURL = 'http://www.bierdopje.com/forum/algemene-tv-talk/topic/18769-Open-Gesloten-Einde-Afgelopen-Serie/1';
    var postId = '#post-336431';
    
    // Submenu for the /shows/* pages.
    var subMenuContainer = '<div id="submenucontainer"><div id="submenu"><ul><li class="strong"><a href="/shows" id="active" selected="selected">Actieve series</a></li><li class="strong"><a href="/shows/new" id="new">Nieuwe series</a></li><li class="strong"><a href="/shows/finished" id="finished">Oude series</a></li></ul></div></div>';
    $('#topmenu').after(subMenuContainer);
    
    // Select the page in the submenu and set page title.
    if (window.location.href.indexOf("new") > -1) {
        document.title = 'Bierdopje.com | Series | Nieuwe series';
        $('#new').addClass("selected");
    } else if (window.location.href.indexOf("finished") > -1) {
        document.title = 'Bierdopje.com | Series | Oude series';
        $('#finished').addClass("selected");
    } else {
        document.title = 'Bierdopje.com | Series | Actieve series';
        $('#active').addClass("selected");
    }
    
    // Add finished series content
    if (window.location.href.indexOf("finished") > -1) {
        var finishedHeaderText = '<h3>Alle <u>afgelopen</u> series</h3><div class="clear">&nbsp;</div>';
        var contentDiv = $('.go-wide');
        contentDiv.find('div').replaceWith(finishedHeaderText);
        
        var tableStart = '<table class="listing form" cellspacing="0"><colgroup><col style="width:20%;"><col style="width:5%;"><col style="width:6%;"><col style="width:6%;"><col style="width:8%;"><col style="width:6%;"><col style="width:6%;"></colgroup><tbody id="tableData">';
        var tableHeaders = '<tr><th class="bluerow">Naam</th><th class="bluerow">Runtime</th><th class="bluerow"># Seizoenen</th><th class="bluerow"># Afleveringen</th><th class="bluerow">Status</th><th class="bluerow">Score</th><th class="bluerow"># Favorieten</th></tr>';
        var tableEnd = '</tbody></table>';
        
        contentDiv.append(tableStart);
        
        var tableData = $('#tableData');
        
        tableData.append(tableHeaders);
        
        $.ajax({
            url: sourceURL,
            type: "GET",
            success: function(data) {
                $(data).find(postId).find('p').find('a').each(function() {
                    var currentURL     = this.href;

                    if (currentURL.indexOf("shows/") > -1) {
                        var n              = currentURL.lastIndexOf('shows/');
                        var linkName       = currentURL.substring(n + 6);
                        $.getJSON(BD_API_URL + '/GetShowByLinkName/' + linkName, function(show) {
                            var showName       = show.name;
                            var showRuntime    = show.runtime;
                            var showSeasons    = show.seasons;
                            var showEpisodes   = show.episodes;
                            var showStatus     = 'Afgelopen'; //show.showstatus
                            var showScore      = show.score;
                            var showFavourites = show.favorites;

                            var tableRow = '<tr><td><a href="' + currentURL + '">' + showName + '</a></td><td>' + showRuntime + '</td><td>' + showSeasons + '</td><td>' + showEpisodes + '</td><td>' + showStatus + '</td><td>' + showScore + '</td><td>' + showFavourites + '</td></tr>';
                            tableData.append(tableRow);
                        });
                    }
                });
            }
        });
        
        tableData.append(tableEnd);
    }
});