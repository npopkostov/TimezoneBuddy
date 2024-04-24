// Default variables:
const mainDiv = document.getElementById("main-div");
const defaultDiv = document.getElementById("default-div");
const resetBtn = document.getElementById("header-button");
const addNewSearchBtn = document.getElementById("header-button-add");

// Checkpoints and markers
var i = 0;
var id = 0;
var isEditMode = false;
var isEnteredValue = true;

// Load timezones API:
async function getTimeZone() {
  const apiKey = `PA82PEZZOIPM`;
  const apiUrl = `http://api.timezonedb.com/v2.1/list-time-zone?key=${apiKey}&format=json`;
  const res = await fetch(apiUrl);
  let data = await res.json();
  window.myGlobalArray = data;
  return data;
}
getTimeZone();
// Search API Array for Current Location
async function myLocationTime(latitude, longitude) {
  const res = await getTimeZone();
  const localCity = new LocationMethods(latitude, longitude);
  localCity.getLocationFromCoordinates(latitude, longitude);
}

// Load current coordinates:
function loadCurrentLocation() {
  navigator.geolocation.getCurrentPosition(success);
  function success(pos) {
    const currentLatitude = pos.coords.latitude;
    const currentLongitude = pos.coords.longitude;
    window.currentLatitude = currentLatitude;
    window.currentLongitude = currentLongitude;
    const test = new LocationMethods(currentLatitude, currentLongitude);
    test
      .getLocationFromCoordinates(currentLatitude, currentLongitude)
      .then((searchCity) => {
        const newCity = new Div(
          id,
          currentLatitude,
          currentLongitude,
          searchCity
        );
        newCity.createDefaultDiv();
      });
  }
}
loadCurrentLocation();

// Location methods class:
class LocationMethods {
  constructor(latitude, longitude, location) {
    this.latitude = latitude;
    this.longitude = longitude;
    this.location = location;
    this.currentLatitude = window.currentLatitude;
    this.currentLongitude = window.currentLongitude;
  }

  // Get Coordinates from Location Function
  async getCoordinatesFromLocation(searchCity) {
    let locationApi = `https://geocode.maps.co/search?q=${searchCity}&api_key=66263a98a7113516974463kogfd6fdb`;
    const res = await fetch(locationApi);
    let data = await res.json();
    this.resultCity = data;
    const latitude = data[0].lat;
    const longitude = data[0].lon;
    const result = `${latitude},${longitude}`;
    return result;
  }

  // Get Location from Coordinates Function
  async getLocationFromCoordinates(latitude, longitude) {
    let coordsApi = `https://geocode.maps.co/reverse?lat=${latitude}&lon=${longitude}&api_key=66263a98a7113516974463kogfd6fdb`;
    let res = await fetch(coordsApi);
    let data = await res.json();

    return `${data.address.city}, ${data.address.country}`;
  }
}

// Create NewDiv class
class Div {
  constructor(id, latitude, longitude, location) {
    this.id = id;
    this.latitude = latitude;
    this.longitude = longitude;
    this.location = location;
  }

