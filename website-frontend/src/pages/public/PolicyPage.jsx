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
    lastUpdated: "October 2026",
    sections: [
      {
        heading: "1. Acceptance",
        text: "By registering, booking or using PHREIGHTS services, the customer agrees to these Terms & Conditions and applicable PHREIGHTS policies."
      },
      {
        heading: "2. Customer Responsibility",
        text: "The customer is responsible for providing accurate: Shipper information, Consignee information, Commodity description, Quantity, Weight, Dimensions, Declared value, Customs information, and Required documentation."
      },
      {
        heading: "3. Shipment Acceptance",
        text: "PHREIGHTS reserves the right to refuse, cancel, hold or discontinue a shipment where: The shipment contains prohibited/restricted goods, Required documentation is missing, Information is inaccurate, The applicable carrier cannot accept the shipment, Customs/regulatory requirements are not satisfied, The shipment violates applicable laws or regulations, or Operational or security restrictions prevent transportation."
      },
      {
        heading: "4. Weight & Dimensions",
        text: "Chargeable weight is calculated using the higher of Actual/Dead Weight OR Volumetric Weight (Volumetric Weight: L × B × H ÷ 5000, where dimensions are measured in centimetres).\n\nIf carrier-measured weight/dimensions differ from the booking information, applicable additional charges may be debited from the customer's PHREIGHTS Wallet."
      },
      {
        heading: "5. Pricing",
        text: "Shipment pricing may depend on: Destination, Weight, Dimensions/volume, Commodity, Service type, Destination-country requirements, Applicable logistics charges, and other shipment-specific factors."
      },
      {
        heading: "6. DDU / DDP",
        text: "Customers must select the applicable service during booking.\n\nDDP: Applicable duty/tax-related charges are collected from the shipper.\n\nDDU: Applicable duty/tax/destination charges are payable by the consignee. If the consignee does not pay applicable charges within three delivery attempts, the applicable amount may be debited from the shipper's PHREIGHTS Wallet."
      },
      {
        heading: "7. Customs",
        text: "Customs authorities independently determine whether duties, taxes, examination, documentation, clearance or other charges apply. PHREIGHTS may assist with follow-up and documentation, but customs clearance timelines are outside PHREIGHTS's control."
      },
      {
        heading: "8. Cancellation",
        text: "Before pickup: 100% refund to PHREIGHTS Wallet.\n\nAfter pickup: Cancellation is not permitted."
      },
      {
        heading: "9. Return",
        text: "A return requested after pickup is not guaranteed. Where a return is successfully arranged, applicable domestic return, transportation, customs or other charges may apply."
      },
      {
        heading: "10. Wallet",
        text: "PHREIGHTS Wallet: Has no expiry, is used for PHREIGHTS bookings/services, is not refundable to a bank account/cash, and may be debited for applicable shipment adjustments."
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
        text: "This section is governed by the legal framework of Phoenix Commerce under applicable Indian jurisdiction and laws."
      }
    ]
  },
  privacy: {
    title: "Privacy Policy",
    lastUpdated: "October 2026",
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
        text: "We only share delivery details with corresponding logistics carrier partners to facilitate package dispatching. We never sell seller or customer database entries to third-party advertisers."
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
        text: "Delivery timelines are estimates and may be affected by: Customs, Weather, Airline capacity, Local delivery conditions, Documentation, Regulatory requirements, Consignee availability, Remote-area delivery, and other events outside PHREIGHTS's control."
      },
      {
        heading: "Tracking",
        text: "Customers receive PHREIGHTS tracking and applicable last-mile tracking information."
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
        text: "A customer may request a return after pickup. However: Return is not guaranteed. PHREIGHTS may attempt to coordinate the return where operationally possible. If successfully returned, applicable charges may include: Domestic return transportation, Customs charges, Handling charges, Storage charges, and other applicable logistics charges."
      },
      {
        heading: "Wallet Refund",
        text: "Approved refunds are credited to the PHREIGHTS Wallet.\n\nWallet balance: Does not expire, cannot be withdrawn as cash, cannot be transferred to a bank account, and can be used for eligible PHREIGHTS bookings/services."
      },
      {
        heading: "Customs / Duty Payments",
        text: "Customs duties and taxes are not automatically refundable merely because a shipment is delayed, refused or returned. Treatment depends on the relevant customs authority/carrier and shipment circumstances."
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
        text: "PHREIGHTS does not provide compensation for damaged shipments. Customers are responsible for adequate packaging suitable for transportation."
      },
      {
        heading: "No Claim for Customs / Regulatory Issues",
        text: "Claims do not apply where the shipment is: Held by Customs, Detained, Seized, Confiscated, Destroyed/disposed by authorities, Affected by incorrect documentation, Misdeclared, Incorrectly valued/classified, Prohibited/restricted, Abandoned due to consignee non-payment, Refused due to duties/taxes, or Returned/disposed due to consignee non-payment."
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
        text: "The following categories are strictly prohibited:\n• Explosives and fireworks\n• Ammunition\n• Firearms/weapons\n• Flammable gases\n• Toxic gases\n• Flammable liquids\n• Flammable solids\n• Oxidizing substances\n• Organic peroxides\n• Toxic/poisonous substances\n• Corrosive substances\n• Radioactive materials\n• Infectious/biological materials\n• Dangerous lithium-battery shipments\n• Certain magnetized materials\n• Illegal drugs/narcotics\n• Counterfeit goods\n• Illegal goods\n• Protected wildlife/wildlife products\n• Human remains/body parts\n• Restricted biological materials\n• Other dangerous goods\n• Any commodity prohibited by origin/transit/destination country\n• Any commodity prohibited by the applicable logistics partner"
      },
      {
        heading: "Critical Disclaimer",
        text: "This list is a baseline and is not an exhaustive list of all commodities restricted by every country, carrier or regulatory authority. Additional restrictions may apply based on origin, destination, transit country, carrier, service type and applicable law. PHREIGHTS reserves the right to refuse or hold any shipment that does not satisfy applicable transportation, customs, safety or regulatory requirements."
      }
    ]
  },
  customs: {
    title: "Customs & Duties Policy",
    lastUpdated: "October 2026",
    sections: [
      {
        heading: "Customs Assessment",
        text: "Customs authorities in the destination country independently determine whether a shipment is subject to: Import duty, Tax, Customs examination, Brokerage/clearance charges, Storage charges, Other government or destination charges."
      },
      {
        heading: "Customs Duty Applicability",
        text: "Customs duty is not applicable to every shipment or every country. The applicable amount can vary based on: Destination, Commodity, HS classification, Declared value, Country of origin, Quantity, Import regulations, and Customs assessment."
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
        text: "The shipper is responsible for providing accurate: Product description, Quantity, Value, Weight, Dimensions, HS code/classification where required, Country of origin, Invoice, and Other required customs documents."
      },
      {
        heading: "Customs Assistance",
        text: "Customers who are new to international shipping should contact the PHREIGHTS Sales/Support team regarding required documentation before booking."
      },
      {
        heading: "Customs Hold & Clearance Timelines",
        text: "If a shipment is held by Customs, PHREIGHTS may follow up with the applicable logistics partner/authority and assist with the required process. However: Customs clearance timelines are controlled by the relevant customs authority and are outside PHREIGHTS's control. PHREIGHTS therefore does not guarantee a fixed customs-clearance SLA."
      },
      {
        heading: "Customs-Related Charges",
        text: "Depending on the shipment, applicable charges may include: Duty, Tax, Customs examination, Brokerage, Storage, Demurrage, Clearance, Return, Disposal, and Other destination charges. These may vary by shipment and destination."
      }
    ]
  },
  cookie: {
    title: "Cookie Policy",
    lastUpdated: "October 2026",
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
