const { PrismaClient } = require("../generated/prisma");
const phoneScraperService = require("../services/phoneScraperService");
const phoneDataNormalizer = require("../services/phoneDataNormalizer");
const comprehensivePhoneDataService = require("../services/comprehensivePhoneDataService");

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting real phone data seeding...");
  console.log(
    "⚠️  This will replace all existing dummy data with real scraped data"
  );
  console.log(
    "⏳ This process may take 10-15 minutes due to rate limiting...\n"
  );

  try {

    console.log("🗑️  Clearing existing data...");
    await prisma.priceHistory.deleteMany({});
    await prisma.product.deleteMany({});
    console.log("✅ Existing data cleared\n");


    console.log("🔍 Generating comprehensive phone database...");
    const rawPhones =
      await comprehensivePhoneDataService.generateComprehensivePhoneData();
    console.log(
      `📱 Generated ${rawPhones.length} phones from comprehensive database\n`
    );

    if (rawPhones.length === 0) {
      console.log(
        "⚠️  Failed to generate comprehensive phone data. Falling back to curated data..."
      );
      await seedFallbackData();
      return;
    }


    console.log("🔧 Normalizing and cleaning phone data...");
    const normalizedPhones = await phoneDataNormalizer.normalizePhones(
      rawPhones
    );
    console.log(`✅ Normalized to ${normalizedPhones.length} valid phones\n`);

    if (normalizedPhones.length === 0) {
      console.log(
        "⚠️  No valid phones after normalization. Falling back to curated data..."
      );
      await seedFallbackData();
      return;
    }


    console.log("💾 Saving phones to database...");
    let saved = 0;
    let failed = 0;

    for (const phone of normalizedPhones) {
      try {
        const createdPhone = await prisma.product.create({
          data: {
            name: phone.name,
            brand: phone.brand,
            specs: phone.specs,
            price: phone.price,
            rating: phone.rating,
            imageUrl: phone.imageUrl,
            affiliateLink: phone.affiliateLink,
          },
        });


        await prisma.priceHistory.create({
          data: {
            productId: createdPhone.id,
            price: phone.price,
          },
        });

        saved++;

        if (saved % 10 === 0) {
          console.log(
            `   💾 Saved ${saved}/${normalizedPhones.length} phones...`
          );
        }
      } catch (error) {
        console.error(`❌ Error saving phone ${phone.name}:`, error.message);
        failed++;
      }
    }

    console.log(`\n✅ Database seeding completed!`);
    console.log(`   📊 Successfully saved: ${saved} phones`);
    console.log(`   ❌ Failed to save: ${failed} phones`);


    const brandStats = await prisma.product.groupBy({
      by: ["brand"],
      _count: true,
      orderBy: {
        _count: {
          brand: "desc",
        },
      },
    });

    console.log("\n📈 Brand breakdown:");
    brandStats.forEach((stat) => {
      console.log(`   ${stat.brand}: ${stat._count} phones`);
    });


    const priceStats = await prisma.product.aggregate({
      _min: { price: true },
      _max: { price: true },
      _avg: { price: true },
      _count: true,
    });

    console.log("\n💰 Price statistics:");
    console.log(`   Total phones: ${priceStats._count}`);
    console.log(
      `   Price range: ₹${priceStats._min.price?.toLocaleString()} - ₹${priceStats._max.price?.toLocaleString()}`
    );
    console.log(
      `   Average price: ₹${Math.round(
        priceStats._avg.price || 0
      ).toLocaleString()}`
    );
  } catch (error) {
    console.error("💥 Error during seeding:", error);
    console.log("\n🔄 Falling back to curated phone data...");
    await seedFallbackData();
  }
}