  createDefaultDiv() {
    const location = document.getElementById("your-location-text");
    location.classList.add("text-box");
    location.innerHTML = `<p> Your Location: </p> <p> ${this.location}  </p>`; // -- VNESI TUKA KAKO DA PROCITA LOKACIJA VSUSNOST!!! ...
    getTimeZone().then((data) => {
      data.zones.forEach((country) => {
        if (country.zoneName.includes(this.location.split(",")[0])) {
          const countryTimestamp = country.timestamp;
          const countryGmtOffset = country.gmtOffset;
          this.createSecondBox(countryTimestamp, countryTimestamp);
        }
      });
    });
  }
  // Create First Box
  createFirstBox() {
    const newDefaultDiv = document.createElement("div");
    newDefaultDiv.id = `default-div-${this.id}`;
    newDefaultDiv.classList.add("default-raw-div");
    const newDiv = document.createElement("div");
    newDiv.classList.add("box");
    const newForm = document.createElement("form");
    newForm.classList.add("add-location");
    newForm.id = `add-location-${this.id}`;
    newForm.innerHTML = `<form>
    <input
      type="text"
      class="enter-Location"
      id="location-Input-${this.id}"
      name="newLocation"
      placeholder="Enter City or Region"
    />
</form>`;
    newDiv.appendChild(newForm);
    newDefaultDiv.appendChild(newDiv);
    mainDiv.appendChild(newDefaultDiv);

    const form = document.getElementById(`add-location-${this.id}`);
    form.addEventListener("submit", (event) => {
      let searchInput = this.searchRegion(event);
      let newSearch = new LocationMethods(0, 0, searchInput);
      newSearch.getCoordinatesFromLocation(searchInput).then((result) => {
        const latitude = result.split(",")[0];
        const longitude = result.split(",")[1];
        this.latitude = latitude;
        this.longitude = longitude;
        window.myGlobalArray.zones.forEach((country) => {
          i++;
          if (country.zoneName.includes(searchInput)) {
            const timestamp = country.timestamp;
            const gmtOffset = country.gmtOffset;
            this.createSecondBox(timestamp, gmtOffset);
            i = 0;
          }
          if (i === 418) {
            alert("City/Region not found, please try again");
            i = 0;
            return;
          }
        });
      });
    });
  }
  // Create Second Box
  createSecondBox(timestamp, gmtOffset) {
    const newDiv = document.createElement("div");
    newDiv.classList.add("box");
    newDiv.id = `new-parent-div-${this.id}`;
    const newText = document.createElement("h2");
    newText.id = `zone-${this.id}`;
    newText.classList.add("text-box");
    newText.innerHTML = `Loading...`;
    newDiv.appendChild(newText);
    defaultDiv.appendChild(newDiv);
    this.convertTimestamp(timestamp, gmtOffset);
    this.createMap(this.id);
  }
  //Create Map
  createMap(id) {
    const newMapParentDiv = document.createElement("div");
    newMapParentDiv.classList.add("box");
    const newMapDiv = document.createElement("div");
    newMapDiv.id = `map${this.id}`;
    newMapParentDiv.appendChild(newMapDiv);
    defaultDiv.appendChild(newMapParentDiv);
    this.initializeMap(`map${this.id}`, this.latitude, this.longitude);
    if (
      document.getElementById(`default-div-${this.id}`) &&
      document.getElementById(`zone-${this.id}`) &&
      document.getElementById(`new-parent-div-${this.id}`)
    ) {
      const newDefaultDiv = document.getElementById(`default-div-${this.id}`);
      const newTextDiv = document.getElementById(`zone-${this.id}`);
      const newParentDiv = document.getElementById(`new-parent-div-${this.id}`);
      newParentDiv.appendChild(newTextDiv);
      newDefaultDiv.appendChild(newParentDiv);
      newMapParentDiv.appendChild(newMapDiv);
      newDefaultDiv.appendChild(newMapParentDiv);
    }
  }
  //Initialize Map
  initializeMap(mapName, latitude, longitude) {
    var mapName = L.map(`${mapName}`).setView([latitude, longitude], 12);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(mapName);
    id++;
    isEnteredValue = false;
    isEditMode = false;
  }

  convertTimestamp(timestamp, gmtOffset) {
    if (gmtOffset > 0) {
      const newDate = new Date(timestamp * 1000 - 7200000);
      let year = newDate.getFullYear();
      let month = newDate.getMonth() + 1;
      let day = newDate.getDate();
      let hours = newDate.getHours();
      let minutes = newDate.getMinutes();
      let seconds = newDate.getSeconds();
      const newTime = document.getElementById(`zone-${this.id}`);
      setInterval(() => {
        seconds++;
        if (seconds === 60) {
          minutes++;
          seconds = 0;
        }
        if (minutes === 60) {
          hours++;
          minutes = 0;
        }
        newTime.innerHTML = `<p>Your location date: <p style="color: rgba(56, 17, 123)"> ${day}.${month}.${year}</p></p>
              <p>Your local time: <p style="color: rgba(56, 17, 123)"> ${hours}:${minutes}:${seconds}</p></p>`;
      }, 1000);
    } else {
      const newDate = new Date(timestamp * 1000 - 7200000);
      const newTime = document.getElementById(`zone-${this.id}`);
      let year = newDate.getFullYear();
      let month = newDate.getMonth() + 1;
      let day = newDate.getDate();
      let hours = newDate.getHours();
      let minutes = newDate.getMinutes();
      let seconds = newDate.getSeconds();
      setInterval(() => {
        seconds++;
        if (seconds === 60) {
          minutes++;
          seconds = 0;
        }
        if (minutes === 60) {
          hours++;
          minutes = 0;
        }
        newTime.innerHTML = `<p>Your location date: <p style="color: rgba(56, 17, 123)"> ${day}.${month}.${year}</p></p>
            <p>Your local time: <p style="color: rgba(56, 17, 123)"> ${hours}:${minutes}:${seconds}</p></p>`;
      }, 1000);
    }
  }

  searchRegion(e) {
    e.preventDefault();
    // Here the this.id is changed to add-location-1 ?!?!?!?! why?!?
    let input = document.getElementById(`location-Input-${id}`);
    if (input) {
      let inputValue =
        input.value[0].toUpperCase() + input.value.slice(1).toLowerCase();
      isEnteredValue = true;
      return inputValue;
    } else {
      alert("Please open a new search field");
      return;
    }
  }
}

//Reset page function
function resetPage() {
  location.reload();
}

function createNewSearch() {
  const newCity = new Div(id);
  if (id >= 5) {
    alert(
      `I'm sorry you can search only 5 locations for free, please subscribe for more or reset the application`
    );
    return;
  }
  if (isEditMode === true) {
    alert("You are in edit mode, please enter value or reset the application");
    return;
  }
  if (isEnteredValue === true) {
    alert("You cant search for a new location with free account");
  }
  isEditMode = true;
  isEnteredValue = false;
  newCity.createFirstBox();
}

// Eventlisteners

resetBtn.addEventListener("click", resetPage);
addNewSearchBtn.addEventListener("click", createNewSearch);
