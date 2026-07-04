import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Shield, FileText, Truck, RefreshCw, AlertOctagon, HelpCircle, Globe, Cookie } from "lucide-react";
import API from "../../services/api";

const policiesList = [
  { slug: "terms", name: "Terms & Conditions", icon: <FileText size={18} /> },
  { slug: "privacy", name: "Privacy Policy", icon: <Shield size={18} /> },
  { slug: "shipping", name: "Shipping Policy", icon: <Truck size={18} /> },
  { slug: "refund", name: "Refund & Cancellation", icon: <RefreshCw size={18} /> },
  { slug: "claims", name: "Claims & Compensation", icon: <HelpCircle size={18} /> },
  { slug: "prohibited-items", name: "Prohibited Items", icon: <AlertOctagon size={18} /> },
  { slug: "customs", name: "Customs & Duties", icon: <Globe size={18} /> },
  { slug: "cookie", name: "Cookie Policy", icon: <Cookie size={18} /> },
];

const policyContent = {
  terms: {
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
  },
  privacy: {
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
  },
  shipping: {
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
  },
  refund: {
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
  },
  claims: {
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
  },
  "prohibited-items": {
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
  },
  customs: {
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
  },
  cookie: {
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
};

const PolicyPage = () => {
  const { policySlug } = useParams();
  const currentSlug = policySlug || "terms";

  const [policyData, setPolicyData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPolicy = async () => {
      setLoading(true);
      try {
        const res = await API.get(`/page-content/${currentSlug}`);
        if (res.data && res.data.sections) {
          setPolicyData(res.data.sections);
        }
      } catch (err) {
        console.warn(`Failed to fetch dynamic policy '${currentSlug}', falling back to local static values.`);
        setPolicyData(policyContent[currentSlug] || policyContent.terms);
      } finally {
        setLoading(false);
      }
    };
    fetchPolicy();
  }, [currentSlug]);

  const activePolicy = policyData || policyContent[currentSlug] || policyContent.terms;

  return (
    <div className="min-h-screen bg-[#E5E7EB] pt-32 pb-20 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
        
        {/* SIDEBAR NAVIGATION */}
        <aside className="w-full md:w-72 shrink-0">
          <div className="bg-white border border-[#687280]/20 rounded-2xl p-4 shadow-sm sticky top-28">
            <h2 className="text-sm font-bold text-[#0A1F44] uppercase tracking-wider mb-4 px-3">
              Policies Control
            </h2>
            <nav className="space-y-1">
              {policiesList.map((p) => {
                const isActive = currentSlug === p.slug;
                return (
                  <Link
                    key={p.slug}
                    to={`/policies/${p.slug}`}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-[#FF6A00] text-white shadow-md shadow-[#FF6A00]/25"
                        : "text-[#687280] hover:text-[#0A1F44] hover:bg-[#E5E7EB]/50"
                    }`}
                  >
                    {p.icon}
                    <span>{p.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* POLICY CONTENT WINDOW */}
        <main className="flex-grow">
          <div className="bg-white border border-[#687280]/20 rounded-2xl p-8 shadow-sm">
            
            {loading && !policyData ? (
              <div className="flex items-center justify-center py-20 text-xs font-semibold text-gray-500 gap-2">
                <span className="w-2.5 h-2.5 bg-[#FF6A00] rounded-full animate-ping"></span>
                Loading policy content...
              </div>
            ) : (
              <>
                <div className="border-b border-[#687280]/10 pb-4 mb-6">
                  <h1 className="text-2xl md:text-3xl font-extrabold text-[#0A1F44]">
                    {activePolicy.title}
                  </h1>
                  <p className="text-xs text-[#687280] mt-2">
                    Last updated: {activePolicy.lastUpdated}
                  </p>
                </div>

                <div className="space-y-6">
                  {(activePolicy.sections || []).map((sec, idx) => (
                    <div key={idx} className="space-y-2">
                      <h3 className="text-base font-bold text-[#0A1F44]">
                        {sec.heading}
                      </h3>
                      <p className="text-sm text-[#687280] leading-relaxed">
                        {sec.text}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="mt-8 pt-6 border-t border-[#687280]/10 text-center">
              <p className="text-xs text-[#687280]">
                If you have questions regarding this document, contact the Phreight Compliance Team at{" "}
                <a href="mailto:compliance@phreight.com" className="text-[#FF6A00] font-semibold hover:underline">
                  compliance@phreight.com
                </a>
              </p>
            </div>
          </div>
        </main>

      </div>
    </div>
  );
};
 
export default PolicyPage;
