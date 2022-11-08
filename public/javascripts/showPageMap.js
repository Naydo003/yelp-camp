


mapboxgl.accessToken = mapToken;   //  This is defined in the show.ejs file. Could use token directly but this allows easy updating
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v11', // style URL
    center: campground.geometry.coordinates, // starting position [lng, lat]
    zoom: 8, // starting zoom
    projection: 'globe' // display the map as a 3D globe
});
map.on('style.load', () => {
    map.setFog({}); // Set the default atmosphere style
});

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());

// Create a marker and add it to the map.
new mapboxgl.Marker()
.setLngLat(campground.geometry.coordinates).addTo(map)
.setPopup(
  new mapboxgl.Popup({ offset: 25 })
    .setHTML(`<h3>${campground.title}</h3><p>${campground.location}`)
)
