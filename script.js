let lat = 0 
let lon = 0 

let defaultLon = 174.768842
let defaultLat = -36.851917
let maxDist = 1
let name = ""

// Initialize Firebase
var config = {
  apiKey: "AIzaSyD6d5MN1OIwaVMbzjbficQqhiytICPDtlc",
  authDomain: "overhere-nz.firebaseapp.com",
  databaseURL: "https://overhere-nz.firebaseio.com",
  projectId: "overhere-nz",
  storageBucket: "overhere-nz.appspot.com",
  messagingSenderId: "273850599788"
};
firebase.initializeApp(config)
const db = firebase.database()

const messagesRef = db.ref("chats")
var messageField = document.querySelector('#messageInput')
//var nameField = document.querySelector('#nameInput')
var messageList = document.querySelector('.messages')
const updateButton = document.querySelector('.updateLocationButton')
const resetLocationButton = document.querySelector('.defaultLocationButton')
const lastLocUpdateEl = document.querySelector('.lastLocationUpdate')
const globeIconEl = document.querySelector('.globeIcon')

document.querySelector('.chat').addEventListener('submit',function(e) {
  e.preventDefault();
  var message = {
    name : name,
    text : messageField.value
  }
  var newPostRef = messagesRef.push(message)
  messageField.value = ''
  console.log("saved chat at " + newPostRef.key)
  saveGeoTag(newPostRef.key)
});

updateButton.addEventListener('click', getLocation)
globeIconEl.addEventListener('click', getLocation)
resetLocationButton.addEventListener('click', setDefaultLocation)

function saveGeoTag(postKey) {
  var latitude = lat
  var longitude = lon
  log("Saving post to location: [" + latitude + ", " + longitude + "]");
  geoFire.set(postKey, [latitude, longitude])
}

var firebaseRef = firebase.database().ref("locations")

// Create a new GeoFire instance at the random Firebase location
var geoFire = new GeoFire(firebaseRef);

/* Uses the HTML5 geolocation API to get the current user's location */
function getLocation() {
  if (typeof navigator !== "undefined" && typeof navigator.geolocation !== "undefined") {
    //log("Asking user to get their location");
    navigator.geolocation.getCurrentPosition(function (loc) {
    	lat = loc.coords.latitude
    	lon = loc.coords.longitude
    	query()
    	lastLocUpdateEl.innerText = "Location updated: " + new Date().toLocaleTimeString()
    }, errorHandler);
  } else {
    //log("Your browser does not support the HTML5 Geolocation API, so this demo will not work.")
  }
};

function setDefaultLocation () {
	lat = defaultLat
	lon = defaultLon
	lastLocUpdateEl.innerText = "Location set to: Auckland Uni quad"
	query()	
}

/* Handles any errors from trying to get the user's current location */
var errorHandler = function(error) {
  if (error.code == 1) {
    log("Error: PERMISSION_DENIED: User denied access to their location");
  } else if (error.code === 2) {
    log("Error: POSITION_UNAVAILABLE: Network is down or positioning satellites cannot be reached");
  } else if (error.code === 3) {
    log("Error: TIMEOUT: Calculating the user's location too took long");
  } else {
    log("Unexpected error code")
  }
};

/*************/
/*  HELPERS  */
/*************/
/* Logs to the page instead of the console */
function log(message) {
	console.log(message)
}

///////////// query

let geoQuery = undefined
function query() {
	var radius = maxDist
	var operation

	if (typeof geoQuery !== "undefined") {
	  operation = "Updating";
	  addMessage({name: "💁", text: "(your location changed)"}, 0, true)
	  geoQuery.updateCriteria({
	    center: [lat, lon],
	    radius: radius
	  });

	} else {
	  operation = "Creating";

	  geoQuery = geoFire.query({
	    center: [lat, lon],
	    radius: radius
	  });

	  geoQuery.on("key_entered", function(key, location, distance) {
	  	db.ref("/chats/" + key).once("value").then(function (data) {
	  		addMessage(data.val(), distance)
	  	})
	    //log(key + " is located at [" + location + "] which is within the query (" + distance.toFixed(2) + " km from center)");
	  });

	  geoQuery.on("key_exited", function(key, location, distance) {
	    console.log(key, location, distance);
	    //log(key + " is located at [" + location + "] which is no longer within the query (" + distance.toFixed(2) + " km from center)");
	  });
	}
}

