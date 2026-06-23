import mongoose from "mongoose";
import crypto from "crypto";
import User from "../models/User.js";
import Wallet from "../models/Wallet.js";
import Rate from "../models/Rate.js";
import PageContent from "../models/PageContent.js";

const hashPassword = (password) => {
  return crypto.createHash("sha256").update(password + "phreight-salt-90382").digest("hex");
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Seed default admin if none exists
    const adminExists = await User.findOne({ role: "Admin" });
    if (!adminExists) {
      console.log("No Admin user found. Seeding default administrator...");
      
      const adminPassword = hashPassword("admin123");
      const defaultAdmin = await User.create({
        name: "Super Admin",
        email: "admin@phreight.com",
        password: adminPassword,
        role: "Admin",
        status: "Active",
      });

      // Auto-create admin wallet
      await Wallet.create({
        user: defaultAdmin._id,
        storeName: "Super Admin Store",
        balance: 1000000.0, // Give them 1M default balance
      });

      console.log("Default Admin seeded successfully: admin@phreight.com / admin123");
    }

    // Seed default rate slabs if none exist
    const rateExists = await Rate.findOne({});
    if (!rateExists) {
      console.log("No shipping rate slabs found. Seeding default slabs...");
      const defaultRates = [
        { slabId: "SLAB-01", weightLimit: 0.5, carrier: "BlueDart Express", zoneA: 1.50, zoneB: 2.20, zoneC: 3.00, zoneD: 4.50 },
        { slabId: "SLAB-02", weightLimit: 1.0, carrier: "BlueDart Express", zoneA: 2.80, zoneB: 3.90, zoneC: 5.20, zoneD: 7.80 },
        { slabId: "SLAB-03", weightLimit: 2.0, carrier: "BlueDart Express", zoneA: 5.00, zoneB: 7.20, zoneC: 9.80, zoneD: 14.50 },
        { slabId: "SLAB-04", weightLimit: 0.5, carrier: "Delhivery Air", zoneA: 1.30, zoneB: 1.95, zoneC: 2.80, zoneD: 4.10 },
        { slabId: "SLAB-05", weightLimit: 1.0, carrier: "Delhivery Air", zoneA: 2.45, zoneB: 3.50, zoneC: 4.90, zoneD: 7.20 },
        { slabId: "SLAB-06", weightLimit: 2.0, carrier: "Delhivery Air", zoneA: 4.60, zoneB: 6.80, zoneC: 9.20, zoneD: 13.80 },
      ];
      await Rate.insertMany(defaultRates);
      console.log("Default shipping rate slabs seeded successfully!");
    }

    // Seed default page contents if missing
    const defaultPages = [
      {
        page: "home",
        sections: {
          hero: {
            title: "Ship Globally At Lowest Slabs",
            description: "Phreight International Courier Company helps you automate logistics booking, reconcile weight discrepancies, and ship smarter with real-time dynamic pricing rates.",
            cta1: "Start Shipping",
            cta2: "Calculate Rate"
          },
          stats: {
            title: "Trusted by Thousands of Sellers",
            description: "Our platform is growing fast with reliable shipping services",
            items: [
              { value: "10000", label: "Shipments Delivered" },
              { value: "500", label: "Active Sellers" },
              { value: "20", label: "Countries Covered" },
              { value: "99", label: "Success Rate %" }
            ]
          },
          cta: {
            title: "Ready to Scale Your Logistics?",
            description: "Join thousands of merchants using Phreight to automate their shipping pipeline.",
            buttonText: "Create Free Account"
          }
        }
      },
      {
        page: "about",
        sections: {
          hero: {
            title: "About Phreight International Courier Company",
            description: "We are redefining international shipping and global logistics for modern businesses with fast, reliable, and cost-effective delivery solutions."
          },
          whoWeAre: {
            title: "Who We Are",
            description: "Phreight International Courier Company is a smart global shipping platform designed for sellers who want to scale globally. We integrate with top international logistics providers to deliver the best shipping experience with transparent pricing and fast, precise delivery.",
            points: "✔ International Shipping & Global Courier\n✔ Automated Route & Tariff Calculation\n✔ Wallet-Based Secure Payment System\n✔ Real-Time GPS Tracking & Alerts"
          },
          missionVision: {
            missionTitle: "Our Mission",
            missionDesc: "To simplify global shipping for businesses by providing affordable, fast, and highly reliable logistics and courier solutions.",
            visionTitle: "Our Vision",
            visionDesc: "To become a leading global shipping and courier platform and empower every seller to go international seamlessly."
          },
          whyChooseUs: {
            title: "Why Choose Us",
            items: [
              "Lowest Rates",
              "Fast Pickup",
              "Live Tracking",
              "Secure Wallet"
            ]
          },
          stats: {
            items: [
              { value: "10K+", label: "Shipments" },
              { value: "500+", label: "Sellers" },
              { value: "20+", label: "Countries" },
              { value: "99%", label: "Success Rate" }
            ]
          },
          cta: {
            title: "Ready to Start Shipping?",
            description: "Join Phreight International Courier Company and grow your business globally.",
            buttonText: "Get Started"
          }
        }
      },
      {
        page: "services",
        sections: {
          hero: {
            title: "Our Services",
            description: "Explore powerful shipping solutions designed for modern businesses."
          },
          servicesGrid: {
            items: [
              {
                title: "International Shipping",
                desc: "Ship your products globally with reliable courier partners.",
                icon: "Globe"
              },
              {
                title: "Pickup Service",
                desc: "Schedule pickups from your location with ease and convenience.",
                icon: "Truck"
              },
              {
                title: "Live Tracking",
                desc: "Track your shipments in real-time with accurate updates.",
                icon: "BarChart3"
              },
              {
                title: "Courier Aggregation",
                desc: "Access multiple courier services in one platform.",
                icon: "Package"
              }
            ]
          },
          featuresDetail: {
            title: "Powerful Shipping Platform",
            description: "Phreight provides everything you need to manage shipping, calculate rates, track orders, and grow your business globally.",
            points: [
              "Automated rate calculation",
              "Wallet-based payments",
              "Bulk shipment upload",
              "Label generation",
              "Real-time tracking"
            ]
          },
          process: {
            title: "How Our Service Works",
            items: [
              "Signup",
              "Add Wallet",
              "Create Shipment",
              "Track Delivery"
            ]
          },
          cta: {
            title: "Start Shipping Today",
            description: "Join Phreight and scale your business globally.",
            buttonText: "Get Started"
          }
        }
      },
      {
        page: "contact",
        sections: {
          header: {
            title: "Contact Us",
            description: "Have questions? We are here to help you."
          },
          info: {
            email: "support@phreight.com",
            phone: "+91 98765 43210",
            address: "Global Headquarters, India"
          }
        }
      },
      {
        page: "footer",
        sections: {
          brand: {
            description: "Smart global courier platform helping businesses deliver faster, cheaper, and with reliable international logistics."
          },
          contact: {
            email: "support@phreight.com",
            phone: "+91 98765 43210",
            address: "Global Headquarters, India"
          },
          copyright: {
            text: "Phreight International Courier Company. All rights reserved."
          }
        }
      },
      {
        page: "terms",
        sections: {
          title: "Terms & Conditions",
          lastUpdated: "June 16, 2026",
          sections: [
            {
              heading: "1. Agreement to Terms",
              text: "By accessing or using the Phreight International Courier Company logistics platform, you agree to be bound by these Terms and Conditions. If you do not agree, you must immediately cease all use of our services."
            },
            {
              heading: "2. Services Offered",
              text: "Phreight provides an international courier aggregation service. We do not operate our own fleet of transport vehicles; instead, we partner with premium global carriers (e.g. BlueDart Express, Delhivery Air, FedEx, DHL) to coordinate pickups and shipping services."
            },
            {
              heading: "3. Wallet and Payments",
              text: "Sellers must maintain a positive prepaid balance in their Phreight Wallet to book consignments. Charges are calculated dynamically based on weight, dimensions, and destination zone. Auto-debits occur upon booking verification."
            },
            {
              heading: "4. Weight Discrepancies",
              text: "All packages are subject to audit and weight reconciliation by the partner carriers. In the event of a weight discrepancy, Phreight reserves the right to deduct the adjustment amount directly from the seller's wallet balance."
            }
          ]
        }
      },
      {
        page: "privacy",
        sections: {
          title: "Privacy Policy",
          lastUpdated: "June 16, 2026",
          sections: [
            {
              heading: "1. Information We Collect",
              text: "We collect merchant profile data (names, emails, business registration/GST credentials, KYC documents) and shipment details (recipient names, delivery addresses, telephone numbers, cargo values) to perform logistics operations."
            },
            {
              heading: "2. Security Standards",
              text: "All credentials and personal data are protected under industry-standard cryptographic protocols. Store wallet databases utilize hardware-security module verification to prevent ledger tampering."
            },
            {
              heading: "3. Data Sharing",
              text: "We only share delivery details with corresponding logistics carrier partners (e.g. BlueDart, Delhivery) to facilitate package dispatching. We never sell seller or customer database entries to third-party advertisers."
            }
          ]
        }
      },
      {
        page: "shipping",
        sections: {
          title: "Shipping Policy",
          lastUpdated: "June 16, 2026",
          sections: [
            {
              heading: "1. Pick-up Schedules",
              text: "Pickups are triggered automatically within 24 hours of consignment booking, subject to carrier availability. Cutoff time for same-day pickup dispatching is 14:00 local warehouse time."
            },
            {
              heading: "2. Delivery SLAs",
              text: "Delivery timelines depend on the chosen shipping tier. Express Air shipments are delivered in 1-3 business days regionally/nationally, while economy surface shipping slabs range from 3-7 business days."
            },
            {
              heading: "3. Address Compliance",
              text: "Sellers are responsible for providing correct address tokens. Remote, rural, or inaccessible destinations may incur surcharge supplements (Zone D slabs) or require pickup at carrier destination offices."
            }
          ]
        }
      },
      {
        page: "refund",
        sections: {
          title: "Refund & Cancellation Policy",
          lastUpdated: "June 16, 2026",
          sections: [
            {
              heading: "1. Booking Cancellations",
              text: "Sellers can cancel a booked shipment anytime prior to the carrier pickup team executing dispatch. Once the shipment barcode has been scanned at the warehouse or origin hub, the booking cannot be cancelled."
            },
            {
              heading: "2. Wallet Credits",
              text: "Upon successful cancellation, the exact deducted tariff charge is immediately credited back to the seller's Phreight Wallet. No cancellation penalties are applied for pre-pickup requests."
            },
            {
              heading: "3. Failed Deliveries",
              text: "consignments that fail delivery due to address issues, refusal, or custom locks will be returned to origin (RTO). RTO tariff charges are debited according to the carrier's standard return rates and are non-refundable."
            }
          ]
        }
      },
      {
        page: "claims",
        sections: {
          title: "Claims & Compensation Policy",
          lastUpdated: "June 16, 2026",
          sections: [
            {
              heading: "1. Lost or Damaged Goods",
              text: "Sellers are eligible to file compensation claims for lost or physically damaged consignments while under the carrier's possession. All claims must be accompanied by photos of package damage or carrier-confirmed lost declarations."
            },
            {
              heading: "2. Insurance Limits",
              text: "Standard shipments are covered up to a liability limit of $50 or the declared package value (whichever is lower). Premium insurance coverage can be purchased during voucher booking for high-value merchandise."
            },
            {
              heading: "3. Discrepancy Windows",
              text: "All claims for shipment damage must be filed in writing via the support desk ticketing system within 7 days of package delivery or scheduled delivery date. Claims filed after this window will be rejected."
            }
          ]
        }
      },
      {
        page: "prohibited-items",
        sections: {
          title: "Prohibited & Restricted Items Policy",
          lastUpdated: "June 16, 2026",
          sections: [
            {
              heading: "1. Hazardous Materials",
              text: "Sellers must never ship explosives, fireworks, flammable liquids, pressurized aerosols, corrosives, batteries, or bio-hazards via Phreight logistics partners. Non-compliance results in immediate account suspension."
            },
            {
              heading: "2. Restricted Commodities",
              text: "Currency notes, bearer bonds, gold, precious stones, firearms, drugs, prescription medicines, alcohol, tobacco, and perishable food products are strictly banned across all carrier partners."
            },
            {
              heading: "3. Inspection Rights",
              text: "Logistics carriers reserve the right to inspect package contents at any hub under security guidelines. Non-compliant parcels will be seized and reported to appropriate regulatory bodies without liability."
            }
          ]
        }
      },
      {
        page: "customs",
        sections: {
          title: "Customs & Duties Policy",
          lastUpdated: "June 16, 2026",
          sections: [
            {
              heading: "1. Customs Declarations",
              text: "International dispatches require correct HS Code declarations and invoice bills. Sellers must provide complete description logs detailing products, quantity, unit value, and materials."
            },
            {
              heading: "2. Duty Responsibilities",
              text: "International shipments are subject to local customs taxes, import duties, and clearing fees. Unless explicitly marked as DDP (Delivery Duty Paid), the recipient/consignee is liable to pay all local duties."
            },
            {
              heading: "3. Customs Clearance Clearance delays due to missing paperwork, security audits, or unpaid import duties by the consignee are outside Phreight's service SLA commitments."
            }
          ]
        }
      },
      {
        page: "cookie",
        sections: {
          title: "Cookie Policy",
          lastUpdated: "June 16, 2026",
          sections: [
            {
              heading: "1. Essential Cookies",
              text: "We use essential cookies to maintain user authentication status, verify CSRF tokens, and ensure secure state sync inside user panels and dashboards."
            },
            {
              heading: "2. Performance Cookies",
              text: "Analytical cookies are used to track portal speed, latency response logs of API nodes, and identify server load triggers. These contain no personal merchant identifiers."
            },
            {
              heading: "3. Management Controls",
              text: "Sellers can manage cookie configurations inside browser preference settings. Disabling cookies will cause dashboard authentication systems to fail."
            }
          ]
        }
      }
    ];

    for (const p of defaultPages) {
      const exists = await PageContent.findOne({ page: p.page });
      if (!exists) {
        await PageContent.create(p);
        console.log(`Seeded default dynamic content for: ${p.page}`);
      }
    }
  } catch (error) {
    console.error("DB Error:", error.message);
    process.exit(1);
  }
};

export default connectDB;