const { PrismaClient } = require("./generated/prisma");
const fs = require("fs");
const csv = require("csv-parser");

const prisma = new PrismaClient();

async function seedFilteredData() {
  try {
    console.log("🗑️  Clearing existing data...");


    await prisma.priceHistory.deleteMany({});
    await prisma.product.deleteMany({});

    console.log("📁 Reading filtered CSV data...");

    const products = [];

    return new Promise((resolve, reject) => {
      fs.createReadStream("./assets/mysmartprice_mobile_dataset.csv")
        .pipe(csv())
        .on("data", (row) => {
          try {

            const mobileName = row.mobile_name || "";
            const brand = mobileName.split(" ")[0] || "";


            if (!mobileName || !brand) return;


            let price = 0;
            if (row.price) {
              const priceStr = row.price.replace(/[₹,]/g, "").trim();
              price = parseFloat(priceStr) || 0;
            }


            let rating = null;
            if (row.avg_rating && row.avg_rating !== "") {
              rating = parseFloat(row.avg_rating);
            }


            const specs = {
              display: row.display || "Not specified",
              cpu: row.cpu || "Not specified",
              rearCamera: row.rear_camera || "Not specified",
              frontCamera: row.front_camera || "Not specified",
              ramAndStorage: row.ram_and_storage || "Not specified",
              batteryAndCharging:
                row.battery_and_charging_speed || "Not specified",
              operatingSystem: row.operating_system || "Not specified",
              connectivity: row["5G|NFC|Fingerprint"] || "Not specified",
            };


            let expertView = row.expert_view || null;

            const product = {
              name: mobileName,
              brand: brand,
              specs: specs,
              price: price,
              rating: rating,
              totalRatings: row.total_ratings || null,
              releaseDate: row.release_date || null,
              imageUrl: "assets/16pm.png",
              expertView: expertView,
            };

            products.push(product);
          } catch (error) {
            console.error("Error processing row:", error);
          }
        })
        .on("end", async () => {
          try {
            console.log(`📊 Found ${products.length} products to seed`);


            const uniqueBrands = [
              ...new Set(products.map((p) => p.brand)),
            ].sort();
            console.log("🏷️  Brands to be seeded:", uniqueBrands.join(", "));


            const batchSize = 50;
            let seededCount = 0;

            for (let i = 0; i < products.length; i += batchSize) {
              const batch = products.slice(i, i + batchSize);

              for (const product of batch) {
                try {
                  await prisma.product.create({
                    data: product,
                  });
                  seededCount++;
                } catch (error) {
                  console.error(
                    `Error creating product ${product.name}:`,
                    error.message
                  );
                }
              }

              console.log(
                `✅ Seeded ${Math.min(i + batchSize, products.length)}/${
                  products.length
                } products`
              );
            }

            console.log(
              `🎉 Successfully seeded ${seededCount} products from filtered dataset!`
            );


            const brandCounts = {};
            products.forEach((p) => {
              brandCounts[p.brand] = (brandCounts[p.brand] || 0) + 1;
            });

            console.log("\n📈 Final brand distribution:");
            Object.entries(brandCounts)
              .sort(([, a], [, b]) => b - a)
              .forEach(([brand, count]) => {
                console.log(`   ${brand}: ${count} products`);
              });

            resolve();
          } catch (error) {
            reject(error);
          }
        })
        .on("error", (error) => {
          reject(error);
        });
    });
  } catch (error) {
    console.error("❌ Error seeding filtered data:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}


seedFilteredData()
  .then(() => {
    console.log("✅ Database successfully updated with filtered data");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Failed to seed filtered data:", error);
    process.exit(1);
  });
