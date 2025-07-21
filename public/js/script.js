//initilize socket io
const socket = io(); //connection request to the server will be made
// console.log("Server is running on port 3000");

//check if the browse supports geolocation
if (navigator.geolocation){
    navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            socket.emit('send-location', {
                latitude,
                longitude
            });
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
    const { id, latitude, longitude } = data;
    map.setView([latitude, longitude]);
    
    if(markers[id]){
        markers[id].setLatLng([latitude, longitude]);
    }
    else{
        markers[id] = L.marker([latitude, longitude]).addTo(map);
    }
});

socket.on("user-disconnected", (id) => {
    if(markers[id]){
        map.removeLayer(markers[id]);
        delete markers[id]; //remove marker from the markers object
    }
});
