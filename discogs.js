/*============================
Javascript for Minimal Discogs
Devin Smith - http://devinsmith.work

April - May 2020
============================*/


//-------------------------
// Global vars
var masterData = [];
var currentIndex = 0;
var currentInfoNavState = 0;


//================================
// Testing functions (disabled). For use w/ downloaded JSON from Discogs
//================================
$(document).ready(function() {
    // getDiscogsData();
    // processDiscogsJSON(demoData);
});




//================================
// Search functions and Discogs API calls
//================================

//-------------------------
// Gets the HTML input values and builds the URL for the Discogs API call
function executeSearch(includeYear) {
    let sStyle = $('#searchStyle').val();
    let sYear = $('#searchYear').val();
    let sPageQ = $('#searchPageQ').val();

    let discogsSearch = "https://api.discogs.com/database/search?";

    // [GITHUB] Fill these in with your Discogs.com Key and Secret
    let key = "";
    let secret = "";

    let discogsFullURL = "";
    if (includeYear) {
        discogsFullURL = discogsSearch + 
        "style=" + sStyle.split(" ").join("+") + "&" +
        "year=" + sYear + "&" +
        "type=" + "release" + "&" +
        "page=1&per_page=" + sPageQ + "&" +
        "key=" + key + "&" +
        "secret=" + secret;
    } else {
        discogsFullURL = discogsSearch + 
        "style=" + sStyle.split(" ").join("+") + "&" +
        "type=" + "relase" + "&" +
        "page=1&per_page=" + sPageQ + "&" +
        "key=" + key + "&" +
        "secret=" + secret;
    }

    // Clear previous master data and images
    masterData = [];
    $("#imageGrid").empty();

    // Passes the URL to the API call function
    getDiscogsData(discogsFullURL);
}


//-------------------------
// Calls the API and passes the JSON data for processing
function getDiscogsData(url) {
    $.getJSON(url,  // url
        function (data, textStatus, jqXHR) {  // success callback
          // console.log(data);
          processDiscogsJSON(data);
        });
}


//--------------------------------
// Processing the Discogs JSON
// - Add new items to the masterData array
// - Fill the image grid w/ thumbnails
// - Add the "more" button if >1 page
function processDiscogsJSON(data) {

    // If the search came back empty, add the "no results" stuff.
    if (data.results.length == 0) {
        addNoResultsElements();
    } else {
        // Offset: pick up numbering from the end of the last data.
        let offset = masterData.length;

        // If we're adding data on the same search (ie: pagination), then concat the new data to masterData.
        if (masterData.length == 0) {
            masterData = (data.results);
        } else {
            masterData = masterData.concat(data.results);
            $('#moreBtn').remove();
        }
        
        // Iterate over data and load images
        for (var i=0;i<data.results.length;i++) {

            // make thumb image
            let myImg = $('<img />', {
               class: 'thumb',
               src: data.results[i].thumb,
               onload:"$(this).css('visibility', 'visible');$(this).css('opacity', '1');"
            });

            if (data.results[i].thumb == "") {
                myImg.attr('src','no-cover-circle.png');
            }

            if (i == data.results.length-1) {
            	myImg.attr('onload', "$(this).css('visibility', 'visible');$(this).css('opacity', '1');$('#moreBtn').fadeToggle(500);");
            }

            // make thumb link
            let myLink = $('<a>',{
                id: (i + offset),
                href: '#',
                click: function() {updateInfoDiv(this.id);return false;},
            });

            // wrap 'em and add to grid 
            myImg.wrap(myLink);
            $('#imageGrid').append(myImg.parent());
        }

        //add "More" button if needed
        if (data.pagination.page < data.pagination.pages) {
            let nextPageURL = data.pagination.urls.next;
            let moreBtn = $('<button>', {
                id: 'moreBtn',
                text: '+',
                click: function () { getDiscogsData(nextPageURL);return false; }
            });
            $('#imageGrid').append(moreBtn);
        }
    }
}


//--------------------------------
// If the Discogs API search comes back empty, add this stuff
function addNoResultsElements() {            
    let noResults = $('<p>', {
        text: "ZERO RESULTS FOUND",
        class: 'noResults'
    });

    // Add the link for no-year search
    let noYearSearch = $('<a>',{
            text: 'CLICK TO SEARCH W/O YEAR',
            href: '#',
            click: function() {executeSearch(false);return false;}
     });

    noResults.append('<br><br>');
    noResults.append(noYearSearch);
    $('#imageGrid').append(noResults);
}


//--------------------------------
// Called from the Year +/- buttons
function changeYear(x) {
    let newYear = $('#searchYear').val();
    if (x) {
        newYear++;
    } else {
        newYear--;
    }
    $('#searchYear').val(newYear);
    executeSearch(true);
}


//------------------------
// Selects a random style
function randomStyle() {
    let options = $("#searchStyle > option")
    options[Math.floor(Math.random() * options.length)].selected = true
}




//================================
// Individual release window stuff
//================================

