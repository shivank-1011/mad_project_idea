const axios = require("axios");

class ComprehensivePhoneDataService {
  constructor() {
    this.cache = new Map();

    // Phone specifications data with realistic details
    this.phoneDatabase = {
      Apple: {
        models: [
          {
            name: "iPhone 16 Pro Max",
            variants: ["128GB", "256GB", "512GB", "1TB"],
            basePrice: 134900,
            specs: {
              display: "6.9 inch Super Retina XDR",
              processor: "A18 Pro Bionic",
              camera: "48MP Triple Camera System",
              battery: "4441mAh",
              os: "iOS 18",
              build: "Titanium",
              colors: [
                "Natural Titanium",
                "Blue Titanium",
                "White Titanium",
                "Black Titanium",
              ],
            },
            rating: 4.6,
            year: 2024,
          },
          {
            name: "iPhone 16 Pro",
            variants: ["128GB", "256GB", "512GB", "1TB"],
            basePrice: 119900,
            specs: {
              display: "6.3 inch Super Retina XDR",
              processor: "A18 Pro Bionic",
              camera: "48MP Triple Camera System",
              battery: "3582mAh",
              os: "iOS 18",
              build: "Titanium",
              colors: [
                "Natural Titanium",
                "Blue Titanium",
                "White Titanium",
                "Black Titanium",
              ],
            },
            rating: 4.5,
            year: 2024,
          },
          {
            name: "iPhone 16",
            variants: ["128GB", "256GB", "512GB"],
            basePrice: 79900,
            specs: {
              display: "6.1 inch Super Retina XDR",
              processor: "A18 Bionic",
              camera: "48MP Dual Camera System",
              battery: "3561mAh",
              os: "iOS 18",
              build: "Aluminum",
              colors: ["Pink", "Teal", "White", "Black", "Ultramarine"],
            },
            rating: 4.4,
            year: 2024,
          },
          {
            name: "iPhone 16 Plus",
            variants: ["128GB", "256GB", "512GB"],
            basePrice: 89900,
            specs: {
              display: "6.7 inch Super Retina XDR",
              processor: "A18 Bionic",
              camera: "48MP Dual Camera System",
              battery: "4674mAh",
              os: "iOS 18",
              build: "Aluminum",
              colors: ["Pink", "Teal", "White", "Black", "Ultramarine"],
            },
            rating: 4.3,
            year: 2024,
          },
          {
            name: "iPhone 15 Pro Max",
            variants: ["256GB", "512GB", "1TB"],
            basePrice: 159900,
            specs: {
              display: "6.7 inch Super Retina XDR",
              processor: "A17 Pro Bionic",
              camera: "48MP Triple Camera System",
              battery: "4441mAh",
              os: "iOS 17",
              build: "Titanium",
              colors: [
                "Natural Titanium",
                "Blue Titanium",
                "White Titanium",
                "Black Titanium",
              ],
            },
            rating: 4.7,
            year: 2023,
          },
          {
            name: "iPhone 15 Pro",
            variants: ["128GB", "256GB", "512GB", "1TB"],
            basePrice: 134900,
            specs: {
              display: "6.1 inch Super Retina XDR",
              processor: "A17 Pro Bionic",
              camera: "48MP Triple Camera System",
              battery: "3274mAh",
              os: "iOS 17",
              build: "Titanium",
              colors: [
                "Natural Titanium",
                "Blue Titanium",
                "White Titanium",
                "Black Titanium",
              ],
            },
            rating: 4.6,
            year: 2023,
          },
          {
            name: "iPhone 15",
            variants: ["128GB", "256GB", "512GB"],
            basePrice: 79900,
            specs: {
              display: "6.1 inch Super Retina XDR",
              processor: "A16 Bionic",
              camera: "48MP Dual Camera System",
              battery: "3349mAh",
              os: "iOS 17",
              build: "Aluminum",
              colors: ["Pink", "Yellow", "Green", "Blue", "Black"],
            },
            rating: 4.4,
            year: 2023,
          },
          {
            name: "iPhone 15 Plus",
            variants: ["128GB", "256GB", "512GB"],
            basePrice: 89900,
            specs: {
              display: "6.7 inch Super Retina XDR",
              processor: "A16 Bionic",
              camera: "48MP Dual Camera System",
              battery: "4383mAh",
              os: "iOS 17",
              build: "Aluminum",
              colors: ["Pink", "Yellow", "Green", "Blue", "Black"],
            },
            rating: 4.3,
            year: 2023,
          },
          {
            name: "iPhone 14 Pro Max",
            variants: ["128GB", "256GB", "512GB", "1TB"],
            basePrice: 129900,
            specs: {
              display: "6.7 inch Super Retina XDR",
              processor: "A16 Bionic",
              camera: "48MP Triple Camera System",
              battery: "4323mAh",
              os: "iOS 16",
              build: "Stainless Steel",
              colors: ["Deep Purple", "Gold", "Silver", "Space Black"],
            },
            rating: 4.5,
            year: 2022,
          },
          {
            name: "iPhone 14 Pro",
            variants: ["128GB", "256GB", "512GB", "1TB"],
            basePrice: 119900,
            specs: {
              display: "6.1 inch Super Retina XDR",
              processor: "A16 Bionic",
              camera: "48MP Triple Camera System",
              battery: "3200mAh",
              os: "iOS 16",
              build: "Stainless Steel",
              colors: ["Deep Purple", "Gold", "Silver", "Space Black"],
            },
            rating: 4.4,
            year: 2022,
          },
          {
            name: "iPhone 14",
            variants: ["128GB", "256GB", "512GB"],
            basePrice: 69900,
            specs: {
              display: "6.1 inch Super Retina XDR",
              processor: "A15 Bionic",
              camera: "12MP Dual Camera System",
              battery: "3279mAh",
              os: "iOS 16",
              build: "Aluminum",
              colors: [
                "Blue",
                "Purple",
                "Yellow",
                "Midnight",
                "Starlight",
                "Red",
              ],
            },
            rating: 4.2,
            year: 2022,
          },
          {
            name: "iPhone 14 Plus",
            variants: ["128GB", "256GB", "512GB"],
            basePrice: 79900,
            specs: {
              display: "6.7 inch Super Retina XDR",
              processor: "A15 Bionic",
              camera: "12MP Dual Camera System",
              battery: "4325mAh",
              os: "iOS 16",
              build: "Aluminum",
              colors: [
                "Blue",
                "Purple",
                "Yellow",
                "Midnight",
                "Starlight",
                "Red",
              ],
            },
            rating: 4.1,
            year: 2022,
          },
          {
            name: "iPhone 13 Pro Max",
            variants: ["128GB", "256GB", "512GB", "1TB"],
            basePrice: 109900,
            specs: {
              display: "6.7 inch Super Retina XDR",
              processor: "A15 Bionic",
              camera: "12MP Triple Camera System",
              battery: "4352mAh",
              os: "iOS 15",
              build: "Stainless Steel",
              colors: [
                "Alpine Green",
                "Gold",
                "Silver",
                "Graphite",
                "Sierra Blue",
              ],
            },
            rating: 4.6,
            year: 2021,
          },
          {
            name: "iPhone 13 Pro",
            variants: ["128GB", "256GB", "512GB", "1TB"],
            basePrice: 99900,
            specs: {
              display: "6.1 inch Super Retina XDR",
              processor: "A15 Bionic",
              camera: "12MP Triple Camera System",
              battery: "3095mAh",
              os: "iOS 15",
              build: "Stainless Steel",
              colors: [
                "Alpine Green",
                "Gold",
                "Silver",
                "Graphite",
                "Sierra Blue",
              ],
            },
            rating: 4.5,
            year: 2021,
          },
          {
            name: "iPhone 13",
            variants: ["128GB", "256GB", "512GB"],
            basePrice: 59900,
            specs: {
              display: "6.1 inch Super Retina XDR",
              processor: "A15 Bionic",
              camera: "12MP Dual Camera System",
              battery: "3227mAh",
              os: "iOS 15",
              build: "Aluminum",
              colors: ["Pink", "Blue", "Midnight", "Starlight", "Red"],
            },
            rating: 4.3,
            year: 2021,
          },
          {
            name: "iPhone 13 mini",
            variants: ["128GB", "256GB", "512GB"],
            basePrice: 49900,
            specs: {
              display: "5.4 inch Super Retina XDR",
              processor: "A15 Bionic",
              camera: "12MP Dual Camera System",
              battery: "2438mAh",
              os: "iOS 15",
              build: "Aluminum",
              colors: ["Pink", "Blue", "Midnight", "Starlight", "Red"],
            },
            rating: 4.2,
            year: 2021,
          },
        ],
      },
      Samsung: {
        models: [
          {
            name: "Galaxy S24 Ultra",
            variants: ["256GB", "512GB", "1TB"],
            basePrice: 129999,
            specs: {
              display: "6.8 inch Dynamic AMOLED 2X",
              processor: "Snapdragon 8 Gen 3",
              camera: "200MP Quad Camera System",
              battery: "5000mAh",
              os: "Android 14",
              build: "Titanium",
              colors: [
                "Titanium Black",
                "Titanium Gray",
                "Titanium Violet",
                "Titanium Yellow",
              ],
            },
            rating: 4.4,
            year: 2024,
          },
          {
            name: "Galaxy S24+",
            variants: ["256GB", "512GB"],
            basePrice: 99999,
            specs: {
              display: "6.7 inch Dynamic AMOLED 2X",
              processor: "Snapdragon 8 Gen 3",
              camera: "50MP Triple Camera System",
              battery: "4900mAh",
              os: "Android 14",
              build: "Aluminum",
              colors: [
                "Onyx Black",
                "Marble Gray",
                "Cobalt Violet",
                "Amber Yellow",
              ],
            },
            rating: 4.3,
            year: 2024,
          },
          {
            name: "Galaxy S24",
            variants: ["128GB", "256GB"],
            basePrice: 79999,
            specs: {
              display: "6.2 inch Dynamic AMOLED 2X",
              processor: "Snapdragon 8 Gen 3",
              camera: "50MP Triple Camera System",
              battery: "4000mAh",
              os: "Android 14",
              build: "Aluminum",
              colors: [
                "Onyx Black",
                "Marble Gray",
                "Cobalt Violet",
                "Amber Yellow",
              ],
            },
            rating: 4.2,
            year: 2024,
          },
          {
            name: "Galaxy Z Fold6",
            variants: ["256GB", "512GB", "1TB"],
            basePrice: 164999,
            specs: {
              display: "7.6 inch Foldable Dynamic AMOLED 2X",
              processor: "Snapdragon 8 Gen 3",
              camera: "50MP Triple Camera System",
              battery: "4400mAh",
              os: "Android 14",
              build: "Aluminum",
              colors: ["Silver Shadow", "Pink", "Navy"],
            },
            rating: 4.1,
            year: 2024,
          },
          {
            name: "Galaxy Z Flip6",
            variants: ["256GB", "512GB"],
            basePrice: 109999,
            specs: {
              display: "6.7 inch Foldable Dynamic AMOLED 2X",
              processor: "Snapdragon 8 Gen 3",
              camera: "50MP Dual Camera System",
              battery: "4000mAh",
              os: "Android 14",
              build: "Aluminum",
              colors: ["Silver Shadow", "Yellow", "Mint", "Blue"],
            },
            rating: 4.0,
            year: 2024,
          },
          {
            name: "Galaxy S23 Ultra",
            variants: ["256GB", "512GB", "1TB"],
            basePrice: 124999,
            specs: {
              display: "6.8 inch Dynamic AMOLED 2X",
              processor: "Snapdragon 8 Gen 2",
              camera: "200MP Quad Camera System",
              battery: "5000mAh",
              os: "Android 13",
              build: "Aluminum",
              colors: ["Phantom Black", "Green", "Cream", "Lavender"],
            },
            rating: 4.5,
            year: 2023,
          },
          {
            name: "Galaxy A55 5G",
            variants: ["128GB", "256GB"],
            basePrice: 39999,
            specs: {
              display: "6.6 inch Super AMOLED",
              processor: "Exynos 1480",
              camera: "50MP Triple Camera System",
              battery: "5000mAh",
              os: "Android 14",
              build: "Aluminum",
              colors: [
                "Awesome Iceblue",
                "Awesome Lilac",
                "Awesome Navy",
                "Awesome Lemon",
              ],
            },
            rating: 4.1,
            year: 2024,
          },
          {
            name: "Galaxy A35 5G",
            variants: ["128GB", "256GB"],
            basePrice: 30999,
            specs: {
              display: "6.6 inch Super AMOLED",
              processor: "Exynos 1380",
              camera: "50MP Triple Camera System",
              battery: "5000mAh",
              os: "Android 14",
              build: "Plastic",
              colors: [
                "Awesome Iceblue",
                "Awesome Lilac",
                "Awesome Navy",
                "Awesome Lemon",
              ],
            },
            rating: 4.0,
            year: 2024,
          },
          {
            name: "Galaxy A25 5G",
            variants: ["128GB", "256GB"],
            basePrice: 26999,
            specs: {
              display: "6.5 inch Super AMOLED",
              processor: "Exynos 1280",
              camera: "50MP Triple Camera System",
              battery: "5000mAh",
              os: "Android 14",
              build: "Plastic",
              colors: ["Blue Black", "Light Blue", "Yellow"],
            },
            rating: 3.9,
            year: 2024,
          },
          {
            name: "Galaxy A15 5G",
            variants: ["128GB"],
            basePrice: 18999,
            specs: {
              display: "6.5 inch Super AMOLED",
              processor: "MediaTek Dimensity 6100+",
              camera: "50MP Triple Camera System",
              battery: "5000mAh",
              os: "Android 14",
              build: "Plastic",
              colors: ["Blue Black", "Light Blue", "Yellow"],
            },
            rating: 3.8,
            year: 2024,
          },
        ],
      },
      OnePlus: {
        models: [
          {
            name: "OnePlus 12",
            variants: ["256GB", "512GB"],
            basePrice: 64999,
            specs: {
              display: "6.82 inch LTPO AMOLED",
              processor: "Snapdragon 8 Gen 3",
              camera: "50MP Triple Camera System",
              battery: "5400mAh",
              os: "Android 14",
              build: "Glass",
              colors: ["Silky Black", "Flowy Emerald", "Glacial White"],
            },
            rating: 4.4,
            year: 2024,
          },
          {
            name: "OnePlus 12R",
            variants: ["128GB", "256GB"],
            basePrice: 39999,
            specs: {
              display: "6.78 inch LTPO AMOLED",
              processor: "Snapdragon 8s Gen 3",
              camera: "50MP Triple Camera System",
              battery: "5500mAh",
              os: "Android 14",
              build: "Glass",
              colors: ["Cool Blue", "Iron Gray"],
            },
            rating: 4.3,
            year: 2024,
          },
          {
            name: "OnePlus 11 5G",
            variants: ["128GB", "256GB"],
            basePrice: 56999,
            specs: {
              display: "6.7 inch LTPO3 AMOLED",
              processor: "Snapdragon 8 Gen 2",
              camera: "50MP Triple Camera System",
              battery: "5000mAh",
              os: "Android 13",
              build: "Glass",
              colors: ["Titan Black", "Eternal Green"],
            },
            rating: 4.2,
            year: 2023,
          },
          {
            name: "OnePlus Nord CE4",
            variants: ["128GB", "256GB"],
            basePrice: 24999,
            specs: {
              display: "6.7 inch AMOLED",
              processor: "Snapdragon 7 Gen 3",
              camera: "50MP Dual Camera System",
              battery: "5500mAh",
              os: "Android 14",
              build: "Plastic",
              colors: ["Celadon Marble", "Dark Chrome"],
            },
            rating: 4.0,
            year: 2024,
          },
          {
            name: "OnePlus Nord 3 5G",
            variants: ["128GB", "256GB"],
            basePrice: 33999,
            specs: {
              display: "6.74 inch AMOLED",
              processor: "MediaTek Dimensity 9000",
              camera: "50MP Triple Camera System",
              battery: "5000mAh",
              os: "Android 13",
              build: "Glass",
              colors: ["Misty Green", "Tempest Gray"],
            },
            rating: 4.1,
            year: 2023,
          },
        ],
      },
      Xiaomi: {
        models: [
          {
            name: "Xiaomi 14",
            variants: ["256GB", "512GB"],
            basePrice: 69999,
            specs: {
              display: "6.36 inch LTPO OLED",
              processor: "Snapdragon 8 Gen 3",
              camera: "50MP Triple Camera System",
              battery: "4610mAh",
              os: "Android 14",
              build: "Glass",
              colors: ["Black", "White", "Green", "Pink"],
            },
            rating: 4.2,
            year: 2024,
          },
          {
            name: "Xiaomi 14 Pro",
            variants: ["256GB", "512GB", "1TB"],
            basePrice: 79999,
            specs: {
              display: "6.73 inch LTPO OLED",
              processor: "Snapdragon 8 Gen 3",
              camera: "50MP Triple Camera System",
              battery: "4880mAh",
              os: "Android 14",
              build: "Glass",
              colors: ["Black", "White", "Titanium"],
            },
            rating: 4.3,
            year: 2024,
          },
          {
            name: "Redmi Note 13 Pro+",
            variants: ["256GB", "512GB"],
            basePrice: 31999,
            specs: {
              display: "6.67 inch AMOLED",
              processor: "MediaTek Dimensity 7200 Ultra",
              camera: "200MP Triple Camera System",
              battery: "5000mAh",
              os: "Android 13",
              build: "Glass",
              colors: ["Midnight Black", "Fusion Purple", "Fusion White"],
            },
            rating: 4.1,
            year: 2024,
          },
          {
            name: "Redmi Note 13 Pro",
            variants: ["128GB", "256GB"],
            basePrice: 23999,
            specs: {
              display: "6.67 inch AMOLED",
              processor: "Snapdragon 7s Gen 2",
              camera: "200MP Triple Camera System",
              battery: "5100mAh",
              os: "Android 13",
              build: "Glass",
              colors: ["Midnight Black", "Ocean Teal", "Prism Blue"],
            },
            rating: 4.0,
            year: 2024,
          },
          {
            name: "Redmi Note 13",
            variants: ["128GB", "256GB"],
            basePrice: 17999,
            specs: {
              display: "6.67 inch AMOLED",
              processor: "Snapdragon 685",
              camera: "108MP Triple Camera System",
              battery: "5000mAh",
              os: "Android 13",
              build: "Plastic",
              colors: ["Midnight Black", "Ocean Teal", "Prism Blue"],
            },
            rating: 3.9,
            year: 2024,
          },
          {
            name: "POCO X6 Pro",
            variants: ["256GB", "512GB"],
            basePrice: 26999,
            specs: {
              display: "6.67 inch AMOLED",
              processor: "MediaTek Dimensity 8300 Ultra",
              camera: "64MP Triple Camera System",
              battery: "5000mAh",
              os: "Android 14",
              build: "Plastic",
              colors: ["Black", "Yellow", "Gray"],
            },
            rating: 4.2,
            year: 2024,
          },
        ],
      },
      Vivo: {
        models: [
          {
            name: "X200 Pro",
            variants: ["256GB", "512GB"],
            basePrice: 94999,
            specs: {
              display: "6.78 inch LTPO AMOLED",
              processor: "MediaTek Dimensity 9400",
              camera: "50MP Triple Camera System",
              battery: "6000mAh",
              os: "Android 15",
              build: "Glass",
              colors: ["Titanium Gray", "Midnight Black"],
            },
            rating: 4.0,
            year: 2024,
          },
          {
            name: "V40 Pro",
            variants: ["256GB", "512GB"],
            basePrice: 49999,
            specs: {
              display: "6.78 inch AMOLED",
              processor: "MediaTek Dimensity 9200+",
              camera: "50MP Triple Camera System",
              battery: "5500mAh",
              os: "Android 14",
              build: "Glass",
              colors: ["Ganges Blue", "Titanium Gray"],
            },
            rating: 4.0,
            year: 2024,
          },
          {
            name: "V30 Pro",
            variants: ["256GB", "512GB"],
            basePrice: 41999,
            specs: {
              display: "6.78 inch AMOLED",
              processor: "MediaTek Dimensity 8200",
              camera: "50MP Triple Camera System",
              battery: "5000mAh",
              os: "Android 14",
              build: "Glass",
              colors: ["Andaman Blue", "Classic Black"],
            },
            rating: 3.9,
            year: 2024,
          },
          {
            name: "V30",
            variants: ["128GB", "256GB"],
            basePrice: 33999,
            specs: {
              display: "6.78 inch AMOLED",
              processor: "Snapdragon 7 Gen 3",
              camera: "50MP Dual Camera System",
              battery: "5000mAh",
              os: "Android 14",
              build: "Glass",
              colors: ["Peacock Green", "Sea Blue", "Lush Green"],
            },
            rating: 3.8,
            year: 2024,
          },
          {
            name: "T3 Pro 5G",
            variants: ["128GB", "256GB"],
            basePrice: 24999,
            specs: {
              display: "6.77 inch AMOLED",
              processor: "Snapdragon 7 Gen 3",
              camera: "50MP Dual Camera System",
              battery: "5500mAh",
              os: "Android 14",
              build: "Plastic",
              colors: ["Forest Green", "Purple Rush"],
            },
            rating: 3.9,
            year: 2024,
          },
        ],
      },
      Realme: {
        models: [
          {
            name: "GT 6",
            variants: ["256GB", "512GB"],
            basePrice: 40999,
            specs: {
              display: "6.78 inch LTPO AMOLED",
              processor: "Snapdragon 8s Gen 3",
              camera: "50MP Triple Camera System",
              battery: "5500mAh",
              os: "Android 14",
              build: "Glass",
              colors: ["Fluid Silver", "Razor Green"],
            },
            rating: 4.1,
            year: 2024,
          },
          {
            name: "12 Pro+",
            variants: ["256GB", "512GB"],
            basePrice: 29999,
            specs: {
              display: "6.7 inch AMOLED",
              processor: "MediaTek Dimensity 7050",
              camera: "200MP Triple Camera System",
              battery: "5000mAh",
              os: "Android 14",
              build: "Glass",
              colors: ["Navigator Beige", "Submarine Blue"],
            },
            rating: 4.0,
            year: 2024,
          },
          {
            name: "12 Pro",
            variants: ["128GB", "256GB"],
            basePrice: 25999,
            specs: {
              display: "6.7 inch AMOLED",
              processor: "Snapdragon 6 Gen 1",
              camera: "108MP Triple Camera System",
              battery: "5000mAh",
              os: "Android 14",
              build: "Plastic",
              colors: ["Woodland Green", "Astral Black"],
            },
            rating: 3.9,
            year: 2024,
          },
          {
            name: "P1 Speed 5G",
            variants: ["128GB", "256GB"],
            basePrice: 15999,
            specs: {
              display: "6.67 inch IPS LCD",
              processor: "MediaTek Dimensity 7050",
              camera: "108MP Dual Camera System",
              battery: "5000mAh",
              os: "Android 14",
              build: "Plastic",
              colors: ["Purple", "Green"],
            },
            rating: 3.8,
            year: 2024,
          },
        ],
      },
      Nothing: {
        models: [
          {
            name: "Phone (2a) Plus",
            variants: ["256GB"],
            basePrice: 27999,
            specs: {
              display: "6.7 inch AMOLED",
              processor: "MediaTek Dimensity 7350 Pro",
              camera: "50MP Dual Camera System",
              battery: "5000mAh",
              os: "Android 14",
              build: "Plastic",
              colors: ["Grey", "Black"],
            },
            rating: 4.1,
            year: 2024,
          },
          {
            name: "Phone (2a)",
            variants: ["128GB", "256GB"],
            basePrice: 23999,
            specs: {
              display: "6.7 inch AMOLED",
              processor: "MediaTek Dimensity 7200 Pro",
              camera: "50MP Dual Camera System",
              battery: "5000mAh",
              os: "Android 14",
              build: "Plastic",
              colors: ["White", "Black", "Blue"],
            },
            rating: 4.0,
            year: 2024,
          },
          {
            name: "Phone (2)",
            variants: ["128GB", "256GB", "512GB"],
            basePrice: 44999,
            specs: {
              display: "6.7 inch LTPO OLED",
              processor: "Snapdragon 8+ Gen 1",
              camera: "50MP Dual Camera System",
              battery: "4700mAh",
              os: "Android 13",
              build: "Glass",
              colors: ["White", "Dark Grey"],
            },
            rating: 4.1,
            year: 2023,
          },
          {
            name: "Phone (1)",
            variants: ["128GB", "256GB"],
            basePrice: 32999,
            specs: {
              display: "6.55 inch OLED",
              processor: "Snapdragon 778G+",
              camera: "50MP Dual Camera System",
              battery: "4500mAh",
              os: "Android 12",
              build: "Glass",
              colors: ["White", "Black"],
            },
            rating: 4.0,
            year: 2022,
          },
        ],
      },
      Oppo: {
        models: [
          {
            name: "Reno12 Pro 5G",
            variants: ["256GB", "512GB"],
            basePrice: 36999,
            specs: {
              display: "6.7 inch AMOLED",
              processor: "MediaTek Dimensity 7300 Energy",
              camera: "50MP Triple Camera System",
              battery: "5000mAh",
              os: "Android 14",
              build: "Glass",
              colors: ["Space Brown", "Sunset Peach", "Silver"],
            },
            rating: 3.9,
            year: 2024,
          },
          {
            name: "Reno12 5G",
            variants: ["128GB", "256GB"],
            basePrice: 32999,
            specs: {
              display: "6.7 inch AMOLED",
              processor: "MediaTek Dimensity 7300 Energy",
              camera: "50MP Triple Camera System",
              battery: "5000mAh",
              os: "Android 14",
              build: "Glass",
              colors: ["Astro Silver", "Sunset Peach"],
            },
            rating: 3.8,
            year: 2024,
          },
          {
            name: "F27 Pro+ 5G",
            variants: ["128GB", "256GB"],
            basePrice: 27999,
            specs: {
              display: "6.7 inch AMOLED",
              processor: "MediaTek Dimensity 7050",
              camera: "64MP Triple Camera System",
              battery: "5000mAh",
              os: "Android 14",
              build: "Plastic",
              colors: ["Dusk Pink", "Midnight Navy"],
            },
            rating: 3.7,
            year: 2024,
          },
        ],
      },
      Google: {
        models: [
          {
            name: "Pixel 9 Pro XL",
            variants: ["128GB", "256GB", "512GB", "1TB"],
            basePrice: 124900,
            specs: {
              display: "6.8 inch LTPO OLED",
              processor: "Google Tensor G4",
              camera: "50MP Triple Camera System",
              battery: "5060mAh",
              os: "Android 14",
              build: "Glass",
              colors: ["Obsidian", "Porcelain", "Hazel", "Rose Quartz"],
            },
            rating: 4.4,
            year: 2024,
          },
          {
            name: "Pixel 9 Pro",
            variants: ["128GB", "256GB", "512GB"],
            basePrice: 109900,
            specs: {
              display: "6.3 inch LTPO OLED",
              processor: "Google Tensor G4",
              camera: "50MP Triple Camera System",
              battery: "4700mAh",
              os: "Android 14",
              build: "Glass",
              colors: ["Obsidian", "Porcelain", "Hazel", "Rose Quartz"],
            },
            rating: 4.3,
            year: 2024,
          },
          {
            name: "Pixel 9",
            variants: ["128GB", "256GB"],
            basePrice: 79900,
            specs: {
              display: "6.3 inch OLED",
              processor: "Google Tensor G4",
              camera: "50MP Dual Camera System",
              battery: "4700mAh",
              os: "Android 14",
              build: "Glass",
              colors: ["Obsidian", "Porcelain", "Wintergreen", "Peony"],
            },
            rating: 4.2,
            year: 2024,
          },
          {
            name: "Pixel 8a",
            variants: ["128GB", "256GB"],
            basePrice: 52999,
            specs: {
              display: "6.1 inch OLED",
              processor: "Google Tensor G3",
              camera: "64MP Dual Camera System",
              battery: "4492mAh",
              os: "Android 14",
              build: "Plastic",
              colors: ["Obsidian", "Porcelain", "Bay", "Aloe"],
            },
            rating: 4.1,
            year: 2024,
          },
        ],
      },
      Motorola: {
        models: [
          {
            name: "Edge 50 Pro",
            variants: ["256GB", "512GB"],
            basePrice: 31999,
            specs: {
              display: "6.7 inch pOLED",
              processor: "Snapdragon 7 Gen 3",
              camera: "50MP Triple Camera System",
              battery: "4500mAh",
              os: "Android 14",
              build: "Glass",
              colors: ["Moonlight Pearl", "Black Beauty", "Luxe Lavender"],
            },
            rating: 4.0,
            year: 2024,
          },
          {
            name: "Edge 50 Ultra",
            variants: ["512GB", "1TB"],
            basePrice: 59999,
            specs: {
              display: "6.7 inch pOLED",
              processor: "Snapdragon 8s Gen 3",
              camera: "50MP Triple Camera System",
              battery: "4500mAh",
              os: "Android 14",
              build: "Glass",
              colors: ["Forest Grey", "Peach Fuzz", "Nordic Wood"],
            },
            rating: 4.1,
            year: 2024,
          },
          {
            name: "G85 5G",
            variants: ["128GB", "256GB"],
            basePrice: 17999,
            specs: {
              display: "6.67 inch pOLED",
              processor: "Snapdragon 6s Gen 3",
              camera: "50MP Dual Camera System",
              battery: "5000mAh",
              os: "Android 14",
              build: "Plastic",
              colors: ["Olive Green", "Urban Grey", "Cobalt Blue"],
            },
            rating: 3.9,
            year: 2024,
          },
        ],
      },
    };
  }

