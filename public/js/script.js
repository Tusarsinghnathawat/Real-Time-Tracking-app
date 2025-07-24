
let currentRoom = "default-room";

//initilize socket io
const socket = io(); //connection request to the server will be made
// console.log("Server is running on port 3000");

// Join default room automatically when page loads
socket.emit("join-room", currentRoom);

document.getElementById("createRoomBtn").addEventListener("click", () => {
    const roomName = prompt("Enter room name:");
    if(roomName){
        currentRoom = roomName;
        socket.emit("join-room", roomName);
        alert(`Room "${roomName}" created and joined!`);
        console.log(`Switched to room: ${roomName}`);
    }
});

document.getElementById("joinRoomBtn").addEventListener("click",() =>{
    const roomName = prompt("Enter room name to join:");
    if(roomName){
        currentRoom = roomName;
        socket.emit("join-room", roomName);
        alert(`Joined room "${roomName}"!`);
        console.log(`Switched to room: ${roomName}`);
    }
})  



const userName = prompt("Enter your name:") || "Unknown"; //prompt for user name, default to "Unkonwn"

function sendLocation(position){
    const {latitude, longitude} = position.coords;
    if(currentRoom){
        socket.emit("send-location", {
            latitude,
            longitude,
            name: userName, // Send name with location
            room: currentRoom // Include room information
        });
    }
}

//check if the browse supports geolocation
if (navigator.geolocation){
    navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            // Fixed: Use the sendLocation function or include room info
            if(currentRoom) {
                socket.emit('send-location', {
                    latitude,
                    longitude,
                    name: userName,  // Send name with location
                    room: currentRoom // Include room information
                });
            }
        },
        (error) => {
            console.error("Error getting location:", error);
        },
        {
            enableHighAccuracy: true,
            maximumAge: 0, //koi bhi saved data nahi chahiye, new data chahiye
            timeout: 5000
        }
    )
}

const map = L.map("map").setView([0, 0], 10);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: "Tushar Singh Nathawat",
}).addTo(map)

const markers = {}; //to store markers for each user

socket.on("receive-location", (data) => {
    const { id, latitude, longitude, name } = data;

    if(id===socket.id) {
        // If it's your own location, set the view to your location
        map.setView([latitude, longitude], 16); // Zoom in to user's location
    }
    
    if(markers[id]){
        markers[id].setLatLng([latitude, longitude]);
        markers[id].setTooltipContent( name || "Unknown"); //update tooltip with name
    }
    else{
        markers[id] = L.marker([latitude, longitude])
            .addTo(map)
            .bindTooltip(name || "Unknown",{permanent: true, direction: "top"})
            .openTooltip();
    }
});

socket.on("user-disconnected", (id) => {
    if(markers[id]){
        map.removeLayer(markers[id]);
        delete markers[id]; //remove marker from the markers object
    }
});

console.log("Script loaded, current room:", currentRoom);
