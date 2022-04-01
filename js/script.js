console.log("Park Dev Rangers");
var parkCodes = [];
var parkNames = [];
var apiKey = 'TNFSbiKup0DvQBzqjbD6tCiZTq4j6SBhWGF4hCOQ';

// Pulls park names and codes to populate drop down and reference in future API pulls
function getParkCodes() {
  var parkPullURL = `https://developer.nps.gov/api/v1/parks?limit=500&api_key=${apiKey}`;

  $.ajax({
    url: parkPullURL,
    method: 'GET',
  }).then(function (response) {
    for (i=0; i<response.data.length; i++) {
      parkCodes.push(response.data[i].parkCode);
      parkNames.push(response.data[i].fullName);
    }
  })
}

getParkCodes();