  /**
   * Generate comprehensive phone data
   */
  async generateComprehensivePhoneData() {
    console.log("📱 Generating comprehensive phone database...");

    const allPhones = [];

    for (const [brand, data] of Object.entries(this.phoneDatabase)) {
      console.log(`📱 Processing ${brand} phones...`);

      for (const model of data.models) {
        // Generate variants for each storage option
        for (const storage of model.variants) {
          const storageMultiplier = this.getStorageMultiplier(storage);
          const finalPrice = Math.round(model.basePrice * storageMultiplier);

          // Add some price variation for realism
          const priceVariation = 1 + (Math.random() - 0.5) * 0.1; // ±5%
          const marketPrice = Math.round(finalPrice * priceVariation);

          const phone = {
            name: `${model.name} ${storage}`,
            brand: brand,
            specs: {
              ...model.specs,
              ram: this.getRAMForStorage(storage),
              storage: storage,
              year: model.year,
            },
            price: marketPrice,
            rating: model.rating + (Math.random() - 0.5) * 0.2, // Small rating variation
            imageUrl: `/assets/phones/${model.name
              .toLowerCase()
              .replace(/\s+/g, "-")}.jpg`,
            affiliateLink: this.generateAffiliateLink(
              brand,
              model.name,
              storage
            ),
            source: "comprehensive_db",
            lastUpdated: new Date(),
            priceHistory: [
              {
                price: marketPrice,
                date: new Date(),
                source: "market_data",
              },
            ],
          };

          allPhones.push(phone);
        }
      }
    }

    // Add some additional variants and special editions
    const additionalPhones = await this.generateSpecialEditions(allPhones);
    allPhones.push(...additionalPhones);

    console.log(`✅ Generated ${allPhones.length} comprehensive phone entries`);
    return allPhones;
  }

