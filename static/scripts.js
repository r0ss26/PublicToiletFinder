// Google Map
let map;

// InfoWindow
let infoWindow = new google.maps.InfoWindow();

// Execute when the DOM is fully loaded
$(document).ready(function() {

    // Options for map
    // https://developers.google.com/maps/documentation/javascript/reference#MapOptions
    let options = {
        center: {lat: -35.2808, lng: 149.1298}, // Canberra, Australia
        disableDefaultUI: true,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        maxZoom: 20,
        panControl: true,
        zoom: 15,
        zoomControl: true
    };

    // Get DOM node in which map will be instantiated
    let canvas = $("#map-canvas").get(0);

    // Instantiate map
    map = new google.maps.Map(canvas, options);

    // Configure UI once Google Map is idle (i.e., loaded)
    google.maps.event.addListenerOnce(map, "idle", configure);

    // Load geographic data from ACT government Open Data Portal
    map.data.loadGeoJson('https://www.data.act.gov.au/resource/s5ui-t9rd.geojson')

    // Code for InfoWindow modified from https://gist.github.com/geog4046instructor/fc472ec499502f3e9a76
    // Add a listener for clicks on a marker
    map.data.addListener('click', function(event) {
    // in the geojson feature that was clicked, get the "suburb", "location_description" and "toilet_type" attributes
    let suburb = event.feature.getProperty("division_name");
    let location_description = event.feature.getProperty("location_description");
    let toilet_type = event.feature.getProperty("toilet_type_text");
    let html = 'Suburb: ' + suburb + '<br>' + 'Location Description: ' + location_description + '<br>' + 'Toilet type: ' + toilet_type;
    infoWindow.setContent(html); // show the html variable in the infowindow
    infoWindow.setPosition(event.feature.getGeometry().get()); // anchor the infowindow at the marker
    infoWindow.setOptions({pixelOffset: new google.maps.Size(0,-30)}); // move the infowindow up slightly to the top of the marker icon
    infoWindow.open(map);
    });

    // Center map on clients location if geolocation available
    if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
        initialLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        map.setCenter(initialLocation);
        });
    }

});


// Configure application
function configure()
{

    // Configure typeahead
    $("#q").typeahead({
        highlight: false,
        minLength: 1
    },
    {
        display: function(suggestion) { return null; },
        limit: 10,
        source: search,
        templates: {
            suggestion: Handlebars.compile(
                "<div>" +
                "{{suburb}}" +
                ", " +
                "{{postcode}}" +
                "</div>"
            )
        }
    });

    // Re-center map after place is selected from drop-down
    $("#q").on("typeahead:selected", function(eventObject, suggestion, name) {

        // Set map's center
        map.setCenter({lat: parseFloat(suggestion.latitude), lng: parseFloat(suggestion.longitude)});

        // Update UI
        update();
    });

    // Hide info window when text box has focus
    $("#q").focus(function(eventData) {
        infoWindow.close();
    });

    // Re-enable ctrl- and right-clicking (and thus Inspect Element) on Google Map
    // https://chrome.google.com/webstore/detail/allow-right-click/hompjdfbfmmmgflfjdlnkohcplmboaeo?hl=en
    document.addEventListener("contextmenu", function(event) {
        event.returnValue = true;
        event.stopPropagation && event.stopPropagation();
        event.cancelBubble && event.cancelBubble();
    }, true);

    // Give focus to text box
    $("#q").focus();
}


// Search database for typeahead's suggestions
function search(query, syncResults, asyncResults)
{
    // Get places matching query (asynchronously)
    let parameters = {
        q: query
    };
    $.getJSON("/search", parameters, function(data, textStatus, jqXHR) {

        // Call typeahead's callback with search results (i.e., places)
        asyncResults(data);
    });
}