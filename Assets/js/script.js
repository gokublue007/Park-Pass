var inputTextBox = $(".input");
var inputDiv = $('.input-div')
var searchParkButtonEl = $("#searchParkButton");
var clearSavedParksButtonEl = $("#clearSavedParksButton");
var parkCodeList = [];
var parkNameList = [];
var NPSApiKey = "TNFSbiKup0DvQBzqjbD6tCiZTq4j6SBhWGF4hCOQ";
var googleApiKey = "AIzaSyA_Szh6txcLm9SOSbuZV-CyqKVbqljMkTM";
var weatherApiKey = "1bb5db5b652ed01ed43e82a79df4ebd1";
var hikingContent = $("#hiking-content");
var parkInfoContent = $("#park-info-content");
var weatherContent = $("#weather-content");
var savedSearchButtonEl = $(".savedSearch");
var parkLatitude;
var parkLongitude;
var parkCode;
var chosenPark;
var parkEntryFee;
var parkImageLink;
var parkHomepageLink;
var map;
var service;
var infowindow;

// Clears previous search results when new search is made
function clearPage() {
  hikingContent.empty();
  parkInfoContent.empty();
  weatherContent.empty();
}

// This function will take the input the user types into the search box, find the spot in the parkNamees array that matches the input and return the corresponding park code from the
// parkCodes array
function findParkCode(chosenPark) {
  // Create variable that has park code pulled from array based on selection from dropdown
  for (i = 0; i < parkNameList.length; i++) {
    if (chosenPark == parkNameList[i]) {
      parkCode = parkCodeList[i];
      break;
    }
  }
}
//gets list of saved park names from local storage
function getSavedParks() {
  var storedSavedParkNames = localStorage.getItem("savedParkNames");
  var savedParkNames = [];
  if (storedSavedParkNames) {
    savedParkNames = JSON.parse(storedSavedParkNames);
  }
  return savedParkNames;
}
//saves park name to local storage if it doesn't already exists
function saveParkName(parkName) {
  var savedParkNames = getSavedParks();
  var alreadySaved = savedParkNames.includes(parkName);
  if (!alreadySaved) {
    savedParkNames = savedParkNames.concat(parkName);
    localStorage.setItem("savedParkNames", JSON.stringify(savedParkNames));
  }
}
//adds parks to saved content
function populateSavedContent() {
  var savedParkNames = getSavedParks();
  if (savedParkNames.length !== 0) {
    $("#savedParks").empty();
    savedParkNames.forEach(function (parkName) {
      var parkBtn = $("<button>");
      parkBtn.text(parkName);
      parkBtn.attr("id", parkName);
      parkBtn.addClass("button is-fullwidth m-1");
      parkBtn.addClass("wrapButtonText");
      parkBtn.addClass("savedSearch");
      $("#savedParks").append(parkBtn);
    });
  }
  $(".savedSearch").on("click", savedParkSearch);
}

//Clears saved parks from local storage
function clearSavedParks() {
  $("#savedParks").empty();
  localStorage.setItem("savedParkNames", JSON.stringify([]));
  var noParks = $("<p>");
  noParks.text("You have no saved parks.");
  $("#savedParks").append(noParks);
}

// Populate saved park names from local storage on page load
populateSavedContent();

function displayWeatherData(data) {
  var currentCity = data.name;
  var currentDate = moment().format("(MM/DD/YYYY)");
  var currentIcon = data.weather[0].icon;
  var currentTemp = data.main.temp;
  var currentWind = data.wind.speed;
  var currentHumidity = data.main.humidity;

  var weatherSection = $("<section>");
  var weatherHeader = $("<h2>");
  var weatherImage = $("<img>");
  var weatherTempEl = $("<p>");
  var weatherWindEl = $("<p>");
  var weatherHumidityEl = $("<p>");
  var weatherDateEl = $("<p>");

  weatherSection.attr("class", "weatherCard");

  weatherHeader.text(currentCity);
  weatherDateEl.text(currentDate);
  weatherImage.attr(
    "src",
    `http://openweathermap.org/img/wn/${currentIcon}@2x.png`
  );
  weatherTempEl.text("Temp: " + currentTemp + String.fromCharCode(176) + "F");
  weatherWindEl.text("Wind: " + currentWind + " MPH");
  weatherHumidityEl.text("Humidity: " + currentHumidity + "%");
  weatherDateEl.attr("class", "backGround");
  weatherSection.append(weatherHeader);
  weatherSection.append(weatherDateEl);
  weatherSection.append(weatherImage);
  weatherSection.append(weatherTempEl);
  weatherSection.append(weatherWindEl);
  weatherSection.append(weatherHumidityEl);
  weatherContent.append(weatherSection);
}

function pullWeatherData(city) {
  var currentWeatherApi = `https://api.openweathermap.org/data/2.5/weather?zip=${city}&appid=${weatherApiKey}&units=imperial`;
  fetch(currentWeatherApi)
    .then(function (response) {
      return response.json();
    })
    .then(function (weatherData) {
      displayWeatherData(weatherData);
    });
}