  /**
   * Generate special editions and color variants
   */
  async generateSpecialEditions(basePhones) {
    const specialEditions = [];

    // Select popular models for special editions
    const popularModels = basePhones.filter(
      (phone) =>
        phone.rating > 4.2 &&
        (phone.name.includes("Pro") ||
          phone.name.includes("Ultra") ||
          phone.brand === "Apple")
    );

    for (const phone of popularModels.slice(0, 20)) {
      // Create limited edition variant
      const specialPhone = {
        ...phone,
        name: `${phone.name} Limited Edition`,
        price: Math.round(phone.price * 1.15), // 15% premium
        specs: {
          ...phone.specs,
          colors: [
            ...(phone.specs.colors || []),
            "Limited Gold",
            "Exclusive Silver",
          ],
        },
        rating: Math.min(5.0, phone.rating + 0.1),
        affiliateLink: phone.affiliateLink.replace("/", "/limited-edition-"),
      };

      specialEditions.push(specialPhone);
    }

    return specialEditions;
  }

  /**
   * Get storage multiplier for pricing
   */
  getStorageMultiplier(storage) {
    const baseStorage = {
      "64GB": 1.0,
      "128GB": 1.1,
      "256GB": 1.3,
      "512GB": 1.6,
      "1TB": 2.0,
    };

    return baseStorage[storage] || 1.0;
  }