//-------------------------
// Global var for searches
var searchSitesObj = [
    {
        "name": "YouTube",
        "baseURL" : "https://www.youtube.com/results?search_query="
    },
    {
        "name": "Spotify",
        "baseURL" : "https://open.spotify.com/search/"
    },
    {
        "name": "DuckDuckGo",
        "baseURL" : "https://duckduckgo.com/?q=",
        "postURL" : "&k1=-1&kae=d"
    },
    {
        "name": "SFPL",
        "baseURL" : "https://sfpl.org/search-page?keys=",
        "postURL" : "&type=all"
    },
    {
        "name": "Bandcamp",
        "baseURL" : "https://bandcamp.com/search?q="
    },
    {
        "name": "Soundcloud",
        "baseURL" : "https://soundcloud.com/search?q="
    },
    {
        "name": "Google",
        "baseURL" : "https://www.google.com/search?q="
    }
];

//----------------------------
// Update release info w/ values from Discogs JSON
function updateInfoDiv(x) {
    // Gets the info from the specified index (passed via the thumbnail image's ID)
    cRelease = masterData[x];
    currentIndex = x;
    
    checkInfoNavState();
    $('#infoDiv').empty();

    // Album cover
    if (cRelease.cover_image.indexOf("spacer.gif") == -1) {
        let coverDiv, coverLink, cover;

        coverDiv = $('<div>',{
            id:"coverDiv"
        });
    
        coverLink = $('<a>',{
                href: cRelease.cover_image,
                target: "_blank"
        });

        cover = $('<img />', {
            class: "cover",
            src: cRelease.cover_image
            // width: 350
        });

        coverLink.append(cover);
        //$('#infoDiv').append(coverLink);

        coverDiv.append(coverLink);
        $('#infoDiv').append(coverDiv);


    } else {
        // No album art
        $('#infoDiv').append('<br><br><br>');
    }

    // Album info
    let textDiv = $("<div>", {
    	id:"textDiv"
    });

    let title = $('<h2>');
    let titleLink = $('<a>',{
            text: cRelease.title,
            href: ("https://discogs.com" + cRelease.uri),
            target: "_blank"
    });
    title.append(titleLink);
    textDiv.append(title);

    // See next function for details
    let topInfo = $('<p>', {
    	id: "topInfo"
    });
    if (cRelease.year != "") topInfo.append(cRelease.year);
    if (cRelease.country != "") topInfo.append(", " + cRelease.country);
    textDiv.append(topInfo);

    // More info link
    let moreLink = $('<a>', {
    	text: "More Info...",
    	id:"moreInfoLink",
    	href:"#",
    	click: function() {$(".moreInfoList").fadeToggle();return(false);}
    });
    textDiv.append(moreLink);

    // Makes the "more info" ul
	let info = makeInfoText(cRelease);
    textDiv.append(info);

    // makes the web search ul
	let webSearch = makeWebSearchDiv(cRelease);
    textDiv.append(webSearch);

    $('#infoDiv').append(textDiv);

    if ($('#releaseContainer').is(":visible") == false) {
        $('#releaseContainer').fadeToggle(80);
    }

}


//---------------------------------
// Array of keys and titles for Discogs value

var discogsInfoObj = [
    {
        "id": "genre",
        "title" : "Genre",
    },
    {
        "id": "style",
        "title" : "Style",
    },
	{
        "id": "label",
        "title" : "Label",
    },
    {
        "id": "format",
        "title" : "Format",
    },
    {
        "id": "catno",
        "title" : "Cat No."
    },
    {
        "id": "barcode",
        "title" : "Barcode",
    },
    {
        "id": "id",
        "title" : "Discogs ID",
    }
];


//---------------------------------
// Gets the details for the release, hidden by default
function makeInfoText(x) {
    let pInfoUL = $('<ul>', {
    	class: "moreInfoList"
    });

    for (var i=0;i<discogsInfoObj.length;i++) {
    	let cDIO = discogsInfoObj[i];
    	if (x[cDIO.id] != "") {
    		// If the value is an array
    		if (Array.isArray(x[cDIO.id])) {
    			let liText = "";
    			for (var j=0;j<x[cDIO.id].length;j++) {
    				liText += x[cDIO.id][j];
    				if (j<x[cDIO.id].length-1) {
    					liText += ", ";
    				}
    			}
        		let li = $("<li>", {
        			text: cDIO.title + " : " + liText
        		});
    			pInfoUL.append(li);

    		} else {
    			// single value
        		let li = $("<li>", {
        			text: cDIO.title + " : " + x[cDIO.id]
        		});
    			pInfoUL.append(li);
    		}
    	}
    }

    return(pInfoUL);
}


//--------------------------
// Returns the search list
function makeWebSearchDiv(x) {
	let webSearchDiv = $("<div>", {
		class: "webSearchDiv"
	});

    webSearchDiv.append("<h4>WEB SEARCH:</h4>");

    let searchUL = $("<ul>", {
    	class: "searchUL"
    });

    for (var i=0;i<searchSitesObj.length;i++) {
    	let searchLI = $("<li>");
        let sLink = makeSearchLinks(x.title, searchSitesObj[i]);
        
        searchLI.append(sLink);
        searchUL.append(searchLI);
    }

    webSearchDiv.append(searchUL);

    return(webSearchDiv);
}


