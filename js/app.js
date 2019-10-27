var map;
// list of markers created during the initialization
// of the application
var markers = [];
var largeInfowindow;


function ViewModel()
{
    initMap();
    // Constructor creates a new map 
    // connect search input and list of venues using Knockout
    

    this.searchInput = ko.observable("");
    var self = this;

    this.venuesReading = ko.computed(function() {
        var result = [];
        markers.forEach(function(marker) {
            if (marker.title.toLowerCase().includes(
                self.searchInput().toLowerCase())) {
                result.push(marker);
                marker.setVisible(true);
            } else {
                marker.setVisible(false);
            }
        });

        return result;
    }, this);
}

// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function populateInfoWindow() {
    marker = this;
    infowindow = largeInfowindow;

    // set Foursquare content on infowindow
    setFoursquareContent(infowindow);

    //open the infoWindow to the marker selected
    infowindow.marker = marker;
    infowindow.open(map, marker);

    // start the Bounce animation on Marker for a while
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function() {
        self.marker.setAnimation(null);
    }, 1000);
  
    // awaits the close click event to reset the marker and animation
    infowindow.addListener('closeclick',function(){
        infowindow.setMarker = null;
        marker.setAnimation(null);
    });
}

// uses Foursquare API to get informations about the marker selected and fill the infoWindow
function setFoursquareContent(infowindow) {
    clientID = "OIPBBAEXFNTAPARQTOX3C0TRFJA4CVVAX1LAB0XZT0EK0DWZ";
    clientSecret = "UVVUNBIDLUXZVTOAMPNA20PXOOFKSZAVOZTUIOIKY5K1JKF2";

    var url = 'https://api.foursquare.com/v2/venues/search?v=20180125&ll=' +
        marker.position.lat() + ',' + marker.position.lng() + '&client_id=' + clientID +
        '&client_secret=' + clientSecret + '&query=' + marker.title;


    // fetch data from Foursquare
    $.getJSON(url).done(function(marker) {
        response = marker.response.venues[0];

        // get the Foursquare response
        var name = response.name || 'no name found';
        var street = response.location.formattedAddress[0];
        var city = response.location.formattedAddress[1];
        var country = response.location.country || 'no country found';
        var category = response.categories[0].name;
        var visitors = response.hereNow.summary || 'no visitors found';
        var rating = response.rating || 'no rated yet';

        // format content for the info window
        content =
            '<h6>' + name + '</h6><p><i>' + category + '</i></p>' + 
            '<p>' + street + ', ' + city + ', ' + country + '</p>' +
            '<p> Visitors now: "' + visitors + '"</p>' + 
            '<p> Rating: "' + rating + '"</p>';
        infowindow.setContent(content);

    }).fail(function(e) {
        console.log(e.responseText);

        // notify user about errors
        infowindow.setContent('<h6>Something went wrong on Foursquare Loading. Take a cup of tea and try again =]</h6>');
    });
}

// create a venue
var Venue = function(venue) {
    this.title = venue.title;
    this.type = venue.type;

    var point = new google.maps.LatLng(venue.lat, venue.long);
    var marker = new google.maps.Marker({
        position: point,
        title: venue.title,
        map: map,
        animation: google.maps.Animation.DROP
    });

    this.marker = marker;

    this.setVisible = function(v) {
        this.marker.setVisible(v);
    };

    this.marker.addListener('click', populateInfoWindow);

    // trigger click event to show info window
    this.showInfo = function() {
        google.maps.event.trigger(this.marker, 'click');
    };

};

// create map and initialize it with markers
function initMap() {
    // Place the Map at Reading's city - located at UK
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 51.454265, lng: -0.97813},
        zoom: 13
    });

    // uses my map style
    map.setOptions({styles: myStyle});

    // create the infowindow Google object
    largeInfowindow = new google.maps.InfoWindow();

    // add markers from venues.js file
    for (var i = 0; i < venuesReading.length; i++) {
        markers.push(new Venue(venuesReading[i]));
       
    }
     // Extend the boundaries of the map for each marker
  
}

// show a message in case of error of Foursquare process
function mapLoadError() {
    $('#map').html('Something went wrong on Google Maps Loading. Take a cup of tea and try again =]');
}


// main function - initialize view model
function initApp() {
    ko.applyBindings(new ViewModel());
}