// This function will be executed upon clicking the search button
// This function will pull the necessary park data to then be displayed under the Park Info tab
function pullParkData() {
  var parkPullURL = `https://developer.nps.gov/api/v1/parks?parkCode=${parkCode}&api_key=${NPSApiKey}`;
  $.ajax({
    url: parkPullURL,
    method: "GET",
  }).then(function (response) {
    console.log(response);
    // Set entryFee variable to cost of entry if > 0, to text "Free Fee Park" if there is no entry fee
    if (response.data[0].entranceFees[0].cost == 0) {
      parkEntryFee = "Entrance to this park is free!";
    } else {
      parkEntryFee = "$" + response.data[0].entranceFees[0].cost;
    }
    parkHomepageLink = response.data[0].url;
    parkImageLink = response.data[0].images[0].url;
    // Storing latitude and longitude of park to be used in nearby hikes API
    parkLatitude = response.data[0].latitude;
    parkLongitude = response.data[0].longitude;

    // Add image to page display
    var iconElement = $("<img>");
    iconElement.attr("src", parkImageLink);
    iconElement.attr("class", "imgOne");
    parkInfoContent.append(iconElement);

    // add national park name to display
    var nameElement = $("<h2>");
    nameElement.text(chosenPark);
    parkInfoContent.append(nameElement);

    // add national park homepage link to display
    var linkElement = $("<a>");
    linkElement.attr("href", parkHomepageLink).attr("target", "_blank");
    linkElement.html(parkHomepageLink);
    parkInfoContent.append(linkElement);

    // add national park fee to display
    var feeDisplayElement = $("<p>");
    feeDisplayElement.html("Entrance Fee: " + parkEntryFee);
    parkInfoContent.append(feeDisplayElement);

    // add State park is located
    var stateElement = $("<p>");
    stateElement.text("State: " + response.data[0].states);
    parkInfoContent.append(stateElement);

    var parkFullName = response.data[0].fullName;
    saveParkName(parkFullName);
    populateSavedContent();
    hikingTrails(parkLatitude, parkLongitude);

    parkCity = response.data[0].addresses[0].postalCode;
    pullWeatherData(parkCity);
  });
}
// Function pulls data from NPS API and stores park names and codes to be used later
function getParkNamesCodes() {
  var allParksURL = `https://developer.nps.gov/api/v1/parks?limit=500&api_key=${NPSApiKey}`;
  $.ajax({
    url: allParksURL,
    method: "GET",
  }).then(function (response) {
    for (i = 0; i < response.data.length; i++) {
      parkCodeList.push(response.data[i].parkCode);
      parkNameList.push(response.data[i].fullName);
    }
  });
}

// Function pulls data from google maps api
function hikingTrails(lat, lng) {
  var parkLat = lat;
  var parkLng = lng;
  var mapEl = $("<div>");
  mapEl.attr("id", "map").attr("class", "mx-auto");
  hikingContent.append(mapEl);
  loadMap(parkLat, parkLng);
}

// Displays google map centered National Park
function loadMap(latInt, lngInt) {
  var park = new google.maps.LatLng(latInt, lngInt);

  infowindow = new google.maps.InfoWindow();
  map = new google.maps.Map(document.getElementById("map"), {
    center: park,
    zoom: 10,
    disableDefaultUI: true,
    fullscreenControl: true,
    streetViewControl: true,
    zoomControl: true,
    mapTypeId: "terrain",
  });

  var request = {
    location: park,
    radius: "500",
    query: "hiking trail",
    fields: ["name", "formatted_address", "place_id"],
  };

  service = new google.maps.places.PlacesService(map);
  service.textSearch(request, callback);
}

function callback(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      createMarker(results[i]);
    }
  }
}

// This functions creates markers on trail location
function createMarker(place) {
  if (!place.geometry || !place.geometry.location) return;

  const marker = new google.maps.Marker({
    map,
    position: place.geometry.location,
  });

  // Event listener to display trail name
  google.maps.event.addListener(marker, "click", () => {
    map.setCenter(place.geometry.location);

    const content = document.createElement("div");
    const nameEl = document.createElement("h4");

    nameEl.textContent = place.name;
    content.appendChild(nameEl);

    const trailLink = document.createElement("a");
    trailLink.setAttribute(
      "href",
      "https://www.google.com/maps/search/?api=1&query=" + place.name + "&query_place_id=" + place.place_id
    );
    trailLink.setAttribute("target", "_blank");
    trailLink.setAttribute("jstcache", "6");
    trailLink.setAttribute("tabindex", "0");
    content.appendChild(trailLink);

    const viewTrail = document.createElement("span");
    viewTrail.textContent = "View trail on Google Maps";
    trailLink.appendChild(viewTrail);

    infowindow.setContent(content);

    infowindow.open(map, marker);
  });
}

getParkNamesCodes();

function runParkSearch(event) {
  event.preventDefault();
  clearPage();
  chosenPark = inputTextBox.val();
  findParkCode(chosenPark);
  pullParkData();
  inputTextBox.val('');
}

function savedParkSearch(event) {
  event.preventDefault();
  clearPage();
  chosenPark = event.target.innerText;
  findParkCode(chosenPark);
  pullParkData();
}

$(function () {
  $("#tags").autocomplete({
    source: parkNameList,
  });
  $("#tags").autocomplete("widget").addClass("auto-complete-scroll");
});

// Allows for tab function to display each tabs content
var tabs = document.querySelectorAll(".tabs li");
var tabContent = document.querySelectorAll("#tab-content > div");

// Gives/removes class "is-active" when tab is click
tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((item) => item.classList.remove("is-active"));
    tab.classList.add("is-active");

    // Hides/displays tab content when click
    const target = tab.dataset.target;
    tabContent.forEach((box) => {
      if (box.getAttribute("id") === target) {
        box.classList.remove("is-hidden");
      } else {
        box.classList.add("is-hidden");
      }
    });
  });
});

clearSavedParksButtonEl.on("click", clearSavedParks);
searchParkButtonEl.on("click", runParkSearch);
inputDiv.on("submit", runParkSearch);