async function seedFallbackData() {
  console.log("📱 Seeding curated phone data as fallback...");

  const curatedPhones = [

    {
      name: "iPhone 16 Pro Max",
      brand: "Apple",
      specs: {
        ram: "8GB",
        storage: "256GB",
        display: "6.9 inch",
        camera: "48MP Triple",
        battery: "4441mAh",
        processor: "A18 Pro",
        os: "iOS",
      },
      price: 144900,
      rating: 4.6,
      imageUrl: "/assets/phones/iphone-16-pro-max.jpg",
      affiliateLink: "https://www.amazon.in/dp/iPhone16ProMax",
    },
    {
      name: "iPhone 16 Pro",
      brand: "Apple",
      specs: {
        ram: "8GB",
        storage: "128GB",
        display: "6.3 inch",
        camera: "48MP Triple",
        battery: "3582mAh",
        processor: "A18 Pro",
        os: "iOS",
      },
      price: 119900,
      rating: 4.5,
      imageUrl: "/assets/phones/iphone-16-pro.jpg",
      affiliateLink: "https://www.amazon.in/dp/iPhone16Pro",
    },

    {
      name: "Samsung Galaxy S24 Ultra",
      brand: "Samsung",
      specs: {
        ram: "12GB",
        storage: "256GB",
        display: "6.8 inch",
        camera: "200MP Quad",
        battery: "5000mAh",
        processor: "Snapdragon 8 Gen 3",
        os: "Android",
      },
      price: 129999,
      rating: 4.4,
      imageUrl: "/assets/phones/samsung-galaxy-s24-ultra.jpg",
      affiliateLink: "https://www.flipkart.com/samsung-galaxy-s24-ultra",
    },
    {
      name: "Samsung Galaxy S24+",
      brand: "Samsung",
      specs: {
        ram: "12GB",
        storage: "256GB",
        display: "6.7 inch",
        camera: "50MP Triple",
        battery: "4900mAh",
        processor: "Snapdragon 8 Gen 3",
        os: "Android",
      },
      price: 99999,
      rating: 4.3,
      imageUrl: "/assets/phones/samsung-galaxy-s24-plus.jpg",
      affiliateLink: "https://www.flipkart.com/samsung-galaxy-s24-plus",
    },

    {
      name: "OnePlus 12",
      brand: "OnePlus",
      specs: {
        ram: "16GB",
        storage: "512GB",
        display: "6.82 inch",
        camera: "50MP Triple",
        battery: "5400mAh",
        processor: "Snapdragon 8 Gen 3",
        os: "Android",
      },
      price: 64999,
      rating: 4.4,
      imageUrl: "/assets/phones/oneplus-12.jpg",
      affiliateLink: "https://www.amazon.in/dp/OnePlus12",
    },
    {
      name: "OnePlus 12R",
      brand: "OnePlus",
      specs: {
        ram: "8GB",
        storage: "128GB",
        display: "6.78 inch",
        camera: "50MP Triple",
        battery: "5500mAh",
        processor: "Snapdragon 8s Gen 3",
        os: "Android",
      },
      price: 39999,
      rating: 4.3,
      imageUrl: "/assets/phones/oneplus-12r.jpg",
      affiliateLink: "https://www.amazon.in/dp/OnePlus12R",
    },

    {
      name: "Xiaomi 14",
      brand: "Xiaomi",
      specs: {
        ram: "12GB",
        storage: "512GB",
        display: "6.36 inch",
        camera: "50MP Triple",
        battery: "4610mAh",
        processor: "Snapdragon 8 Gen 3",
        os: "Android",
      },
      price: 69999,
      rating: 4.2,
      imageUrl: "/assets/phones/xiaomi-14.jpg",
      affiliateLink: "https://www.flipkart.com/xiaomi-14",
    },

    {
      name: "Nothing Phone (2)",
      brand: "Nothing",
      specs: {
        ram: "12GB",
        storage: "256GB",
        display: "6.7 inch",
        camera: "50MP Dual",
        battery: "4700mAh",
        processor: "Snapdragon 8+ Gen 1",
        os: "Android",
      },
      price: 44999,
      rating: 4.1,
      imageUrl: "/assets/phones/nothing-phone-2.jpg",
      affiliateLink: "https://www.flipkart.com/nothing-phone-2",
    },

    {
      name: "Vivo X200 Pro",
      brand: "Vivo",
      specs: {
        ram: "16GB",
        storage: "512GB",
        display: "6.78 inch",
        camera: "50MP Triple",
        battery: "6000mAh",
        processor: "Dimensity 9400",
        os: "Android",
      },
      price: 94999,
      rating: 4.0,
      imageUrl: "/assets/phones/vivo-x200-pro.jpg",
      affiliateLink: "https://www.amazon.in/dp/VivoX200Pro",
    },
    {
      name: "Vivo V40 Pro",
      brand: "Vivo",
      specs: {
        ram: "12GB",
        storage: "256GB",
        display: "6.78 inch",
        camera: "50MP Triple",
        battery: "5500mAh",
        processor: "Dimensity 9200+",
        os: "Android",
      },
      price: 49999,
      rating: 4.0,
      imageUrl: "/assets/phones/vivo-v40-pro.jpg",
      affiliateLink: "https://www.flipkart.com/vivo-v40-pro",
    },
  ];

  let saved = 0;

  for (const phone of curatedPhones) {
    try {
      const createdPhone = await prisma.product.create({
        data: phone,
      });


      await prisma.priceHistory.create({
        data: {
          productId: createdPhone.id,
          price: phone.price,
        },
      });

      saved++;
    } catch (error) {
      console.error(
        `❌ Error saving fallback phone ${phone.name}:`,
        error.message
      );
    }
  }

  console.log(`✅ Fallback seeding completed! Saved ${saved} curated phones.`);
}

main()
  .catch((e) => {
    console.error("💥 Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log("\n🎉 Database seeding process completed!");
    console.log(
      "💡 You can now start your server and see real phone data in your API."
    );
    console.log(
      "🔄 The system will automatically update prices and add new phones in the background."
    );
  });
