// var inputTextBox = $('.input');
var searchParkButtonEl = $("#searchParkButton");
var parkCodeList = [];
var parkNameList = [];
var apiKey = 'TNFSbiKup0DvQBzqjbD6tCiZTq4j6SBhWGF4hCOQ';
var parkCode;
var parkLatitude;
var parkLongitude;
// Place holder for input text until we get that functionally working
var inputText = "Abraham Lincoln Birthplace National Historical Park";

// This function will take the input the user types into the search box, find the spot in the parkNamees array that matches the input and return the corresponding park code from the 
// parkCodes array
function findParkCode() {
  // Create variable that has park code pulled from array based on selection from dropdown
  for (i = 0; i < parkNameList.length; i++) {
    if (inputText == parkNameList[i]) {
      parkCode = parkCodeList[i];
      // console.log(parkCode);
      break
    }
  }
}

// This function will be executed upon clicking the search button
// This function will pull the necessary park data to then be displayed under the Park Info tab
function pullParkData() {
  var parkPullURL = `https://developer.nps.gov/api/v1/parks?parkCode=${parkCode}&api_key=${apiKey}`;
  $.ajax({
    url: parkPullURL,
    method: 'GET',
  }).then(function (response) {
    console.log(response);
    // Set entryFee variable to cost of entry if > 0, to text "Free Fee Park" if there is no entry fee
    var parkEntryFee;
    if (response.data[0].entranceFees[0].cost == 0) {
      parkEntryFee = response.data[0].entranceFees[0].title;
      // console.log(parkEntryFee);
    } else {
      parkEntryFee = response.data[0].entranceFees[0].cost;
      // console.log(parkEntryFee);
    }
    var parkHomepageLink =  response.data[0].url;
    var parkImageLink =  response.data[0].images[0].url;
    // Storing latitude and longitude of park to be used in nearby hikes API
    parkLatitude = response.data[0].latitude;
    parkLongitude = response.data[0].longitude;


  })
}

// Function pulls data from NPS API and stores park names and codes to be used later
function getParkNamesCodes() {
  var allParksURL = `https://developer.nps.gov/api/v1/parks?limit=500&api_key=${apiKey}`;
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
  // console.log(parkNameList);
  // console.log(parkCodeList);
}

getParkNamesCodes();

function runParkSearch() {
  findParkCode();
  pullParkData();
}

searchParkButtonEl.on("click", runParkSearch)