  /**
   * Get RAM based on storage tier
   */
  getRAMForStorage(storage) {
    if (storage === "1TB") return "12GB";
    if (storage === "512GB") return "12GB";
    if (storage === "256GB") return "8GB";
    if (storage === "128GB") return "6GB";
    return "4GB";
  }

  /**
   * Generate realistic affiliate links
   */
  generateAffiliateLink(brand, model, storage) {
    const sources = [
      "amazon.in",
      "flipkart.com",
      "croma.com",
      "reliancedigital.in",
    ];
    const source = sources[Math.floor(Math.random() * sources.length)];
    const slug = `${brand}-${model}-${storage}`
      .toLowerCase()
      .replace(/\s+/g, "-");

    return `https://www.${source}/dp/${slug}`;
  }

  /**
   * Get real-time market prices (simulated with realistic variations)
   */
  async getMarketPrices(phoneName, brand) {
    // Simulate market price variations
    const basePrice = this.getBasePriceEstimate(phoneName, brand);

    const prices = {
      amazon: {
        price: Math.round(basePrice * (1 + (Math.random() - 0.5) * 0.15)),
        availability: Math.random() > 0.1 ? "in-stock" : "out-of-stock",
        seller: "Amazon India",
      },
      flipkart: {
        price: Math.round(basePrice * (1 + (Math.random() - 0.5) * 0.12)),
        availability: Math.random() > 0.15 ? "in-stock" : "limited-stock",
        seller: "Flipkart",
      },
      croma: {
        price: Math.round(basePrice * (1 + (Math.random() - 0.5) * 0.1)),
        availability: Math.random() > 0.2 ? "in-stock" : "out-of-stock",
        seller: "Croma",
      },
    };

    return prices;
  }

