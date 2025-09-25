const fs = require("fs");

const makes = ["Toyota", "Honda", "Ford", "Tesla", "BMW", "Audi", "Mercedes", "Hyundai", "Kia", "Chevrolet"];
const models = ["Corolla", "Civic", "Mustang", "Model 3", "X5", "Q7", "C-Class", "Elantra", "Sportage", "Malibu"];
const fuels = ["Petrol", "Diesel", "Hybrid", "Electric"];
const transmissions = ["Manual", "Automatic"];
const categories = ["Sedan", "SUV", "Hatchback", "Coupe", "Convertible"];
const featuresList = ["Airbags", "ABS", "Power Steering", "AC", "Sunroof", "Leather Seats", "Navigation", "Bluetooth"];
const pexelsImages = [
  "https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg",
  "https://images.pexels.com/photos/210019/pexels-photo-210019.jpeg",
  "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg",
  "https://images.pexels.com/photos/799443/pexels-photo-799443.jpeg"
];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomFeatures() {
  const shuffled = featuresList.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.floor(Math.random() * 5) + 3); // 3-7 random features
}

const dummyCars = [];

for (let i = 1; i <= 100; i++) {
  const make = getRandomItem(makes);
  const model = getRandomItem(models);
  const year = 2010 + Math.floor(Math.random() * 15); // 2010-2024
  const price = 500000 + Math.floor(Math.random() * 1000000); // Random price
  const originalPrice = price + Math.floor(Math.random() * 200000); // originalPrice >= price
  const mileage = `${(10 + Math.random() * 15).toFixed(1)} km/l`;
  const fuel = getRandomItem(fuels);
  const transmission = getRandomItem(transmissions);
  const category = getRandomItem(categories);
  const seating = 2 + Math.floor(Math.random() * 5); // 2-6 seats
  const seasonalOffer = Math.random() < 0.3; // 30% chance
  const dealerPromotion = Math.random() < 0.3;
  const isHotDeal = Math.random() < 0.2;
  const isNewArrival = Math.random() < 0.2;
  const features = getRandomFeatures();
  const image = getRandomItem(pexelsImages);

  dummyCars.push({
    id: i.toString(),
    make,
    model,
    year,
    price,
    originalPrice,
    fuel,
    mileage,
    image,
    seasonalOffer,
    dealerPromotion,
    isHotDeal,
    isNewArrival,
    features,
    seating,
    transmission,
    category
  });
}

// Write to dummyCars.ts
const fileContent = `export const DUMMY_CARS = ${JSON.stringify(dummyCars, null, 2)};`;

fs.writeFileSync("dummyCars.ts", fileContent);

console.log("✅ dummyCars.ts file created with 100 detailed car entries!");
