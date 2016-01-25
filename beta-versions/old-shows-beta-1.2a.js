// ==UserScript==
// @name         Bierdopje Old Shows
// @namespace    http://www.bierdopje.com/
// @version      1.2a
// @description  Adds a menu which loads includes a brand new page for the older (finished) shows.
// @match        http://*.bierdopje.com/shows
// @match        http://*.bierdopje.com/shows/
// @match        http://*.bierdopje.com/shows/page/*
// @match        http://*.bierdopje.com/shows/new
// @match        http://*.bierdopje.com/shows/new/
// @match        http://*.bierdopje.com/shows/finished
// @match        http://*.bierdopje.com/shows/finished/
// @match        http://*.bierdopje.com/shows/finished/page/*
// @run-at       document-start
// @grant        unsafeWindow
// @require      http://code.jquery.com/jquery-1.10.2.js
// @author       Tom
// @copyright    2016+, Tom
// ==/UserScript==

$(function() {
    var BD_API_URL         = 'https://bierdopje-api.houtevelts.com';
    var sourceJSON         = 'https://raw.githubusercontent.com/Bierdopje-Community/old-shows/master/show_data/thetvdb_series.json';
    var SHOWS_PER_PAGE     = 50;
    var PAGINATION_ITEMS   = 6;
    
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
        if (window.location.href.indexOf("/page/") > -1) {
            var url         = window.location.href;
            var currentPage = parseInt(url.substring(url.lastIndexOf('/page/') + 6));
        } else {
            var currentPage = 1;
        }
        var clear = '<div class="clear">&nbsp;</div>';
        var finishedHeaderText = '<h3>Alle <u>afgelopen</u> series</h3>';
        var contentDiv = $('.go-wide');
        contentDiv.find('div').replaceWith(finishedHeaderText);
        
        var paginationStart = '<ul id="pagination">';
        var paginationEnd   = '</ul>';
        
        var tableStart   = '<table id="startShowTable" class="listing form" cellspacing="0"><colgroup><col style="width:20%;"><col style="width:5%;"><col style="width:6%;"><col style="width:6%;"><col style="width:8%;"><col style="width:6%;"><col style="width:6%;"></colgroup><tbody id="tableData">';
        var tableHeaders = '<tr><th class="bluerow">Naam</th><th class="bluerow">Runtime</th><th class="bluerow"># Seizoenen</th><th class="bluerow"># Afleveringen</th><th class="bluerow">Status</th><th class="bluerow">Score</th><th class="bluerow"># Favorieten</th></tr>';
        var tableEnd     = '</tbody></table>';
        
        contentDiv.append(paginationStart);
        contentDiv.append(paginationEnd);
        contentDiv.append(tableStart);
        
        var paginationData = $("#pagination");
        var startShowTable = $("#startShowTable");
        var tableData      = $('#tableData');
        
        tableData.append(tableHeaders);
        
        var loadingRows = '<tr id="loadingRows"><td colspan="7" style="text-align: center;"><img src="http://cdn.bierdopje.eu/g/if/facebox/loading.gif" style="vertical-align: middle;" />&nbsp;&nbsp;&nbsp;<span style="vertical-align: middle;">Series laden...</span></td></tr>';
        tableData.append(loadingRows);
        
        $.getJSON(sourceJSON, function(showData) {
            var showCount = Object.keys(showData).length;
            var pages = 1;
            if (showCount > SHOWS_PER_PAGE) {
                pages = Math.ceil(showCount / SHOWS_PER_PAGE);
            }
            console.log("Great! I've found " + showCount + " shows.");
            console.log("Will be putting that on " + pages + " pages. " + SHOWS_PER_PAGE + " on each page.");
            
            var FIRST_LAST_ITEMS = Math.round(PAGINATION_ITEMS / 2);
            
            // First FIRST_LAST_ITEMS pages
            for (var i = 1; i <= FIRST_LAST_ITEMS; i++) {
                if (i <= pages) {
                    addPaginationItem(i);
                } else {
                    break;
                }
            }

            // Middle block
            if (pages > PAGINATION_ITEMS) {
                if ((currentPage - 1) >= PAGINATION_ITEMS) {
                    paginationData.append('<li class="spacer">...</li>');
                }
                for (var i = (currentPage - FIRST_LAST_ITEMS) + 1 ; i < (currentPage + FIRST_LAST_ITEMS); i++) {
                    if (i > FIRST_LAST_ITEMS && i < (pages - FIRST_LAST_ITEMS) + 1) {
                        addPaginationItem(i);
                    }
                }
                
                if ((currentPage) <= (pages - PAGINATION_ITEMS)) {
                    paginationData.append('<li class="spacer">...</li>');
                }
            }

            // Last FIRST_LAST_ITEMS pages
            for (var i = (pages - FIRST_LAST_ITEMS) + 1; i <= pages; i++) {
                if (i >= FIRST_LAST_ITEMS + 1) {
                    addPaginationItem(i);
                }
            }
            
            paginationData.append(paginationEnd);
            paginationData.after(clear);
            
            console.log("Crushing all that show data now. Just for you!");
            
            var startIndex = (currentPage * SHOWS_PER_PAGE) - SHOWS_PER_PAGE;
            var currentURL = "#"; // Bierdopje show url.
            
            for (var i = 0; i < SHOWS_PER_PAGE; i++, startIndex++) {
                var j = startIndex;
                if (typeof showData[j] != "undefined") {
                    var showtvdbId     = showData[j].tvdbId;
                    var showName       = showData[j].name;
                    var showRuntime    = showData[j].runtime;
                    var showSeasons    = showData[j].seasons;
                    var showEpisodes   = showData[j].episodes;
                    var showStatus     = 'Afgelopen'; //showData[j].showstatus;
                    //var showScore      = showData[j].score;
                    //var showFavourites = showData[j].favorites;

                    //var tableRow = '<tr><td><a href="' + currentURL + '">' + showName + '</a></td><td>' + showRuntime + '</td><td>' + showSeasons + '</td><td>' + showEpisodes + '</td><td>' + showStatus + '</td><td>' + showScore + '</td><td>' + showFavourites + '</td></tr>';
                    var tableRow = '<tr><td><a href="' + currentURL + '" class="getShow" data-tvdbid="' + showtvdbId + '">' + showName + '</a></td><td>' + showRuntime + '</td><td>' + showSeasons + '</td><td>' + showEpisodes + '</td><td>' + showStatus + '</td><td>-</td><td>-</td></tr>';
                    tableData.append(tableRow);
                }
            }
            
//            $.each(showData, function (key, show) {
//                var showtvdbId     = show.tvdbId;
//                var showName       = show.name;
//                var showRuntime    = show.runtime;
//                var showSeasons    = show.seasons;
//                var showEpisodes   = show.episodes;
//                var showStatus     = show.showstatus // 'Afgelopen';
                //var showScore      = show.score;
                //var showFavourites = show.favorites;

                //var tableRow = '<tr><td><a href="' + currentURL + '">' + showName + '</a></td><td>' + showRuntime + '</td><td>' + showSeasons + '</td><td>' + showEpisodes + '</td><td>' + showStatus + '</td><td>' + showScore + '</td><td>' + showFavourites + '</td></tr>';
//                var tableRow = '<tr><td><a href="' + currentURL + '">' + showName + '</a></td><td>' + showRuntime + '</td><td>' + showSeasons + '</td><td>' + showEpisodes + '</td><td>' + showStatus + '</td><td>-</td><td>-</td></tr>';
//                tableData.append(tableRow);
//            });
            
            startShowTable.after(paginationData.clone());
        }).done(function() {
            $('#loadingRows').html('');
        }).fail(function() {
            console.log("Could not get shows.");
            var errorRow = '<tr id="error"><td colspan="7" style="text-align: center;"><img src="http://cdn.bierdopje.eu/g/s/sadley.gif" style="vertical-align: middle;" />&nbsp;&nbsp;&nbsp;<span style="vertical-align: middle;">Er is een fout opgetreden.</span></td></tr>';
            $('#loadingRows').replaceWith(errorRow);
        });
        
        tableData.append(tableEnd);
        
        tableData.on('click', '.getShow', function(e) {
            e.preventDefault(); // Prevent going to the top of the page.
            
            var tvdbid = $(this).data('tvdbid');
            var url;
            $.getJSON(BD_API_URL + '/GetShowByTVDBID/' + tvdbid, function(show) {
                url = show.link;
            }).done(function() {
                if (typeof url != "undefined") {
                    console.log("Redirecting to " + url + "...");
                    window.location.href = url;
                } else {
                    console.log("Show does not exist on Bierdopje.com");
                }
            }).fail(function() {
                console.log("Could not get show information.");
            });
        });
    }
    
    function addPaginationItem(i) {
        if (i === currentPage) {
            paginationData.append('<li id="pagination[' + i + ']" class="active">' + i + '</li>');
        } else {
            paginationData.append('<li id="pagination[' + i + ']"><a href="/shows/finished/page/' + i + '">' + i + '</a></li>');
        }
    }
});