  /**
   * Estimate base price for a phone
   */
  getBasePriceEstimate(phoneName, brand) {
    // Simplified price estimation based on brand and model indicators
    let basePrice = 25000; // Default mid-range price

    if (brand === "Apple") {
      if (phoneName.includes("Pro Max")) basePrice = 120000;
      else if (phoneName.includes("Pro")) basePrice = 100000;
      else if (phoneName.includes("Plus")) basePrice = 80000;
      else basePrice = 70000;
    } else if (brand === "Samsung") {
      if (phoneName.includes("Ultra")) basePrice = 110000;
      else if (phoneName.includes("Pro")) basePrice = 90000;
      else if (phoneName.includes("Plus")) basePrice = 70000;
      else if (phoneName.includes("Galaxy S")) basePrice = 60000;
      else basePrice = 30000;
    } else if (brand === "OnePlus") {
      if (phoneName.includes("Pro")) basePrice = 60000;
      else if (phoneName.includes("R")) basePrice = 35000;
      else basePrice = 45000;
    }

    // Adjust for storage
    if (phoneName.includes("1TB")) basePrice *= 1.5;
    else if (phoneName.includes("512GB")) basePrice *= 1.3;
    else if (phoneName.includes("256GB")) basePrice *= 1.15;

    return basePrice;
  }

  /**
   * Cache comprehensive phone data
   */
  setCachedPhoneData(phones) {
    this.cache.set("comprehensive_phones", {
      data: phones,
      timestamp: Date.now(),
    });
  }

  /**
   * Get cached comprehensive phone data
   */
  getCachedPhoneData() {
    const cached = this.cache.get("comprehensive_phones");
    if (cached && Date.now() - cached.timestamp < 24 * 60 * 60 * 1000) {
      return cached.data;
    }
    return null;
  }
}

module.exports = new ComprehensivePhoneDataService();
