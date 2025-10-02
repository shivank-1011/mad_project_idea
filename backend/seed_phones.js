const { PrismaClient } = require("./generated/prisma");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

const prisma = new PrismaClient();

async function seedPhoneData() {
  console.log("Starting phone data seed...");

  // First, let's clear existing data (price history first due to foreign key)
  await prisma.priceHistory.deleteMany();
  await prisma.product.deleteMany();

  const phoneData = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(
      path.join(__dirname, "assets", "mysmartprice_mobile_dataset.csv")
    )
      .pipe(csv())
      .on("data", (data) => {
        // Skip empty rows or rows without mobile_name
        if (!data.mobile_name || data.mobile_name.trim() === "") {
          return;
        }

        // Extract brand from mobile name (first word before space)
        const brand = data.mobile_name.split(" ")[0] || "Unknown";

        // Parse price (remove ₹ and commas)
        let price = 0;
        if (data.price && data.price.includes("₹")) {
          price = parseFloat(data.price.replace(/₹|,/g, "")) || 0;
        }

        // Parse rating
        let rating = null;
        if (data.avg_rating && data.avg_rating !== "") {
          rating = parseFloat(data.avg_rating) || null;
        }

        // Create specs object with all available data
        const specs = {
          cpu: data.cpu || "",
          rearCamera: data.rear_camera || "",
          frontCamera: data.front_camera || "",
          display: data.display || "",
          ramAndStorage: data.ram_and_storage || "",
          batteryAndCharging: data.battery_and_charging_speed || "",
          operatingSystem: data.operating_system || "",
          connectivity: data["5G|NFC|Fingerprint"] || "",
        };

        const phoneItem = {
          name: data.mobile_name.trim(),
          brand: brand,
          price: price,
          rating: rating,
          totalRatings: data.total_ratings || null,
          releaseDate: data.release_date || null,
          specs: specs,
          imageUrl: "/assets/16pm.png", // Using 16pm.png for all products as requested
          affiliateLink: null,
          expertView: data.expert_view || null,
        };

        phoneData.push(phoneItem);
      })
      .on("end", async () => {
        try {
          console.log(`Parsed ${phoneData.length} phone records from CSV`);

          // Insert data in batches to avoid memory issues
          const batchSize = 100;
          for (let i = 0; i < phoneData.length; i += batchSize) {
            const batch = phoneData.slice(i, i + batchSize);
            await prisma.product.createMany({
              data: batch,
              skipDuplicates: true,
            });
            console.log(
              `Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
                phoneData.length / batchSize
              )}`
            );
          }

          console.log("Phone data seeded successfully!");
          resolve();
        } catch (error) {
          console.error("Error inserting phone data:", error);
          reject(error);
        }
      })
      .on("error", (error) => {
        console.error("Error reading CSV file:", error);
        reject(error);
      });
  });
}

async function main() {
  try {
    await seedPhoneData();
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

module.exports = { seedPhoneData };
