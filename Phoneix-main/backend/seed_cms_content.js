import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/phreight_commerce";

const pageDataMap = {
  about: {
    hero: {
      title: "About PHREIGHTS | International Shipping & Courier Solutions",
      description: "Delivering Beyond Borders."
    },
    whoWeAre: {
      title: "What PHREIGHTS Provides",
      description: "PHREIGHTS is an international shipping and courier platform operated by Phoenix Commerce, designed to simplify cross-border shipping for businesses and individuals.\n\nWe help customers ship internationally through a streamlined platform that combines shipment booking, pickup coordination, international transportation, tracking, customs assistance and customer support under one PHREIGHTS experience.\n\nOur technology-enabled platform connects customers with suitable logistics solutions while keeping the customer experience simple and transparent.",
      points: "✔ International shipment booking\n✔ Door-to-door international shipping\n✔ Automated pickup allocation\n✔ Multiple international logistics solutions\n✔ Competitive shipment quotations\n✔ DDU and DDP service options\n✔ PHREIGHTS shipment tracking\n✔ Last-mile tracking\n✔ Customs documentation assistance\n✔ Shipment support\n✔ Wallet-based booking payments\n✔ Shipment protection for eligible loss scenarios"
    },
    missionVision: {
      missionTitle: "Our Approach",
      missionDesc: "One platform. Multiple logistics possibilities. One PHREIGHTS experience.\n\nCustomers do not need to select individual underlying logistics partners during booking. PHREIGHTS determines the appropriate pickup and logistics routing based on available service options and operational requirements.",
      visionTitle: "Business Details",
      visionDesc: "PHREIGHTS (Operated by Phoenix Commerce)\nRegistered Business Address: 2051, International Fashion Market, Opp. Raajmahal AC Mall, Sitanagar, Surat – 395010, Gujarat, India\nPublic Location: Surat, Gujarat, India\nGSTIN: 24DYHPA2082J1ZL | PAN: DYHPA2082J\nIEC: DYHPA2082J | AD Code: 01800J65600009"
    },
    whyChooseUs: {
      title: "Why Choose PHREIGHTS",
      items: [
        "Door-to-Door Shipping",
        "Automated Pickup Allocation",
        "Full Last-Mile Tracking",
        "Wallet-Based Payments"
      ]
    },
    stats: {
      items: [
        { value: "10K+", label: "Shipments Delivered" },
        { value: "500+", label: "Active Merchants" },
        { value: "20+", label: "Destinations Covered" },
        { value: "99%", label: "Delivery Success" }
      ]
    },
    cta: {
      title: "Customer Support & Hours",
      description: "Monday–Saturday: 10:00 AM–6:00 PM IST | Email: phoenixfreights@gmail.com\nCustomers can also raise support tickets after logging into their PHREIGHTS account.",
      buttonText: "Start Shipping Now"
    }
  },

  services: {
    hero: {
      title: "International Shipping Made Simple",
      description: "Ship internationally with PHREIGHTS through a streamlined booking, pickup, tracking and support experience."
    },
    servicesGrid: {
      items: [
        {
          title: "International Courier",
          desc: "International shipment solutions for businesses and individual customers across eligible destinations.",
          icon: "Globe"
        },
        {
          title: "Door-to-Door Shipping",
          desc: "From pickup at the shipper's address to delivery at the destination, PHREIGHTS coordinates the shipping journey.",
          icon: "Truck"
        },
        {
          title: "DDU Shipping",
          desc: "Under Delivered Duty Unpaid (DDU), customs duties/taxes are payable by consignee. Non-payment within 3 attempts may be debited from shipper's wallet.",
          icon: "Package"
        },
        {
          title: "DDP Shipping",
          desc: "Under Delivered Duty Paid (DDP), applicable duty/tax charges are collected from the shipper during booking, subject to destination customs.",
          icon: "BarChart3"
        }
      ]
    },
    featuresDetail: {
      title: "Important Customs Note & Weight Calculation",
      description: "Chargeable Weight = Higher of Dead Weight or Volumetric Weight (Length × Breadth × Height ÷ 5000 in cm). If recorded weight/dimensions differ from booking, the additional amount may be automatically debited from the customer's PHREIGHTS Wallet.",
      points: [
        "Customs duty is not applicable in every country and varies by destination, commodity, and declared value",
        "Pickup is automatically selected and allocated by PHREIGHTS without requiring partner selection",
        "Every eligible consignment includes PHREIGHTS Tracking + Last-Mile Tracking",
        "DDU & DDP options provide total flexibility for duties and taxes",
        "Automated weight and dimension reconciliation via partner carrier logs"
      ]
    },
    process: {
      title: "How PHREIGHTS Works",
      items: [
        "Automated Pickup Allocation",
        "Volumetric Weight Check",
        "Customs Documentation",
        "Last-Mile Tracking Delivery"
      ]
    },
    cta: {
      title: "International Shipping Made Simple",
      description: "Experience streamlined booking, pickup, customs clearance and delivery with PHREIGHTS.",
      buttonText: "Book a Shipment"
    }
  },

  contact: {
    header: {
      title: "We're Here to Help",
      description: "Have a question about international shipping, documentation, customs, booking or an existing shipment? Contact the PHREIGHTS support team."
    },
    info: {
      email: "phoenixfreights@gmail.com",
      phone: "Monday–Saturday: 10:00 AM–6:00 PM IST",
      address: "Surat, Gujarat, India (Logged-in customers can raise support tickets)"
    },
    whatsapp: {
      enabled: true,
      buttonText: "Follow PHREIGHTS on WhatsApp",
      channelUrl: "https://whatsapp.com/channel/0029VbDi2MGI1rcrq6PGZO3t"
    }
  },

  customs: {
    title: "Customs & Duties Policy",
    lastUpdated: "October 2026",
    sections: [
      {
        heading: "Customs Assessment",
        text: "Customs authorities in the destination country independently determine whether a shipment is subject to import duty, tax, customs examination, brokerage/clearance charges, storage charges, and other government or destination charges."
      },
      {
        heading: "Customs Duty Applicability",
        text: "Customs duty is not applicable to every shipment or every country. The applicable amount can vary based on destination country, commodity, HS classification, declared value, country of origin, quantity, import regulations, and official customs assessment."
      },
      {
        heading: "Delivered Duty Paid (DDP)",
        text: "For DDP shipments, applicable duty/tax-related charges are collected from the shipper according to the applicable booking/service terms."
      },
      {
        heading: "Delivered Duty Unpaid (DDU)",
        text: "For DDU shipments, applicable duty/tax/destination charges are collected from the consignee. If the consignee fails to pay within three delivery attempts, applicable charges may be automatically debited from the shipper's PHREIGHTS Wallet."
      },
      {
        heading: "Customer & Shipper Responsibility",
        text: "The shipper is responsible for providing accurate product description, quantity, value, weight, dimensions, HS code/classification where required, country of origin, commercial invoice, and other required customs documents."
      },
      {
        heading: "Customs Assistance",
        text: "Customers who are new to international shipping should contact the PHREIGHTS Sales/Support team regarding required documentation before booking."
      },
      {
        heading: "Customs Hold & Clearance SLA",
        text: "If a shipment is held by Customs, PHREIGHTS may follow up with the applicable logistics partner/authority and assist with the required process. However, customs clearance timelines are controlled by the relevant customs authority and are outside PHREIGHTS's control. PHREIGHTS therefore does not guarantee a fixed customs-clearance SLA."
      },
      {
        heading: "Customs-Related Charges",
        text: "Depending on the shipment, applicable charges may include duty, tax, customs examination, brokerage, storage, demurrage, clearance, return, disposal, and other destination charges. These may vary by shipment and destination."
      }
    ]
  },

  "prohibited-items": {
    title: "Prohibited & Restricted Items Policy",
    lastUpdated: "October 2026",
    sections: [
      {
        heading: "Policy Statement",
        text: "PHREIGHTS does not accept prohibited or restricted commodities that cannot be legally transported through the applicable international air-courier network."
      },
      {
        heading: "Prohibited Categories",
        text: "The following items are strictly prohibited from shipment:\n• Explosives and fireworks\n• Ammunition\n• Firearms/weapons\n• Flammable gases\n• Toxic gases\n• Flammable liquids\n• Flammable solids\n• Oxidizing substances\n• Organic peroxides\n• Toxic/poisonous substances\n• Corrosive substances\n• Radioactive materials\n• Infectious/biological materials\n• Dangerous lithium-battery shipments\n• Certain magnetized materials\n• Illegal drugs/narcotics\n• Counterfeit goods\n• Illegal goods\n• Protected wildlife/wildlife products\n• Human remains/body parts\n• Restricted biological materials\n• Other dangerous goods\n• Any commodity prohibited by origin/transit/destination country\n• Any commodity prohibited by the applicable logistics partner"
      },
      {
        heading: "Critical Disclaimer",
        text: "This list is a baseline and is not an exhaustive list of all commodities restricted by every country, carrier or regulatory authority. Additional restrictions may apply based on origin, destination, transit country, carrier, service type and applicable law. PHREIGHTS reserves the right to refuse or hold any shipment that does not satisfy applicable transportation, customs, safety or regulatory requirements."
      }
    ]
  },

  terms: {
    title: "Terms & Conditions",
    lastUpdated: "October 2026",
    sections: [
      {
        heading: "1. Acceptance",
        text: "By registering, booking or using PHREIGHTS services, the customer agrees to these Terms & Conditions and applicable PHREIGHTS policies."
      },
      {
        heading: "2. Customer Responsibility",
        text: "The customer is responsible for providing accurate shipper information, consignee information, commodity description, quantity, weight, dimensions, declared value, customs information, and required documentation."
      },
      {
        heading: "3. Shipment Acceptance",
        text: "PHREIGHTS reserves the right to refuse, cancel, hold or discontinue a shipment where: the shipment contains prohibited/restricted goods, required documentation is missing, information is inaccurate, the applicable carrier cannot accept the shipment, customs/regulatory requirements are not satisfied, the shipment violates applicable laws or regulations, or operational/security restrictions prevent transportation."
      },
      {
        heading: "4. Weight & Dimensions",
        text: "Chargeable weight is calculated using the higher of Actual/Dead Weight OR Volumetric Weight (L × B × H ÷ 5000, where dimensions are measured in centimetres). If carrier-measured weight/dimensions differ from the booking information, applicable additional charges may be debited from the customer's PHREIGHTS Wallet."
      },
      {
        heading: "5. Pricing",
        text: "Shipment pricing may depend on destination, weight, dimensions/volume, commodity, service type, destination-country requirements, applicable logistics charges, and other shipment-specific factors."
      },
      {
        heading: "6. DDU / DDP",
        text: "Customers must select the applicable service during booking. DDP: Applicable duty/tax-related charges are collected from the shipper. DDU: Applicable duty/tax/destination charges are payable by the consignee. If the consignee does not pay applicable charges within three delivery attempts, the applicable amount may be debited from the shipper's PHREIGHTS Wallet."
      },
      {
        heading: "7. Customs",
        text: "Customs authorities independently determine whether duties, taxes, examination, documentation, clearance or other charges apply. PHREIGHTS may assist with follow-up and documentation, but customs clearance timelines are outside PHREIGHTS's control."
      },
      {
        heading: "8. Cancellation",
        text: "Before pickup: 100% refund to PHREIGHTS Wallet. After pickup: Cancellation is not permitted."
      },
      {
        heading: "9. Return",
        text: "A return requested after pickup is not guaranteed. Where a return is successfully arranged, applicable domestic return, transportation, customs or other charges may apply."
      },
      {
        heading: "10. Wallet",
        text: "PHREIGHTS Wallet: Has no expiry, is used for PHREIGHTS bookings and services, is not refundable to a bank account or cash, and may be debited for applicable shipment adjustments."
      },
      {
        heading: "11. Claims",
        text: "Claims are governed by the separate Shipment Protection & Claim Policy."
      },
      {
        heading: "12. Damage",
        text: "PHREIGHTS does not provide compensation for shipment damage. Customers are responsible for adequate packaging suitable for transportation."
      },
      {
        heading: "13. Governing / Legal Terms",
        text: "This section is governed by the legal framework of Phoenix Commerce under applicable Indian jurisdiction and law."
      }
    ]
  },

  shipping: {
    title: "Shipping Policy",
    lastUpdated: "October 2026",
    sections: [
      {
        heading: "Booking",
        text: "Customers can book eligible international shipments through PHREIGHTS. Shipment acceptance remains subject to applicable carrier, aviation, customs, country and regulatory requirements."
      },
      {
        heading: "Pickup",
        text: "Pickup is automatically allocated by PHREIGHTS. The customer does not select the underlying pickup logistics provider."
      },
      {
        heading: "Chargeable Weight",
        text: "Chargeable Weight = Higher of Dead Weight and Volumetric Weight (Volumetric Weight = L × B × H ÷ 5000, dimensions must be provided in centimetres)."
      },
      {
        heading: "Shipping Charges",
        text: "The applicable shipping quotation is determined based on shipment-specific factors including volume, weight, destination and service."
      },
      {
        heading: "Delivered Duty Paid (DDP)",
        text: "The applicable DDP charges are collected from the shipper at booking."
      },
      {
        heading: "Delivered Duty Unpaid (DDU)",
        text: "Applicable duties/taxes/destination charges are collected from the consignee. If the consignee fails to pay within three delivery attempts, applicable charges may be debited from the shipper's PHREIGHTS Wallet."
      },
      {
        heading: "Delivery Timelines",
        text: "Delivery timelines are estimates and may be affected by customs, weather, airline capacity, local delivery conditions, documentation, regulatory requirements, consignee availability, remote-area delivery, and other events outside PHREIGHTS's control."
      },
      {
        heading: "Tracking",
        text: "Customers receive PHREIGHTS tracking and applicable last-mile tracking information."
      }
    ]
  },

  claims: {
    title: "Shipment Protection & Claim Policy",
    lastUpdated: "October 2026",
    sections: [
      {
        heading: "Maximum Claim Liability",
        text: "Maximum claim liability: ₹10,000 per shipment under eligible loss scenarios."
      },
      {
        heading: "Lost Within India",
        text: "100% of verified declared value, subject to ₹10,000 maximum."
      },
      {
        heading: "Lost During International Transit",
        text: "50% of verified declared value, subject to ₹10,000 maximum."
      },
      {
        heading: "Lost in Destination Country",
        text: "50% of verified declared value, subject to ₹10,000 maximum."
      },
      {
        heading: "No Damage Claim",
        text: "PHREIGHTS does not provide compensation for damaged shipments. Customers are responsible for adequate and transit-safe packaging."
      },
      {
        heading: "No Claim for Customs / Regulatory Issues",
        text: "Claims do not apply where the shipment is: held by Customs, detained, seized, confiscated, destroyed/disposed by authorities, affected by incorrect documentation, misdeclared, incorrectly valued/classified, prohibited/restricted, abandoned due to consignee non-payment, refused due to duties/taxes, or returned/disposed due to consignee non-payment."
      },
      {
        heading: "Investigation",
        text: "Claim investigations may take up to 10 working days after all required information and supporting documents have been received."
      },
      {
        heading: "Settlement",
        text: "Approved claims are credited directly to the customer's PHREIGHTS Wallet."
      }
    ]
  },

  refund: {
    title: "Refund & Cancellation Policy",
    lastUpdated: "October 2026",
    sections: [
      {
        heading: "Cancellation Before Pickup",
        text: "A booking cancelled before pickup is eligible for 100% refund to PHREIGHTS Wallet immediately."
      },
      {
        heading: "Cancellation After Pickup",
        text: "Cancellation is not permitted after pickup has occurred."
      },
      {
        heading: "Return Request",
        text: "A customer may request a return after pickup. However, return is not guaranteed. PHREIGHTS may attempt to coordinate the return where operationally possible. If successfully returned, applicable charges may include domestic return transportation, customs charges, handling charges, storage charges, and other applicable logistics charges."
      },
      {
        heading: "Wallet Refund",
        text: "Approved refunds are credited to the PHREIGHTS Wallet. Wallet balance: does not expire, cannot be withdrawn as cash, cannot be transferred to a bank account, and can be used for eligible PHREIGHTS bookings and services."
      },
      {
        heading: "Customs & Duty Payments",
        text: "Customs duties and taxes are not automatically refundable merely because a shipment is delayed, refused or returned. Treatment depends on the relevant customs authority/carrier and shipment circumstances."
      }
    ]
  }
};

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB successfully");

    const PageContent = mongoose.model(
      "PageContent",
      new mongoose.Schema(
        {
          page: { type: String, required: true, unique: true },
          sections: { type: mongoose.Schema.Types.Mixed, required: true }
        },
        { timestamps: true }
      )
    );

    for (const [pageKey, sectionsData] of Object.entries(pageDataMap)) {
      const updated = await PageContent.findOneAndUpdate(
        { page: pageKey },
        { page: pageKey, sections: sectionsData },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      console.log(`✓ Seeded page: '${pageKey}'`);
    }

    console.log("All CMS pages successfully seeded to MongoDB!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

seed();