function addMessage(data, distance, isSystem) {
  var username = data.name || 'anonymous';
  var message = data.text;

  var nameElement = document.createElement('span')
  nameElement.classList.add("name")
  nameElement.appendChild(document.createTextNode(username))
  var messageElement = document.createElement('li')
  messageElement.appendChild(nameElement)
  messageElement.appendChild(document.createTextNode(message))
  if (distance > maxDist / 2) {
  	messageElement.classList.add("distant")
  }
  if (isSystem) messageElement.classList.add("systemMessage")

  messageList.appendChild(messageElement);
  //messageElement.scrollIntoView(false)
  window.scrollTo(0,document.body.scrollHeight);
}

function randomEmoji(){
	var emojis = [
  //not supported on androids: "🦐","🤡","🦆","🦅","🦉","🦇","🦋","🦎","🦑","🦈","🦌","🦏","🦍","🥀"
  //,"🥝","🥑","🥒","🥕","🥔","🍠","🌰","🥜","🍯","🥐","🍞","🥖","🥚","🥓","🥞","🍤","🍗","🍖","🍕","🌭","🍔","🍟","🥙","🌮","🌯","🥗","🥘","🍝","🍜","🍲","🍥",
  //,"🥛","🥂","🥃","🥄","🧠","🦊"
	"💀","👻","👽","🤖","💩","😺","👣","👀","👁","👓","🕶","🌂","👞","🐶","🐱","🐭","🐹","🐰","🐻","🐼","🐨","🐯","🦁","🐮","🐷",
  "🐽","🐸","🐵","🙊","🙉","🙊","🐒","🐔","🐧","🐦","🐤","🐣","🐥","🐺","🐗","🐴","🦄","🐝","🐛","🐌","🐚","🐞",
  "🐜","🕷","🕸","🐢","🐍","🦂","🦀","🐙","🐠","🐟","🐡","🐬","🐳","🐋","🐊","🐆","🐅","🐃","🐂",
  "🐄","🐪","🐫","🐘","🐎","🐖","🐐","🐏","🐑","🐕","🐩","🐈","🐓","🦃","🕊","🐇","🐁","🐀","🐿",
  "🐾","🐉","🐲","🌵","🎄","🌲","🌳","🌴","🌱","🌿","☘️","🍀","🎍","🎋","🍃","🍂","🍁","🍄","🌾","💐","🌷","🌹",
  "🌻","🌼","🌸","🌺","🌏","🌕","🌘","🌚","🌝","🌞","🌛","🌜","🌙","💫","⭐️","🌟","✨","⚡️","🔥","💥","☄️",
  "☀️","🌈","🌩","⛄️","❄️","🌬","💨","🌪","🌫","🌊","💧","💦","☔️","🍏","🍎","🍐","🍊","🍋","🍌","🍉","🍇","🍓",
  "🍈","🍒","🍑","🍍","🍅","🍆","🌽","🌶","🧀","🍳",
  "🍣","🍱","🍛","🍚","🍙",
  "🍘","🍢","🍡","🍧","🍨","🍦","🍰","🎂","🍮","🍭","🍬","🍫","🍿","🍩","🍪","🍼","☕️","🍵","🍶","🍺","🍻",
  "🍷","🍸","🍹","🍾","🍴","🍽"
	];
  return emojis[Math.floor(Math.random() * emojis.length)];
}

name = randomEmoji()
document.querySelector(".nameDisplay").innerText = name
