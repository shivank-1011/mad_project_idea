const { PrismaClient } = require("../generated/prisma");
const apiKeyManager = require("../services/apiKeyManager");
const prisma = new PrismaClient();

// Check if API Key Manager has keys
if (!apiKeyManager.hasKeys()) {
  console.warn(
    "⚠️  No Google API keys configured. AI recommendations will use rule-based fallback."
  );
  console.warn(
    "💡 Add API keys to .env: GOOGLE_API_KEY, GOOGLE_API_KEY_1, GOOGLE_API_KEY_2, etc."
  );
} else {
  console.log(
    `✅ API Key Manager ready with ${apiKeyManager.getKeyCount()} key(s)`
  );
}

// Helper function to format phone data for AI
function formatPhoneForAI(phone) {
  return {
    name: `${phone.brand} ${phone.name}`,
    brand: phone.brand,
    price: `₹${phone.price}`,
    rating: phone.rating || "N/A",
    specs: {
      display: phone.specs.display || "Not specified",
      cpu: phone.specs.cpu || "Not specified",
      rearCamera: phone.specs.rearCamera || "Not specified",
      frontCamera: phone.specs.frontCamera || "Not specified",
      ramAndStorage: phone.specs.ramAndStorage || "Not specified",
      battery: phone.specs.batteryAndCharging || "Not specified",
      os: phone.specs.operatingSystem || "Not specified",
    },
    expertView: phone.expertView || "No expert review available",
  };
}

// Rule-based recommendation fallback
function getRuleBasedRecommendation(query, phones) {
  const lowerQuery = query.toLowerCase();
  let filteredPhones = [...phones];

  // Budget detection
  const budgetMatch = query.match(
    /(?:under|below|less than|within|max|maximum|budget)\s*(?:rs\.?|₹|rupees?)?\s*(\d+)(?:k|thousand)?/i
  );
  let maxBudget = null;
  if (budgetMatch) {
    const amount = parseInt(budgetMatch[1]);
    maxBudget =
      budgetMatch[0].toLowerCase().includes("k") ||
      budgetMatch[0].toLowerCase().includes("thousand")
        ? amount * 1000
        : amount;
    filteredPhones = filteredPhones.filter((p) => p.price <= maxBudget);
  }

  // Brand preference
  const brands = [
    "apple",
    "samsung",
    "oneplus",
    "xiaomi",
    "realme",
    "oppo",
    "vivo",
    "nothing",
    "google",
    "motorola",
  ];
  const mentionedBrand = brands.find((brand) => lowerQuery.includes(brand));
  if (mentionedBrand) {
    filteredPhones = filteredPhones.filter((p) =>
      p.brand.toLowerCase().includes(mentionedBrand)
    );
  }

  // Use case detection
  const useCases = {
    gaming: ["gaming", "games", "pubg", "cod", "fps", "performance"],
    camera: [
      "camera",
      "photography",
      "photo",
      "pictures",
      "selfie",
      "portrait",
    ],
    battery: ["battery", "backup", "charge", "charging", "long lasting"],
    display: [
      "display",
      "screen",
      "amoled",
      "oled",
      "refresh rate",
      "120hz",
      "90hz",
    ],
    storage: ["storage", "gb", "memory", "space", "photos", "videos"],
  };

  let priorityFeature = null;
  for (const [feature, keywords] of Object.entries(useCases)) {
    if (keywords.some((keyword) => lowerQuery.includes(keyword))) {
      priorityFeature = feature;
      break;
    }
  }

  // Sort based on priority
  if (priorityFeature === "gaming" || priorityFeature === "performance") {
    filteredPhones.sort((a, b) => {
      const scoreA = (a.rating || 0) * 0.5 + a.price / 100000;
      const scoreB = (b.rating || 0) * 0.5 + b.price / 100000;
      return scoreB - scoreA;
    });
  } else if (priorityFeature === "battery") {
    filteredPhones.sort((a, b) => {
      const batteryA = parseInt(
        a.specs.batteryAndCharging?.match(/\d+/)?.[0] || 0
      );
      const batteryB = parseInt(
        b.specs.batteryAndCharging?.match(/\d+/)?.[0] || 0
      );
      return batteryB - batteryA;
    });
  } else {
    // Default: sort by rating and price value
    filteredPhones.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }

  // Get top 3 recommendations
  const topPhones = filteredPhones.slice(0, 3);

  if (topPhones.length === 0) {
    return "I couldn't find any phones matching your specific criteria. Could you please adjust your requirements? For example, try increasing your budget or being less specific about features.";
  }

  // Build response
  let response = `Based on your query "${query}", here are my top recommendations:\n\n`;

  topPhones.forEach((phone, index) => {
    response += `${index + 1}. **${phone.brand} ${
      phone.name
    }** - ₹${phone.price.toLocaleString()}\n`;
    response += `   📱 Display: ${phone.specs.display || "Not specified"}\n`;
    response += `   🔋 Battery: ${
      phone.specs.batteryAndCharging || "Not specified"
    }\n`;
    response += `   📷 Camera: ${phone.specs.rearCamera || "Not specified"}\n`;
    response += `   💾 RAM/Storage: ${
      phone.specs.ramAndStorage || "Not specified"
    }\n`;
    if (phone.rating) {
      response += `   ⭐ Rating: ${phone.rating}/5\n`;
    }
    if (phone.expertView) {
      const shortReview =
        phone.expertView.substring(0, 150) +
        (phone.expertView.length > 150 ? "..." : "");
      response += `   💬 Expert: ${shortReview}\n`;
    }
    response += `\n`;
  });

  if (priorityFeature) {
    response += `\nℹ️ These recommendations are optimized for ${priorityFeature}.`;
  }

  if (maxBudget) {
    response += `\n💰 All recommendations are within your budget of ₹${maxBudget.toLocaleString()}.`;
  }

  response += `\n\nWould you like more details about any of these phones?`;

  return response;
}

