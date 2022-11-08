const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        let price = Math.floor(Math.random()*20)+10;
        const camp = new Campground({
            author: "6331c0ba9ba9691111286876",
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            geometry: {
              type: "Point",
              coordinates: [ cities[random1000].longitude, cities[random1000].latitude ]
            },
            title: `${sample(descriptors)} ${sample(places)}`,
            // image: "https://images.unsplash.com/photo-1560380969-e7651175e036?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80",
            description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
            price: price,
            images: [
              {
                url: "https://res.cloudinary.com/ds4opo9zq/image/upload/v1664597289/YelpCamp/palm73fjqfc7sq0ezzjt.jpg",
                filename: "YelpCamp/palm73fjqfc7sq0ezzjt"
              },
              {
                url: "https://res.cloudinary.com/ds4opo9zq/image/upload/v1664597292/YelpCamp/tjvll6bnurcbqvojtxhs.jpg",
                filename: "YelpCamp/tjvll6bnurcbqvojtxhs"
              },
              {
                url: "https://res.cloudinary.com/ds4opo9zq/image/upload/v1664597295/YelpCamp/wo293arrbpielibdvwf8.jpg",
                filename: "YelpCamp/wo293arrbpielibdvwf8"
              }
            ]
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})
