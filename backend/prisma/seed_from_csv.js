const { PrismaClient } = require("../generated/prisma");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting CSV seeding...");

  const csvFilePath = path.join(__dirname, "../assets/mysmartprice_mobile_dataset.csv");

  if (!fs.existsSync(csvFilePath)) {
    console.error(`❌ CSV file not found at ${csvFilePath}`);
    process.exit(1);
  }

  const phones = [];

  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on("data", (row) => {
      phones.push(row);
    })
    .on("end", async () => {
      console.log(`📖 Parsed ${phones.length} rows from CSV.`);
      await seedPhones(phones);
    });
}

async function seedPhones(rawPhones) {
  try {
    console.log("🗑️  Clearing existing data...");
    await prisma.priceHistory.deleteMany({});
    await prisma.product.deleteMany({});
    console.log("✅ Existing data cleared");

    let saved = 0;
    let failed = 0;

    for (const row of rawPhones) {
      try {
        // Parse Price: "₹129,999" -> 129999.0
        const priceString = row.price ? row.price.replace(/[₹,]/g, "") : "0";
        const price = parseFloat(priceString) || 0;

        // Parse Rating: "4.4" -> 4.4
        const rating = parseFloat(row.avg_rating) || null;

        // Extract Brand: First word of mobile_name
        const brand = row.mobile_name ? row.mobile_name.split(" ")[0] : "Unknown";

        // Construct Specs JSON
        const specs = {
          processor: row.cpu,
          camera: {
            rear: row.rear_camera,
            front: row.front_camera,
          },
          display: row.display,
          ram_storage: row.ram_and_storage,
          battery: row.battery_and_charging_speed,
          os: row.operating_system,
          features: row["5G|NFC|Fingerprint"],
        };

        const createdPhone = await prisma.product.create({
          data: {
            name: row.mobile_name,
            brand: brand,
            specs: specs,
            price: price,
            rating: rating,
            totalRatings: row.total_ratings,
            releaseDate: row.release_date,
            imageUrl: "", // Placeholder as discussed
            expertView: row.expert_view,
            affiliateLink: null,
          },
        });

        // Add initial price history
        await prisma.priceHistory.create({
          data: {
            productId: createdPhone.id,
            price: price,
          },
        });

        saved++;
        if (saved % 50 === 0) {
          console.log(`   💾 Saved ${saved}/${rawPhones.length} phones...`);
        }
      } catch (error) {
        // console.error(`❌ Error saving phone ${row.mobile_name}:`, error.message);
        failed++;
      }
    }

    console.log(`\n✅ Database seeding completed!`);
    console.log(`   📊 Successfully saved: ${saved} phones`);
    console.log(`   ❌ Failed to save: ${failed} phones`);

  } catch (error) {
    console.error("💥 Error during seeding:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