//--------------------------
// Returns search link objects
function makeSearchLinks(title, siteObj) {

    let searchURL = siteObj.baseURL;
    searchURL += titleCleanup(title, siteObj.name);
    if (siteObj.postURL != undefined) {
        searchURL += siteObj.postURL;
    }
    let searchLink = $('<a>',{
            text: siteObj.name,
            href: searchURL,
            target: "_blank"
        });

    return(searchLink);
}


//--------------------------
// Title string cleanup w/ regex
function titleCleanup(title,site) {
    let s = title;
    s = s.replace(/ *\([^)]*\)*/g, "");

    switch(site) {
        case("Spotify"):
        case("Bandcamp"):
        case("Soundcloud"):
        case("SFPL"):
        s = s.split(" - ").join(' ');
        break;
        case("YouTube"):
        case("DuckDuckGo"):
        case("Google"):
        s = s.split(" - ").join(' ').split(" ").join('+');
        break;
        case("Hoopla"):
        s = s.split(" - ")[1].split(" ").join('+');
        break;
    }

    return(s)
}


//-----------------------------
// Release window: checks state and hides/shows buttons as needed
function checkInfoNavState() {
    let newInfoNavState = 0; 
    if (parseInt(currentIndex) == 0) {
        newInfoNavState = 0; // First release
    } else if (parseInt(currentIndex) == masterData.length-1) {
        if ($('#moreBtn').is(":visible")) {
            newInfoNavState = 2; // Last release with more available
        } else {
            newInfoNavState = 3; // Last release, no more.
        }
    } else {
        newInfoNavState = 1; // Normal: both arrows, no load.
    }

    if (currentInfoNavState != newInfoNavState) {
        currentInfoNavState = newInfoNavState;
        switch(currentInfoNavState) {
            case(0):
                $('#prevRelease').css("display", "none");
                $('#nextRelease').css("display", "block");
                $('#nextLoad').css("display", "none");
            break;

            case(1):
                $('#prevRelease').css("display", "block");
                $('#nextRelease').css("display", "block");
                $('#nextLoad').css("display", "none");
            break;

            case(2):
                $('#prevRelease').css("display", "block");
                $('#nextRelease').css("display", "none");
                $('#nextLoad').css("display", "block");
            break;

            case(3):
                $('#prevRelease').css("display", "block");
                $('#nextRelease').css("display", "none");
                $('#nextLoad').css("display", "none");
            break;
        }
    }
}


//----------------------------
// Release window: called from next/prev buttons
function loadNextRelease(x) {
    if (x) {
        if (currentIndex < masterData.length-1) {
            currentIndex++;
            updateInfoDiv(currentIndex);
            $('#nextRelease').blur();
        }
    } else {
        currentIndex--;
        updateInfoDiv(currentIndex);
        $('#prevRelease').blur();
    }
}


//----------------------------
//Release window: Called from the + button
function loadNextReleasePage() {
    $("#moreBtn").trigger("click");
}





//===============================
// 4. UI
//===============================
// KEY COMMANDS
window.onkeyup = function (event) {
    // console.log(event.keyCode);

    switch(event.keyCode) {

        // Escape
        case(27):
            if ($('#releaseContainer').is(":visible")) {
                $('#releaseContainer').fadeToggle(80);
            } else if ($('#aboutDiv').is(":visible")) {
                $('#aboutDiv').fadeToggle(80);
            }
        break;

        // X execute search
        case(88):
            if (($('#releaseContainer').is(":visible") == false)
                && ($('#aboutDiv').is(":visible") == false)) {
                $('#searchBtn').focus();
                $('#searchBtn').trigger("click");
            }
        break;

        // plus key, year increment.
        case(107):
        case(187):
        case(61):
            if ($('#releaseContainer').is(":visible") == false) {
                $("#yearInc").trigger("click");
            }
        break;

        // minus key, year decrement
        case(109):
        case(189):
        case(173):
            if ($('#releaseContainer').is(":visible") == false) {
                $("#yearDec").trigger("click");
            }
        break;

        // R arrow
        case(39):
            if ($('#releaseContainer').is(":visible")) {
                if ((currentInfoNavState == 0)
                    || (currentInfoNavState == 1)) {
                    $("#nextRelease").trigger("click");
                }
            } else {
                if (masterData.length > 0) {
                    console.log(currentIndex);
                    updateInfoDiv(currentIndex);
                }
            }
        break;

        // L arrow
        case(37):
            if ($('#releaseContainer').is(":visible")) {
                if ((currentInfoNavState == 1)
                    || (currentInfoNavState == 2)) {
                    $("#prevRelease").trigger("click");
                }
            }
        break;

        // M for More!
        case(77):
            if ($('#moreBtn').is(":visible")) {
                $("#moreBtn").trigger("click");
            }
        break;


        // Return executes search when certain fields are focused
        case(13):
        let actID = document.activeElement.id;
            if (actID == "searchYear" || actID == "searchPageQ" || actID == "searchStyle") {
                $('#searchBtn').trigger("click");
            }
        break;

    }
}