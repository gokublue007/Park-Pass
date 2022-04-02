var inputTextBox = $('.input');
var searchParkButtonEl = $("#searchParkButton");
var parkCodeList = [];
var parkNameList = [];
var NPSApiKey = 'TNFSbiKup0DvQBzqjbD6tCiZTq4j6SBhWGF4hCOQ';
var googleApiKey = 'AIzaSyA_Szh6txcLm9SOSbuZV-CyqKVbqljMkTM'
var inputText = "rocky mountain national park";
var hikingContent = $('#hiking-content');
var parkInfoContent = $('#park-info-content');
var parkLatitude;
var parkLongitude;
var parkCode;
var chosenPark; ``
var parkEntryFee;
var parkImageLink;
var parkHomepageLink;


// Place holder for input text until we get that functionally working
// var inputText = "Abraham Lincoln Birthplace National Historical Park";

// This function will take the input the user types into the search box, find the spot in the parkNamees array that matches the input and return the corresponding park code from the 
// parkCodes array
function findParkCode(chosenPark) {
  // Create variable that has park code pulled from array based on selection from dropdown
  for (i = 0; i < parkNameList.length; i++) {
    if (chosenPark == parkNameList[i]) {
      parkCode = parkCodeList[i];
      // console.log(parkCode);
      break
    }
  }
}

// This function will be executed upon clicking the search button
// This function will pull the necessary park data to then be displayed under the Park Info tab
function pullParkData() {
  var parkPullURL = `https://developer.nps.gov/api/v1/parks?parkCode=${parkCode}&api_key=${NPSApiKey}`;
  $.ajax({
    url: parkPullURL,
    method: 'GET',
  }).then(function (response) {
    console.log(response);
    // Set entryFee variable to cost of entry if > 0, to text "Free Fee Park" if there is no entry fee
    if (response.data[0].entranceFees[0].cost == 0) {
      parkEntryFee = response.data[0].entranceFees[0].title;
      // console.log(parkEntryFee);
    } else {
      parkEntryFee = response.data[0].entranceFees[0].cost;
      // console.log(parkEntryFee);
    }
    parkHomepageLink = response.data[0].url;
    parkImageLink = response.data[0].images[0].url;
    // Storing latitude and longitude of park to be used in nearby hikes API
    parkLatitude = response.data[0].latitude;
    parkLongitude = response.data[0].longitude;
    // Add image to page display
    var iconElement = $("<img>");
    iconElement.attr("src", parkImageLink);
    parkInfoContent.append(iconElement);

  })
}

// Function pulls data from NPS API and stores park names and codes to be used later
function getParkNamesCodes() {
  var allParksURL = `https://developer.nps.gov/api/v1/parks?limit=500&api_key=${NPSApiKey}`;
  $.ajax({
    url: allParksURL,
    method: 'GET',
  }).then(function (response) {
    // console.log(response);
    for (i = 0; i < response.data.length; i++) {
      parkCodeList.push(response.data[i].parkCode);
      parkNameList.push(response.data[i].fullName);
    }
  })
  console.log(parkNameList);
  // console.log(parkCodeList);
}

function hikingTrails() {
  fetch(`https://mighty-headland-78923.herokuapp.com/https://maps.googleapis.com/maps/api/place/textsearch/json?query=hiking+trails+${inputText}&key=${googleApiKey}`, {
    method: 'GET',
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (trailData) {
      console.log(trailData)
    });
}

hikingTrails();

getParkNamesCodes();

function runParkSearch(event) {
  event.preventDefault();
  chosenPark = inputTextBox.val();
  findParkCode(chosenPark);
  pullParkData();
}

searchParkButtonEl.on("click", runParkSearch)