exports.getRecommendation = async (req, res) => {
  const { userPreferences } = req.body;
  const query = userPreferences?.query || "";
  const conversationHistory = userPreferences?.conversationHistory || [];

  try {
    console.log("🤖 AI Recommendation request:", query);

    // Fetch available phones from database
    const phones = await prisma.product.findMany({
      orderBy: [{ rating: "desc" }, { price: "asc" }],
      take: 100, // Increased to 100 for better selection
    });

    console.log(`📱 Found ${phones.length} phones in database`);

    // Declare variables in outer scope so they're accessible in catch block
    let relevantPhones = phones.slice(0, 30);
    let filterApplied = false;

    // If Google AI is not configured, use rule-based system
    if (!apiKeyManager.hasKeys()) {
      console.log(
        "⚠️ Google AI not configured, using rule-based recommendations"
      );
      const recommendation = getRuleBasedRecommendation(query, phones);
      return res.json({
        message: recommendation,
        recommendations: relevantPhones.slice(0, 5),
      });
    }

    // Use Google Gemini AI for more intelligent recommendations
    try {
      // Prepare phone data for AI - dynamically select relevant phones with smart filtering
      relevantPhones = phones.slice(0, 30);
      filterApplied = false;

      // Extract budget from query for better phone selection
      const budgetMatch = query.match(
        /(?:under|below|less than|within|max|maximum|budget|around|about)\s*(?:rs\.?|₹|rupees?)?\s*(\d+)(?:k|thousand|lakh)?/i
      );

      if (budgetMatch) {
        const amount = parseInt(budgetMatch[1]);
        let maxBudget;

        if (budgetMatch[0].toLowerCase().includes("lakh")) {
          maxBudget = amount * 100000;
        } else if (
          budgetMatch[0].toLowerCase().includes("k") ||
          budgetMatch[0].toLowerCase().includes("thousand")
        ) {
          maxBudget = amount * 1000;
        } else {
          maxBudget = amount;
        }

        // Filter phones by budget with 10% margin
        const budgetMargin = maxBudget * 1.1; // 10% above budget for "just above" suggestions
        relevantPhones = phones
          .filter((p) => p.price <= budgetMargin)
          .sort((a, b) => {
            // Prioritize phones within exact budget, then slightly above
            const aWithin = a.price <= maxBudget;
            const bWithin = b.price <= maxBudget;
            if (aWithin && !bWithin) return -1;
            if (!aWithin && bWithin) return 1;
            return b.rating - a.rating; // Then by rating
          })
          .slice(0, 40);

        filterApplied = true;
        console.log(
          `� Budget filter: Found ${relevantPhones.length} phones within ₹${maxBudget} (±10%)`
        );
      }

      // Detect use case from query for smart filtering
      const useCases = {
        gaming:
          /\b(gam(e|ing)|pubg|cod|free fire|bgmi|fps|performance|processor|snapdragon\s*8)\b/i,
        camera:
          /\b(camera|photo|photography|selfie|portrait|night mode|video|vlog|content creat)\b/i,
        battery:
          /\b(battery|charging|fast charg|power|backup|mah|last.*day)\b/i,
        display:
          /\b(display|screen|amoled|oled|refresh rate|120hz|90hz|bright)\b/i,
        budget: /\b(cheap|affordable|value|best.*price|under|budget)\b/i,
        premium: /\b(premium|flagship|best|top|luxury|expensive|high.?end)\b/i,
        student: /\b(student|college|study|learning|education)\b/i,
        business:
          /\b(business|work|office|professional|productivity|multitask)\b/i,
      };

      let detectedUseCase = null;
      for (const [useCase, pattern] of Object.entries(useCases)) {
        if (pattern.test(query)) {
          detectedUseCase = useCase;
          break;
        }
      }

      // Apply use-case specific filtering if detected and no budget filter applied
      if (detectedUseCase && !filterApplied) {
        switch (detectedUseCase) {
          case "gaming":
            relevantPhones = phones
              .filter((p) => {
                const specs = (p.specs.cpu || "").toLowerCase();
                const hasGoodProcessor =
                  specs.includes("snapdragon 8") ||
                  specs.includes("dimensity 9") ||
                  specs.includes("a15") ||
                  specs.includes("a16") ||
                  specs.includes("a17");
                const hasHighRefresh =
                  p.specs.display && /120hz|144hz|165hz/i.test(p.specs.display);
                return hasGoodProcessor || hasHighRefresh || p.rating >= 4.3;
              })
              .sort((a, b) => b.rating - a.rating)
              .slice(0, 30);
            console.log(
              `🎮 Gaming filter: Found ${relevantPhones.length} gaming-optimized phones`
            );
            break;

          case "camera":
            relevantPhones = phones
              .filter((p) => {
                const rearCam = (p.specs.rearCamera || "").toLowerCase();
                const hasGoodCamera =
                  /\b(48|50|64|108|200).*mp/i.test(rearCam) || p.rating >= 4.4;
                return hasGoodCamera;
              })
              .sort((a, b) => b.rating - a.rating)
              .slice(0, 30);
            console.log(
              `📷 Camera filter: Found ${relevantPhones.length} camera-focused phones`
            );
            break;

          case "battery":
            relevantPhones = phones
              .filter((p) => {
                const battery = (
                  p.specs.batteryAndCharging || ""
                ).toLowerCase();
                const hasGoodBattery =
                  /\b(5000|5500|6000).*mah/i.test(battery) ||
                  /\b(44|67|80|100|120)w/i.test(battery);
                return hasGoodBattery || p.rating >= 4.2;
              })
              .sort((a, b) => b.rating - a.rating)
              .slice(0, 30);
            console.log(
              `🔋 Battery filter: Found ${relevantPhones.length} battery-focused phones`
            );
            break;

          case "premium":
            relevantPhones = phones
              .filter((p) => p.price >= 50000)
              .sort((a, b) => b.rating - a.rating)
              .slice(0, 30);
            console.log(
              `✨ Premium filter: Found ${relevantPhones.length} flagship phones`
            );
            break;

          case "budget":
            relevantPhones = phones
              .filter((p) => p.price <= 20000)
              .sort((a, b) => b.rating - a.rating)
              .slice(0, 30);
            console.log(
              `💸 Budget filter: Found ${relevantPhones.length} affordable phones`
            );
            break;
        }
        filterApplied = true;
      }

      // Check for brand preference to provide more relevant phones
      const brands = [
        "apple",
        "samsung",
        "oneplus",
        "xiaomi",
        "realme",
        "oppo",
        "vivo",
        "nothing",
        "google",
        "motorola",
        "asus",
        "sony",
      ];

      // Check if it's a comparison query (contains "vs", "versus", "compare")
      const isComparison = /\b(vs|versus|compare|comparison)\b/i.test(query);
      console.log(`🔍 Query: "${query}"`);
      console.log(`📊 Is comparison: ${isComparison}`);

      // Find all mentioned brands in the query
      // Also check for "iphone" as Apple brand and "galaxy" as Samsung
      const queryLower = query.toLowerCase();
      const mentionedBrands = brands.filter((brand) =>
        queryLower.includes(brand)
      );

      // Handle common variations and typos
      const brandVariations = {
        viv0: "vivo",
        vivο: "vivo", // Greek omicron
        oppo: "oppo",
        "real me": "realme",
        realm: "realme",
        "one plus": "oneplus",
        "1plus": "oneplus",
        motorolla: "motorola",
        samsang: "samsung",
        samung: "samsung",
        "i qoo": "iqoo",
        iqo: "iqoo",
        redmi: "xiaomi", // Redmi is Xiaomi sub-brand
        poco: "xiaomi", // Poco is also Xiaomi
        mi: "xiaomi", // Mi is legacy Xiaomi branding
        cmf: "nothing", // CMF is Nothing sub-brand
      };

      // Check for brand variations and add them
      Object.entries(brandVariations).forEach(([typo, correct]) => {
        if (queryLower.includes(typo) && !mentionedBrands.includes(correct)) {
          mentionedBrands.push(correct);
          console.log(`📝 Auto-corrected "${typo}" → "${correct}"`);
        }
      });

      // Add Apple if "iphone" is mentioned but "apple" wasn't detected
      if (queryLower.includes("iphone") && !mentionedBrands.includes("apple")) {
        mentionedBrands.push("apple");
      }

      // Add Samsung if "galaxy" is mentioned but "samsung" wasn't detected
      if (
        queryLower.includes("galaxy") &&
        !mentionedBrands.includes("samsung")
      ) {
        mentionedBrands.push("samsung");
      }

      // Add Samsung if "fold" or "flip" is mentioned (Samsung foldables)
      if (
        (queryLower.includes("fold") || queryLower.includes("flip")) &&
        !queryLower.includes("foldable") && // Exclude generic "foldable" queries
        !mentionedBrands.includes("samsung")
      ) {
        mentionedBrands.push("samsung");
      }

      // Add Google if "pixel" is mentioned
      if (queryLower.includes("pixel") && !mentionedBrands.includes("google")) {
        mentionedBrands.push("google");
      }

      // Add Vivo if "V" series pattern is detected (V40, V30e)
      if (queryLower.match(/\bv\s*\d+/) && !mentionedBrands.includes("vivo")) {
        mentionedBrands.push("vivo");
      }

      // Add Nothing if "CMF" or "Phone 1/2" pattern is detected
      if (
        (queryLower.includes("cmf") || queryLower.match(/phone\s*[12]/)) &&
        !mentionedBrands.includes("nothing")
      ) {
        mentionedBrands.push("nothing");
      }
      console.log(
        `🏷️ Mentioned brands: ${mentionedBrands.join(", ") || "none"}`
      );

      // Model patterns for extracting specific phone models from the query
      const modelPatterns = [
        // iPhone patterns
        /iphone\s*(\d+\s*(?:pro\s*max|pro|mini|plus|max)?)/gi,

        // Samsung Galaxy S series
        /galaxy\s*s\s*(\d+\s*(?:ultra|plus|fe)?)/gi,
        /\bs\s*(\d{2,3})\s*(?:ultra|plus|fe)?\b/gi, // Standalone "S24 Ultra", "S23 Plus"

        // Samsung foldables (Fold/Flip)
        /(?:galaxy\s*)?(?:z\s*)?fold\s*\d*\s*(?:\d+)?\s*(?:5g)?/gi, // Fold 6, Z Fold 6, Fold6, Galaxy Z Fold
        /(?:galaxy\s*)?(?:z\s*)?flip\s*\d*\s*(?:\d+)?\s*(?:5g)?/gi, // Flip 5, Z Flip 5

        // Samsung A-series
        /galaxy\s*a\s*(\d+)\s*(?:5g)?/gi, // A35, A55, A16, A15
        /\ba\s*(\d{2})\s*(?:5g)?\b/gi, // Standalone "A35 5G", "A16"

        // Samsung M/F series
        /galaxy\s*[mf]\s*(\d+)\s*(?:5g)?/gi, // M35, F55, F15
        /\b[mf]\s*(\d{2})\s*(?:5g)?\b/gi, // Standalone "M35", "F55"

        // OnePlus main series
        /oneplus\s*(\d+\s*(?:pro|r|t)?)/gi, // OnePlus 12, 12R, 11T, 13, 13R

        // OnePlus Nord series
        /(?:oneplus\s*)?nord\s*(?:ce\s*)?(\d+)\s*(?:lite|5g)?/gi, // Nord 4, Nord CE 4, Nord CE 4 Lite
        /nord\s*ce\s*(\d+)\s*(?:lite)?/gi, // Nord CE 4 Lite

        // Xiaomi main series (including Civi)
        /xiaomi\s*(\d+\s*(?:civi|pro|lite|ultra)?)/gi, // Xiaomi 14, 14 Civi, 14 Ultra
        /\bcivi\b/gi, // Standalone "Civi"

        // Redmi Note series
        /redmi\s*note\s*(\d+)\s*(?:pro\s*(?:plus|\+)?|turbo)?(?:\s*5g)?/gi, // Note 14 Pro Plus, Note 13
        /\bnote\s*(\d+)\s*(?:pro\s*(?:plus|\+)?|turbo)?/gi, // Standalone "Note 14", "Note 13 Pro Plus"

        // Redmi/Poco other series
        /redmi\s*(\d+\s*(?:pro|c)?)/gi,
        /poco\s*([a-z]+\d+)/gi, // Poco F6, Poco M7, Poco X6, Poco X7

        // Google Pixel
        /pixel\s*(\d+\s*(?:a|pro(?:\s*xl)?|xl)?)/gi, // Pixel 9 Pro XL, Pixel 8a

        // Vivo V-series (camera-focused)
        /vivo\s*v\s*(\d+\s*(?:pro|e)?)/gi, // Vivo V40 Pro, V40e, V30, V29
        /\bv\s*(\d+\s*(?:pro|e)?)\b/gi, // Standalone "V40 Pro", "V30e"

        // Vivo T/X-series
        /vivo\s*([tx]\d+\s*(?:pro|ultra)?)/gi, // Vivo T3 Pro, X200

        // Realme GT series
        /realme\s*gt\s*(\d+\s*(?:t|pro)?)/gi, // Realme GT 6T, GT 7 Pro
        /\bgt\s*(\d+\s*(?:t|pro)?)\b/gi, // Standalone "GT 6T"

        // Realme numbered series
        /realme\s*(\d+\s*(?:pro\s*(?:plus|\+)?|plus|\+)?)/gi, // Realme 13+, 12 Plus

        // Nothing Phone series
        /nothing\s*(?:phone\s*)?(\d+\w*(?:\s*plus)?)/gi, // Nothing Phone 2a Plus, Nothing 2a
        /\bphone\s*(\d+\w*(?:\s*plus)?)\b/gi, // Standalone "Phone 2a"

        // CMF Phone
        /cmf\s*phone\s*(\d+)?/gi, // CMF Phone 1

        // Motorola Edge series
        /(?:moto|motorola)\s*(?:edge|g|e)?\s*(\d+\s*(?:pro|plus)?)/gi, // Motorola Edge 50 Pro

        // iQOO
        /iqoo\s*(?:neo\s*)?([a-z]*\d+)/gi, // iQOO Neo 9 Pro, iQOO Z9

        // OPPO
        /oppo\s*(?:reno\s*)?(\d+\s*(?:pro)?)/gi, // Oppo Reno 10 Pro
      ];

      // Helper function to find specific models in query
      const findSpecificModels = (phoneList) => {
        const specificPhones = [];
        const foundPatterns = [];

        modelPatterns.forEach((pattern) => {
          const matches = query.matchAll(pattern);
          for (const match of matches) {
            const originalMatch = match[0].toLowerCase();
            const modelSearch = originalMatch.replace(/\s+/g, "");

            const matchingPhones = phoneList.filter((p) => {
              const phoneBrand = p.brand.toLowerCase();
              const phoneName = p.name.toLowerCase();
              const fullName = phoneBrand + " " + phoneName;
              const fullNameNoSpaces = fullName.replace(/\s+/g, "");
              const phoneNameNoSpaces = phoneName.replace(/\s+/g, "");

              const searchTerm = originalMatch;
              const searchTermNoSpaces = searchTerm.replace(/\s+/g, "");

              // Extract key components
              const isFoldable =
                searchTerm.includes("fold") || searchTerm.includes("flip");
              const hasNumber = searchTerm.match(/(\d+)/)?.[1];
              const isPlus =
                searchTerm.includes("plus") || searchTerm.includes("+");
              const isPro = searchTerm.includes("pro");
              const isUltra = searchTerm.includes("ultra");
              const isFE = searchTerm.includes("fe");
              const isLite = searchTerm.includes("lite");
              const hasGB =
                searchTerm.includes("gb") ||
                query.toLowerCase().includes("256gb") ||
                query.toLowerCase().includes("512gb");

              // Storage variant matching (e.g., "256GB", "512GB")
              if (hasGB) {
                const storageMatch = searchTerm.match(/(\d+)gb/i);
                if (
                  storageMatch &&
                  !phoneName.includes(storageMatch[1] + "gb")
                ) {
                  return false; // Skip if storage doesn't match
                }
              }

              // Basic matching strategies
              const basicMatch =
                fullNameNoSpaces.includes(modelSearch) ||
                fullNameNoSpaces.includes(searchTermNoSpaces) ||
                fullName.includes(searchTerm) ||
                phoneName.includes(searchTerm) ||
                phoneNameNoSpaces.includes(searchTermNoSpaces);

              // Samsung S-series special handling (S24, S23, S21, etc.)
              if (
                searchTerm.match(/^s\d{2}/) &&
                phoneBrand.includes("samsung")
              ) {
                const sNumber = searchTerm.match(/s(\d{2})/i)?.[1];
                if (sNumber && phoneName.includes("s" + sNumber)) {
                  // Check for suffix matching (Ultra, Plus, FE)
                  if (isUltra && !phoneName.includes("ultra")) return false;
                  if (isPlus && !phoneName.includes("plus")) return false;
                  if (isFE && !phoneName.includes("fe")) return false;
                  if (
                    !isUltra &&
                    !isPlus &&
                    !isFE &&
                    (phoneName.includes("ultra") ||
                      phoneName.includes("plus") ||
                      phoneName.includes("fe"))
                  ) {
                    return false; // Base model shouldn't match Ultra/Plus/FE
                  }
                  return true;
                }
              }

              // Samsung A/M/F series handling (A35, M35, F55)
              if (
                searchTerm.match(/^[amf]\d{2}/) &&
                phoneBrand.includes("samsung")
              ) {
                const seriesLetter = searchTerm.charAt(0);
                const seriesNumber = searchTerm.match(/[amf](\d{2})/i)?.[1];
                if (
                  seriesNumber &&
                  phoneName.includes(seriesLetter + seriesNumber)
                ) {
                  return true;
                }
              }

              // Foldable devices (Fold/Flip) - extensive matching
              if (isFoldable && phoneBrand.includes("samsung")) {
                const foldType = searchTerm.includes("fold") ? "fold" : "flip";
                const foldNumber = hasNumber;

                // Match various formats: "Fold 6", "Fold6", "Z Fold 6", "Z Fold6"
                if (phoneName.includes(foldType)) {
                  if (foldNumber) {
                    // Check if the number matches (with or without space)
                    const hasMatchingNumber =
                      phoneName.includes(foldType + foldNumber) ||
                      phoneName.includes(foldType + " " + foldNumber) ||
                      phoneName.includes("z" + foldType + foldNumber) ||
                      phoneName.includes("z " + foldType + " " + foldNumber) ||
                      phoneNameNoSpaces.includes(foldType + foldNumber) ||
                      phoneNameNoSpaces.includes("z" + foldType + foldNumber);
                    return hasMatchingNumber;
                  } else {
                    // No number specified, match any fold/flip
                    return true;
                  }
                }
              }

              // OnePlus Nord series handling
              if (
                searchTerm.includes("nord") &&
                phoneBrand.includes("oneplus")
              ) {
                if (searchTerm.includes("ce")) {
                  // Nord CE variants
                  const nordNumber =
                    searchTerm.match(/nord\s*ce\s*(\d+)/i)?.[1];
                  if (
                    nordNumber &&
                    phoneName.includes("nord") &&
                    phoneName.includes("ce") &&
                    phoneName.includes(nordNumber)
                  ) {
                    if (isLite && !phoneName.includes("lite")) return false;
                    if (!isLite && phoneName.includes("lite")) return false;
                    return true;
                  }
                } else {
                  // Regular Nord
                  const nordNumber = searchTerm.match(/nord\s*(\d+)/i)?.[1];
                  if (
                    nordNumber &&
                    phoneName.includes("nord") &&
                    !phoneName.includes("ce") &&
                    phoneName.includes(nordNumber)
                  ) {
                    return true;
                  }
                }
              }

              // Redmi Note series handling
              if (
                (searchTerm.includes("redmi") || searchTerm.includes("note")) &&
                (phoneBrand.includes("xiaomi") || phoneBrand.includes("redmi"))
              ) {
                const noteNumber = searchTerm.match(/note\s*(\d+)/i)?.[1];
                if (
                  noteNumber &&
                  phoneName.includes("note") &&
                  phoneName.includes(noteNumber)
                ) {
                  // Check for Pro/Pro Plus/Turbo variants
                  if (isPro && !phoneName.includes("pro")) return false;
                  if (
                    isPlus &&
                    !phoneName.includes("plus") &&
                    !phoneName.includes("+")
                  )
                    return false;
                  if (
                    searchTerm.includes("turbo") &&
                    !phoneName.includes("turbo")
                  )
                    return false;
                  if (
                    !isPro &&
                    !isPlus &&
                    !searchTerm.includes("turbo") &&
                    (phoneName.includes("pro") ||
                      phoneName.includes("plus") ||
                      phoneName.includes("turbo"))
                  ) {
                    return false; // Base Note shouldn't match Pro/Plus/Turbo
                  }
                  return true;
                }
              }

              // Pixel series with Pro/XL variants
              if (
                searchTerm.includes("pixel") &&
                phoneBrand.includes("google")
              ) {
                const pixelNumber = searchTerm.match(/pixel\s*(\d+)/i)?.[1];
                if (pixelNumber && phoneName.includes(pixelNumber)) {
                  if (isPro && !phoneName.includes("pro")) return false;
                  if (searchTerm.includes("xl") && !phoneName.includes("xl"))
                    return false;
                  if (
                    !isPro &&
                    !searchTerm.includes("xl") &&
                    (phoneName.includes("pro") || phoneName.includes("xl"))
                  ) {
                    return false;
                  }
                  return true;
                }
              }

              // iPhone variants
              if (
                searchTerm.includes("iphone") &&
                phoneBrand.includes("apple")
              ) {
                const iphoneNumber = searchTerm.match(/iphone\s*(\d+)/i)?.[1];
                if (iphoneNumber && phoneName.includes(iphoneNumber)) {
                  if (isPro && !phoneName.includes("pro")) return false;
                  if (searchTerm.includes("max") && !phoneName.includes("max"))
                    return false;
                  if (
                    searchTerm.includes("plus") &&
                    !phoneName.includes("plus")
                  )
                    return false;
                  if (
                    searchTerm.includes("mini") &&
                    !phoneName.includes("mini")
                  )
                    return false;
                  return true;
                }
              }

              // Vivo V-series (camera-focused series: V40, V40 Pro, V30e)
              if (
                (searchTerm.match(/^v\d/) || searchTerm.includes("vivo v")) &&
                phoneBrand.includes("vivo")
              ) {
                const vNumber = searchTerm.match(/v\s*(\d+)/i)?.[1];
                if (vNumber && phoneName.includes("v" + vNumber)) {
                  if (isPro && !phoneName.includes("pro")) return false;
                  if (
                    searchTerm.includes("e") &&
                    searchTerm.length === 3 &&
                    !phoneName.includes("e")
                  )
                    return false; // "V30e"
                  if (
                    !isPro &&
                    !searchTerm.includes("e") &&
                    (phoneName.includes("pro") || phoneName.includes("e"))
                  ) {
                    return false; // Base V40 shouldn't match V40 Pro or V40e
                  }
                  return true;
                }
              }

              // OnePlus numbered series (13, 13R, 12, 12R, 11, 11R)
              if (
                searchTerm.match(/^(oneplus\s*)?\d{1,2}r?$/) &&
                phoneBrand.includes("oneplus")
              ) {
                const opNumber = searchTerm.match(/(\d{1,2})/i)?.[1];
                const hasR = searchTerm.includes("r");
                if (opNumber && phoneName.includes(opNumber)) {
                  if (hasR && !phoneName.includes("r")) return false;
                  if (
                    !hasR &&
                    phoneName.includes("r") &&
                    !phoneName.includes("pro")
                  )
                    return false;
                  return true;
                }
              }

              // Realme GT series (GT 6T, GT 7 Pro)
              if (
                (searchTerm.includes("gt") || searchTerm.includes("realme")) &&
                phoneBrand.includes("realme")
              ) {
                const gtNumber = searchTerm.match(/gt\s*(\d+)/i)?.[1];
                if (
                  gtNumber &&
                  phoneName.includes("gt") &&
                  phoneName.includes(gtNumber)
                ) {
                  if (isPro && !phoneName.includes("pro")) return false;
                  if (
                    searchTerm.includes("t") &&
                    searchTerm.match(/\d+t/) &&
                    !phoneName.match(/\d+t/i)
                  )
                    return false;
                  return true;
                }
              }

              // Nothing Phone series (Nothing Phone 2a, 2a Plus, Phone 1)
              if (
                (searchTerm.includes("nothing") ||
                  searchTerm.includes("phone")) &&
                phoneBrand.includes("nothing")
              ) {
                const phoneNumber =
                  searchTerm.match(/phone\s*(\d+\w*)/i)?.[1] ||
                  searchTerm.match(/nothing\s*(\d+\w*)/i)?.[1];
                if (phoneNumber && phoneName.includes(phoneNumber)) {
                  if (isPlus && !phoneName.includes("plus")) return false;
                  if (!isPlus && phoneName.includes("plus")) return false;
                  return true;
                }
              }

              // CMF Phone series
              if (searchTerm.includes("cmf") && phoneBrand.includes("cmf")) {
                return phoneName.includes("phone");
              }

              // Xiaomi Civi series (14 Civi)
              if (
                (searchTerm.includes("civi") ||
                  searchTerm.includes("xiaomi 14")) &&
                phoneBrand.includes("xiaomi")
              ) {
                if (phoneName.includes("civi")) {
                  return true;
                }
              }

              // Poco X/M/F series (X7, M7 Pro, F6)
              if (
                searchTerm.match(/poco\s*[xmf]\d/) &&
                phoneBrand.includes("poco")
              ) {
                const pocoSeries = searchTerm.match(/poco\s*([xmf]\d+)/i)?.[1];
                if (pocoSeries && phoneName.includes(pocoSeries)) {
                  if (isPro && !phoneName.includes("pro")) return false;
                  if (!isPro && phoneName.includes("pro")) return false;
                  return true;
                }
              }

              // Fallback to basic matching
              return basicMatch;
            });

            if (matchingPhones.length > 0) {
              specificPhones.push(...matchingPhones);
              foundPatterns.push(
                `"${match[0]}" → ${matchingPhones.length} phones`
              );
            }
          }
        });

        if (foundPatterns.length > 0) {
          console.log(`🔍 Model patterns matched: ${foundPatterns.join(", ")}`);
        }

        return specificPhones;
      };

      if (mentionedBrands.length > 0 && !isComparison) {
        // Single brand query - filter by brand first
        let brandPhones = phones.filter((p) =>
          mentionedBrands.some((brand) => p.brand.toLowerCase().includes(brand))
        );

        // Try to find specific models in the query
        const specificPhones = findSpecificModels(brandPhones);

        if (specificPhones.length > 0) {
          // Remove duplicates
          const phoneIds = new Set();
          const uniquePhones = [];
          specificPhones.forEach((p) => {
            if (!phoneIds.has(p.id)) {
              phoneIds.add(p.id);
              uniquePhones.push(p);
            }
          });

          // Add more brand phones if we don't have enough
          brandPhones.forEach((p) => {
            if (!phoneIds.has(p.id) && uniquePhones.length < 20) {
              phoneIds.add(p.id);
              uniquePhones.push(p);
            }
          });

          relevantPhones = uniquePhones;
          console.log(
            `🏷️ Found ${specificPhones.length} specific models + ${
              uniquePhones.length - specificPhones.length
            } other ${mentionedBrands.join(", ")} phones`
          );
        } else {
          // No specific model found, just use brand phones
          relevantPhones = brandPhones.slice(0, 20);
          console.log(
            `🏷️ Found ${brandPhones.length} phones from ${mentionedBrands.join(
              ", "
            )}`
          );
        }
      } else if (isComparison && mentionedBrands.length > 0) {
        // Comparison query - include phones from all mentioned brands
        let brandPhones = phones.filter((p) =>
          mentionedBrands.some((brand) => p.brand.toLowerCase().includes(brand))
        );

        // Try to find specific models mentioned in the query
        const specificPhones = findSpecificModels(brandPhones);

        // Combine specific phones with brand phones, remove duplicates
        if (specificPhones.length > 0) {
          const phoneIds = new Set();
          const combinedPhones = [];

          // Add specific phones first
          specificPhones.forEach((p) => {
            if (!phoneIds.has(p.id)) {
              phoneIds.add(p.id);
              combinedPhones.push(p);
            }
          });

          // Add other brand phones
          brandPhones.forEach((p) => {
            if (!phoneIds.has(p.id) && combinedPhones.length < 40) {
              phoneIds.add(p.id);
              combinedPhones.push(p);
            }
          });

          relevantPhones = combinedPhones;
          console.log(
            `⚖️ Comparison query: Found ${
              specificPhones.length
            } specific models + ${
              relevantPhones.length - specificPhones.length
            } brand phones`
          );
        } else {
          relevantPhones = brandPhones.slice(0, 40);
          console.log(
            `⚖️ Comparison query: Found ${
              brandPhones.length
            } phones from ${mentionedBrands.join(" vs ")}`
          );
        }
      } else if (isComparison) {
        // Comparison query without specific brands - get more phones for variety
        relevantPhones = phones.slice(0, 50);
        console.log(
          `⚖️ General comparison query: Using ${relevantPhones.length} phones`
        );
      }

      const phoneData = relevantPhones.map(formatPhoneForAI);

      const systemPrompt = `You are Phonix 🤖, an expert AI smartphone consultant with deep knowledge of mobile technology, market trends, and user psychology. Your mission is to help EVERY user find their perfect phone, regardless of their tech knowledge, budget, or communication style.

YOUR CORE PERSONALITY:
- 🎯 Adaptive: Match your communication style to the user (tech-savvy vs beginner, formal vs casual)
- 💡 Proactive: Anticipate needs and ask clarifying questions
- 🎓 Educational: Explain technical terms in simple language when needed
- 💰 Budget-conscious: Always respect financial constraints and suggest value options
- 🌟 Honest: Acknowledge limitations and trade-offs transparently
- 😊 Empathetic: Understand user frustrations and concerns
- ⚡ Efficient: Provide concise yet comprehensive information

CRITICAL DATABASE RULES:
- The phone data below IS YOUR COMPLETE DATABASE - this is your ONLY source of truth
- If a phone appears in the provided phone data below, it IS IN YOUR DATABASE - state it confidently
- NEVER claim a phone is "not in database" if you can see it in the provided phone list
- Phone names have many variations (e.g., "Apple iPhone 13", "iPhone 13 256GB", "iPhone 13 512GB", "Samsung Galaxy S24", "Galaxy S24 5G")
- Search for: brand name, model number, storage variants, year editions
- When user asks to compare phones, if you find BOTH phones in the data below, proceed with the comparison immediately
- Only say "not in database" if the phone is truly absent from ALL the phone data provided below

ADVANCED USER HANDLING:

1. TECH-SAVVY USERS:
   - Recognize technical terms (chipset names, RAM types, camera sensors)
   - Provide detailed specs, benchmarks, and comparisons
   - Use technical terminology confidently
   - Discuss nuances like ISP quality, thermal management, display calibration
   Example: "Which phone has better ISP for computational photography?"
   Response: Include sensor details, processing capabilities, sample quality

2. NON-TECH USERS / BEGINNERS:
   - Avoid jargon, use simple analogies
   - Focus on real-world usage, not specs
   - Use relatable examples: "battery lasts all day", "takes Instagram-worthy photos"
   - Break down complex concepts
   Example: "What's a good phone for my mom?"
   Response: Simple interface, big screen, reliable battery, easy camera

3. BUDGET-CONSTRAINED USERS:
   - Show empathy, never judgment
   - Highlight value-for-money options
   - Suggest slightly older flagship models that offer great value
   - Explain why spending a bit more might save money long-term
   - Offer multiple price tiers with pros/cons
   Example: "I can only afford 15000"
   Response: Show best at that price + what they get at 18k/20k

4. PREMIUM BUYERS:
   - Focus on flagship features, premium materials, brand value
   - Discuss ecosystem benefits (Apple, Samsung)
   - Highlight exclusive features and future-proofing
   - Compare with luxury alternatives
   Example: "Money is not an issue, what's the best?"
   Response: Top flagships with detailed comparisons

5. SPECIFIC USE CASE USERS:
   - Gaming: Cooling systems, refresh rates, touch sampling, GPU performance
   - Photography: Sensor sizes, OIS, night mode, RAW support, video capabilities
   - Business: Productivity features, security, professional apps, multitasking
   - Content Creation: Display accuracy, video editing, storage, export speeds
   - Battery Life: mAh, optimization, charging speeds, battery health
   - Students: Value, durability, battery, essential features, study apps

6. INDECISIVE USERS:
   - Ask targeted questions to narrow down choices
   - Use decision frameworks: "What matters most: camera, battery, or performance?"
   - Provide top 2-3 options with clear differentiators
   - Offer pro/con lists for easy comparison
   Example: "I can't decide, there are too many options"
   Response: Guided questions → Narrow to 2-3 → Clear recommendation

7. COMPARISON SHOPPERS:
   - Create detailed side-by-side comparisons
   - Highlight key differences, not just list specs
   - Explain which is better for specific use cases
   - Provide clear "winner" with reasoning
   Example: "Compare A vs B vs C"
   Response: Comparison table → Use case winners → Final verdict

8. BRAND LOYAL USERS:
   - Respect brand preferences
   - Show best options within that brand
   - Gently suggest alternatives if their choice has issues
   - Explain brand strengths and weaknesses
   Example: "I only want Samsung"
   Response: Best Samsung options + why Samsung is good choice

9. SKEPTICAL / CAUTIOUS USERS:
   - Provide verified information with ratings
   - Mention expert reviews and user ratings
   - Address common concerns transparently
   - Build trust through honesty about limitations
   Example: "Are you sure this phone won't lag?"
   Response: Specs + real-world performance + user ratings + honest assessment

10. CONVERSATIONAL / CHATTY USERS:
    - Engage warmly, match their energy
    - Answer side questions
    - Provide interesting tech facts
    - Keep it friendly and less formal
    Example: "Hey! So I heard foldables are cool, what do you think?"
    Response: Enthusiastic discussion + recommendations

11. IMPATIENT / DIRECT USERS:
    - Get straight to the point
    - Lead with top recommendation
    - Provide TL;DR format
    - Minimize fluff
    Example: "Just tell me what to buy under 30k"
    Response: Direct recommendation + key specs + done

12. MULTILINGUAL / SIMPLE LANGUAGE USERS:
    - Use simple English, short sentences
    - Avoid idioms and complex phrases
    - Use more emojis for clarity
    - Repeat important points
    Example: "Phone good camera not costly"
    Response: Simple language, clear structure, visual emojis

ENHANCED CONVERSATION SCENARIOS:

A. GREETINGS & GENERAL QUERIES:
   - "Hi", "Hello", "Hey" → Warm greeting + "What brings you here today?"
   - "Help me" → "I'd love to! Are you looking for a new phone or comparing options?"
   - "What can you do?" → List capabilities with examples
   - "Thanks" → Acknowledge + "Need anything else?"

B. VAGUE QUERIES:
   - "I need a phone" → Ask: Budget? Current phone? Main use? Brand preference?
   - "Good phone" → "Good means different things to different people. What's most important to you?"
   - "Something nice" → "Let's find your perfect match! What's your budget range?"

C. COMPARISON QUERIES:
   - Search BOTH phones exhaustively (try brand+model, just model, storage variants)
   - Create clear side-by-side comparison
   - Highlight 3-5 key differences
   - Provide verdict based on their stated/implied needs
   - If one phone missing: "I found [Phone A] but not [Phone B exact name]. Did you mean [similar phone]?"

D. FEATURE QUESTIONS:
   - Camera: "For what type of photography? Social media, professional, or everyday?"
   - Battery: "How heavy is your usage? Gaming, streaming, or just calls/texts?"
   - Performance: "Do you game? Which games? Or just social media and browsing?"
   - Display: "Indoor use or outdoor? Do you watch lots of videos?"

E. BUDGET QUERIES:
   - Exact budget: Show options at that price + slightly above with "why it's worth it"
   - "Cheap": ₹8k-15k range
   - "Affordable": ₹15k-25k range  
   - "Mid-range": ₹25k-40k range
   - "Premium": ₹40k-70k range
   - "Flagship": ₹70k+ range
   - "Best": Ask budget first!

F. BRAND QUERIES:
   - Single brand: Show range (budget, mid, premium) from that brand
   - Brand comparison: Compare philosophies, strengths, weaknesses
   - "Which brand is best?": "Depends on what you need! Samsung for versatility, Apple for ecosystem, OnePlus for value..."

G. TECHNICAL DEEP-DIVES:
   - Processor: Explain in simple terms + performance tiers
   - RAM: When 6GB is enough vs when you need 12GB
   - Storage: Why 128GB might not be enough, expandability
   - Display: AMOLED vs LCD in human terms
   - Camera: MP isn't everything, sensor size matters

H. EDGE CASES:
   - Unrealistic budget: "For ₹5000, options are very limited. Here's what's possible, and what you get at ₹10k"
   - Conflicting requirements: "Flagship performance + budget price is tough. Here's the best compromise..."
   - Non-existent phone: "I don't have [exact model], but here's the current equivalent..."
   - Off-topic: "I specialize in smartphones! For [other topic], I recommend [helpful redirect]. Now, need a phone?"

RESPONSE FORMATS:

**Quick Answer Format** (for direct users):
"""
✨ Top Pick: **[Phone Name]** - ₹[Price]
- 📷 Camera: [rating/10]
- 🔋 Battery: [rating/10]  
- ⚡ Performance: [rating/10]
- 💰 Value: [rating/10]

Why: [2-3 sentence summary]

Alternatives: [2 other options, 1 line each]
"""

**Detailed Format** (for thorough users):
"""
Great question! Let me give you a comprehensive answer. �

**Understanding Your Needs:**
[Summarize what they asked + inferred needs]

**Top 3 Recommendations:**

1. **[Phone]** - ₹[Price] �
   💰 Best for: [specific use case]
   📱 Display: [details]
   ⚡ Performance: [details]
   📷 Camera: [details]
   � Battery: [details]
   ⭐ Rating: [X]/5 ([Y] reviews)
   
   ✅ Pros: [3 key strengths]
   ❌ Cons: [1-2 limitations]
   
   💬 Expert Take: [Real-world insight]

[Repeat for 2-3 phones]

**My Verdict:** 🎯
[Clear recommendation with reasoning]

**Decision Framework:**
- Choose [Phone A] if: [scenario]
- Choose [Phone B] if: [scenario]
- Choose [Phone C] if: [scenario]

Need more details on any of these? 🤔
"""

**Comparison Format**:
"""
Let's compare [Phone A] vs [Phone B]! ⚖️

**Quick Verdict:** [One sentence winner]

**Head-to-Head:**

| Feature | [Phone A] | [Phone B] | Winner |
|---------|-----------|-----------|---------|
| Display | [spec] | [spec] | [winner] |
| Camera | [spec] | [spec] | [winner] |
| Performance | [spec] | [spec] | [winner] |
| Battery | [spec] | [spec] | [winner] |
| Price | ₹[X] | ₹[Y] | [winner] |

**Key Differences:**
1. [Major diff 1]
2. [Major diff 2]
3. [Major diff 3]

**The Bottom Line:**
📱 For [use case]: Choose [Phone]
💰 For value: Choose [Phone]
� For camera: Choose [Phone]

**My Recommendation:** [Phone] because [reason]

Need more details on any of these? 🤔
"""

**Comparison Format** (CRITICAL - Use this EXACT structure for ALL comparison queries):
"""
🔍 **Comparing: [Phone A] vs [Phone B]**

📱 **[Phone A]** - ₹[Price]
   • Display: [size, type, refresh rate]
   • Processor: [chipset name]
   • Camera: [MP + key features]
   • Battery: [mAh + charging]
   • RAM/Storage: [details]
   • Rating: ⭐ [X]/5

📱 **[Phone B]** - ₹[Price]
   • Display: [size, type, refresh rate]
   • Processor: [chipset name]
   • Camera: [MP + key features]
   • Battery: [mAh + charging]
   • RAM/Storage: [details]
   • Rating: ⭐ [X]/5

---

**🏆 Winner in Each Category:**

📷 **Camera:** [Winner Phone] - [brief reason]

⚡ **Performance:** [Winner Phone] - [brief reason]

🔋 **Battery:** [Winner Phone] - [brief reason]

📺 **Display:** [Winner Phone] - [brief reason]

💰 **Value:** [Winner Phone] - [brief reason]

---

**🎯 My Recommendation:**
Choose **[Phone]** if you prioritize [key factors].

**💡 Bottom Line:** [2-3 clear sentences with verdict]

Need more details? Ask away! 😊
"""

CONVERSATION MEMORY & CONTEXT:
"""

CONVERSATION MEMORY & CONTEXT:
- Reference previous messages in the conversation
- Remember stated budget, preferences, use cases
- Build on previous recommendations
- If they rejected a phone, remember why and avoid similar options
- Track their decision-making journey

PROACTIVE ASSISTANCE:
- Anticipate follow-up questions
- Offer to compare recommended phones
- Suggest checking specific reviews or videos
- Remind about warranty, offers, exchange values
- Mention upcoming sales or launches if relevant

ACCESSIBILITY & INCLUSIVITY:
- Use simple language by default, technical when appropriate
- Explain acronyms: "5G (faster internet)" not just "5G"
- Use emojis to make scanning easier
- Break long text into bullet points
- Offer both quick and detailed versions

QUALITY ASSURANCE:
- Always double-check phone names in data
- Verify prices mentioned
- Cross-reference specs before stating
- If unsure, say "Based on the data provided..." not definitive claims
- Never make up specifications not in the database

Remember: Every user is unique. Adapt, listen, and guide them to their perfect phone! 🎯
"""

For comparisons:
"""
Great question! Let's compare [Phone A] vs [Phone B]: 📊

**[Phone A]** ✨
- Price: ₹[X]
- [Key strengths]
- Best for: [Use case]

**[Phone B]** ✨
- Price: ₹[X]
- [Key strengths]
- Best for: [Use case]

🎯 **Bottom line**: [Clear recommendation based on their needs]
"""

For general queries:
"""
[Provide helpful information]
[Suggest specific models if relevant]
[Ask if they'd like recommendations]
"""

IMPORTANT RULES:
- ALWAYS respect stated budget constraints
- NEVER recommend more than 3 phones unless asked for more
- ALWAYS use the available phone data provided
- If price is crucial, prioritize best value for money
- If no budget stated, ask or show range of options
- Be honest about trade-offs (e.g., "great camera but average battery")
- Use real specs from the provided data
- Keep responses concise but informative (300-500 words max)
- End with a question or call to action
`;

      // OPTIMIZATION: Create compact phone data (70% smaller)
      const compactPhoneData = phoneData.map((p) => ({
        name: `${p.brand} ${p.name}`,
        price: p.price,
        rating: p.rating,
        // Only first part of specs (remove variants/details)
        display: (p.specs?.display || "N/A").split(",")[0].trim(),
        cpu: (p.specs?.cpu || "N/A").split(",")[0].trim(),
        camera: (p.specs?.rearCamera || "N/A").split(",")[0].trim(),
        battery: (p.specs?.batteryAndCharging || "N/A").split(",")[0].trim(),
        ram: (p.specs?.ramAndStorage || "N/A").split(",")[0].trim(),
      }));

      const phoneDataSection = `
AVAILABLE PHONES DATABASE (${phoneData.length} phones):
${JSON.stringify(compactPhoneData, null, 2)}

Remember: You're not just listing phones - you're a consultant helping users make informed decisions. Understand their needs, provide context, and guide them to the best choice! 🎯`;

      // Build conversation context for Gemini
      let fullPrompt = systemPrompt + "\n\n" + phoneDataSection + "\n\n";

      // Add conversation history if available (last 6 messages for context)
      if (conversationHistory.length > 0) {
        fullPrompt += "CONVERSATION HISTORY:\n";
        const recentHistory = conversationHistory.slice(-6);
        recentHistory.forEach((msg) => {
          const role = msg.role === "user" ? "User" : "Assistant";
          fullPrompt += `${role}: ${msg.content}\n`;
        });
        fullPrompt += "\n";
      }

      // Add current query
      fullPrompt += `CURRENT USER QUERY: ${query}\n\nYour response:`;

      // Log prompt statistics
      const promptChars = fullPrompt.length;
      const estimatedTokens = Math.round(promptChars / 4);
      console.log(
        `📝 Prompt: ${promptChars.toLocaleString()} chars (~${estimatedTokens.toLocaleString()} tokens)`
      );

      // Log current API key being used
      const currentKey = apiKeyManager.getCurrentKey();
      console.log(`� Using API key: ${currentKey?.name || "Unknown"}`);

      // Call Google Gemini AI with automatic key rotation
      const recommendation = await apiKeyManager.makeRequest(fullPrompt, 3);

      console.log("✅ Google Gemini AI recommendation generated successfully");

      // Log API key statistics
      const stats = apiKeyManager.getStatistics();
      console.log(
        `� API Key Stats: ${stats.currentKey} active | ${stats.keys
          .map(
            (k) =>
              `${k.name}: ${k.successfulRequests}/${k.totalRequests} (${k.failureRate} fail)`
          )
          .join(" | ")}`
      );

      // Ensure message is not empty
      console.log(
        `📝 AI Response length: ${recommendation?.length || 0} chars`
      );
      console.log(
        `📝 AI Response trimmed length: ${
          recommendation?.trim()?.length || 0
        } chars`
      );
      console.log(
        `📝 AI Response is string: ${typeof recommendation === "string"}`
      );
      console.log(`📝 AI Response is truthy: ${!!recommendation}`);

      // More robust checking
      let finalMessage;
      if (
        typeof recommendation === "string" &&
        recommendation.trim().length > 0
      ) {
        finalMessage = recommendation;
        console.log("✓ Using AI-generated message");
      } else {
        console.log("⚠️  AI response empty or invalid, using fallback");
        finalMessage = getRuleBasedRecommendation(
          query,
          relevantPhones.slice(0, 5)
        );
      }

      console.log(
        `✉️ Final message length: ${finalMessage?.length || 0} chars`
      );
      console.log(`✉️ Final message type: ${typeof finalMessage}`);
      console.log(`✉️ Final message is truthy: ${!!finalMessage}`);

      // Ensure we never return empty message
      if (
        !finalMessage ||
        typeof finalMessage !== "string" ||
        finalMessage.trim().length === 0
      ) {
        console.error(
          "🚨 CRITICAL: Final message is invalid! Forcing fallback."
        );
        finalMessage = getRuleBasedRecommendation(
          query,
          relevantPhones.slice(0, 5)
        );
      }

      const responseData = {
        message: finalMessage,
        recommendations: relevantPhones.slice(0, 5),
      };

      console.log(
        `📤 Response data keys: ${Object.keys(responseData).join(", ")}`
      );
      console.log(`📤 Response message exists: ${!!responseData.message}`);
      console.log(
        `📤 Response message length: ${responseData.message?.length || 0}`
      );

      return res.json(responseData);
    } catch (aiError) {
      console.error("❌ Google AI API error:", aiError.message);

      // Fallback to rule-based system if AI fails
      console.log("🔄 Falling back to rule-based recommendations");

      // Use top-rated phones as fallback recommendations
      const fallbackPhones = (filterApplied ? relevantPhones : phones)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 5);

      const recommendation = getRuleBasedRecommendation(query, fallbackPhones);
      return res.json({
        message: recommendation,
        recommendations: fallbackPhones,
      });
    }
  } catch (err) {
    console.error("💥 Error in getRecommendation:", err);
    console.error("Stack trace:", err.stack);
    res.status(500).json({
      error: err.message,
      details: "Failed to get recommendation. Please try again.",
    });
  }
};
