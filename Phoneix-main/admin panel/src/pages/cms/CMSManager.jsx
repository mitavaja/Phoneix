import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../../services/api";

const CMSManager = () => {
  const { page } = useParams();
  const navigate = useNavigate();

  const allowedPages = [
    "header",
    "home",
    "about",
    "services",
    "contact",
    "footer",
    "privacy",
    "terms",
    "shipping",
    "refund",
    "claims",
    "prohibited-items",
    "customs",
    "cookie"
  ];

  const activeTab = page && allowedPages.includes(page.toLowerCase())
    ? page.toLowerCase()
    : "home";

  const [loading, setLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState("");
  const [pageData, setPageData] = useState(null);

  const defaultTemplates = {
    header: {
      logo: {
        text: "Phreight",
        subtitle: "International Courier Company",
        logoUrl: ""
      },
      navigation: [
        { name: "Home", path: "/" },
        { name: "About", path: "/about" },
        { name: "Services", path: "/services" },
        { name: "Rate", path: "/rate" },
        { name: "Tracking", path: "/tracking" },
        { name: "Contact", path: "/contact" }
      ],
      buttons: {
        loginText: "Login",
        registerText: "Register",
        showLogin: true,
        showRegister: true
      }
    },
    home: {
      hero: { title: "", description: "", cta1: "", cta2: "" },
      stats: { title: "", description: "", items: [ { value: "", label: "" }, { value: "", label: "" }, { value: "", label: "" }, { value: "", label: "" } ] },
      services: {
        title: "Our Services",
        description: "Powerful shipping solutions designed for modern businesses",
        items: [
          { title: "International Shipping", icon: "Globe" },
          { title: "Pickup Service", icon: "Truck" },
          { title: "Live Tracking", icon: "BarChart3" },
          { title: "Courier Aggregation", icon: "Package" }
        ]
      },
      howItWorks: {
        title: "How It Works",
        description: "Simple steps to start shipping with Phreight",
        items: [
          { step: "01", title: "Signup", desc: "Create your account and complete KYC verification" },
          { step: "02", title: "Add Wallet", desc: "Recharge your wallet to start shipping" },
          { step: "03", title: "Create Shipment", desc: "Enter shipment details and generate label" },
          { step: "04", title: "Track Delivery", desc: "Track your shipment in real-time" }
        ]
      },
      rateCalc: {
        title: "Calculate Shipping Cost Instantly",
        description: "Enter your shipment details and get the best courier rates instantly.",
        points: ["Real-time pricing", "Multiple courier options", "Transparent charges"]
      },
      whyChoose: {
        title: "Why Choose Phreight",
        description: "Powerful features designed to simplify your shipping experience",
        items: [
          { title: "Lowest Shipping Rates", desc: "Get unbeatable prices with smart rate optimization", icon: "Wallet" },
          { title: "Fast Pickup Service", desc: "Schedule pickups easily and save time", icon: "Zap" },
          { title: "Global Coverage", desc: "Ship to 20+ countries with reliable partners", icon: "Globe" },
          { title: "Secure & Trusted", desc: "Safe transactions with wallet protection", icon: "ShieldCheck" }
        ]
      },
      testimonials: {
        title: "What Our Clients Say",
        description: "Trusted by sellers across India",
        items: [
          { name: "Rahul Sharma", feedback: "Phreight made shipping super easy and affordable!" },
          { name: "Priya Patel", feedback: "Best platform for international shipping. Highly recommended!" },
          { name: "Amit Verma", feedback: "Smooth dashboard and fast pickup service. Loved it!" }
        ]
      },
      cta: { title: "", description: "", buttonText: "" }
    },
    about: {
      hero: { title: "", description: "" },
      whoWeAre: { title: "", description: "", points: "" },
      missionVision: { missionTitle: "", missionDesc: "", visionTitle: "", visionDesc: "" },
      whyChooseUs: { title: "", items: ["", "", "", ""] },
      stats: { items: [ { value: "", label: "" }, { value: "", label: "" }, { value: "", label: "" }, { value: "", label: "" } ] },
      cta: { title: "", description: "", buttonText: "" }
    },
    services: {
      hero: { title: "", description: "" },
      servicesGrid: { items: [
        { title: "", desc: "", icon: "Globe" },
        { title: "", desc: "", icon: "Truck" },
        { title: "", desc: "", icon: "BarChart3" },
        { title: "", desc: "", icon: "Package" }
      ] },
      featuresDetail: { title: "", description: "", points: ["", "", "", "", ""] },
      process: { title: "", items: ["", "", "", ""] },
      cta: { title: "", description: "", buttonText: "" }
    },
    contact: {
      header: { title: "", description: "" },
      info: { email: "", phone: "", address: "" }
    },
    footer: {
      brand: { description: "" },
      contact: { email: "", phone: "", address: "" },
      copyright: { text: "" }
    },
    privacy: { title: "Privacy Policy", lastUpdated: "", sections: [] },
    terms: { title: "Terms & Conditions", lastUpdated: "", sections: [] },
    shipping: { title: "Shipping Policy", lastUpdated: "", sections: [] },
    refund: { title: "Refund & Cancellation Policy", lastUpdated: "", sections: [] },
    claims: { title: "Claims & Compensation Policy", lastUpdated: "", sections: [] },
    "prohibited-items": { title: "Prohibited & Restricted Items Policy", lastUpdated: "", sections: [] },
    customs: { title: "Customs & Duties Policy", lastUpdated: "", sections: [] },
    cookie: { title: "Cookie Policy", lastUpdated: "", sections: [] }
  };

  // Fetch page content on tab activation or component mount
  const fetchPageData = async (pageKey) => {
    setLoading(true);
    setError("");
    setPageData(null);
    try {
      const res = await API.get(`/page-content/${pageKey}`);
      setPageData(res.data?.sections || defaultTemplates[pageKey] || {});
    } catch (err) {
      console.error(`Failed to load ${pageKey} page content`, err);
      if (err.response?.status === 404) {
        setPageData(defaultTemplates[pageKey] || {});
        toast.info(`Initialised default empty template for ${pageKey.toUpperCase()}. Click save to create.`);
      } else {
        setError(`Failed to fetch database content for ${pageKey} page. Please verify your backend connection.`);
        toast.error(`Error loading page content for ${pageKey.toUpperCase()}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPageData(activeTab);
  }, [activeTab]);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setIsSaved(false);

    try {
      await API.put(`/page-content/${activeTab}`, { sections: pageData });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
      toast.success(`Success: ${activeTab.toUpperCase()} page sections updated and committed successfully!`);
    } catch (err) {
      console.error(`Failed to update ${activeTab} page content`, err);
      const errMsg = `Error committing changes: ${err.response?.data?.message || err.message}`;
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Helper change handlers for nested fields
  const updateNestedField = (section, field, value) => {
    setPageData((prev) => ({
      ...prev,
      [section]: {
        ...(prev?.[section] || {}),
        [field]: value,
      },
    }));
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("logo", file);

    setLoading(true);
    try {
      const res = await API.post("/page-content/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      updateNestedField("logo", "logoUrl", res.data.url);
      toast.success("Logo image uploaded successfully!");
    } catch (err) {
      console.error("Error uploading logo", err);
      toast.error(err.response?.data?.message || "Failed to upload logo image");
    } finally {
      setLoading(false);
    }
  };

  // Render Loading indicator
  const renderLoading = () => (
    <div className="flex items-center justify-center p-12 text-xs font-semibold text-gray-500 gap-2">
      <span className="w-2.5 h-2.5 bg-[#FF6A00] rounded-full animate-ping"></span>
      Fetching dynamic sections payload...
    </div>
  );

  const getPageTitle = () => {
    switch (activeTab) {
      case "header":
        return "Header Settings";
      case "home":
        return "Home Page Sections";
      case "about":
        return "About Page Content";
      case "services":
        return "Services & Pricing Features";
      case "contact":
        return "Contact Details & Form Header";
      case "footer":
        return "Footer Details & Branding";
      case "privacy":
        return "Privacy Policy";
      case "terms":
        return "Terms & Conditions";
      case "shipping":
        return "Shipping Policy";
      case "refund":
        return "Refund & Cancellation Policy";
      case "claims":
        return "Claims & Compensation Policy";
      case "prohibited-items":
        return "Prohibited & Restricted Items Policy";
      case "customs":
        return "Customs & Duties Policy";
      case "cookie":
        return "Cookie Policy";
      default:
        return `${activeTab} Page`;
    }
  };

  return (
    <div className="space-y-8 select-none max-w-5xl mx-auto text-[#0A1F44]">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Website Content Manager (CMS)</h1>
          <p className="text-sm text-[#687280]">Modify and audit public website text grids, hero elements, CTA labels, and performance statistics in real time.</p>
        </div>

        {/* Active Page Header Badge */}
        <div className="flex items-center gap-2 px-4 py-2 bg-[#FF6A00]/10 border border-[#FF6A00]/25 rounded-xl w-fit shrink-0">
          <span className="w-2 h-2 bg-[#FF6A00] rounded-full animate-pulse"></span>
          <span className="text-xs font-bold uppercase tracking-wider text-[#FF6A00]">
            Editing: {getPageTitle()}
          </span>
        </div>
      </div>

      {/* Save Success Alert */}
      {isSaved && (
        <div className="p-3.5 bg-green-100 border border-green-500/20 text-green-600 rounded-xl text-xs flex items-center gap-2 animate-[fadeIn_0.3s_ease-out] font-semibold">
          <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Website database nodes updated and synchronized!
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="p-3.5 bg-red-100 border border-red-500/20 text-red-600 rounded-xl text-xs flex items-center gap-2 animate-[fadeIn_0.3s_ease-out] font-semibold">
          <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {error}
        </div>
      )}

      {/* Main Form container */}
      <div className="glass-card p-6 rounded-2xl border border-[#687280]/20 shadow-2xl relative overflow-hidden bg-white">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF6A00]/5 rounded-full blur-3xl pointer-events-none"></div>

        {loading && !pageData ? (
          renderLoading()
        ) : (
          <form onSubmit={handleSave} className="space-y-8 text-xs">
            
            {/* ==================== HEADER CMS ==================== */}
            {activeTab === "header" && pageData && (
              <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
                <div>
                  <h3 className="text-sm font-bold border-b border-[#687280]/20 pb-2 mb-4">1. Brand Logo Configuration</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[#687280] font-semibold">Logo Main Text</label>
                      <input
                        type="text"
                        value={pageData.logo?.text || ""}
                        onChange={(e) => updateNestedField("logo", "text", e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg focus:outline-none transition-all font-semibold text-black text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[#687280] font-semibold">Logo Subtitle</label>
                      <input
                        type="text"
                        value={pageData.logo?.subtitle || ""}
                        onChange={(e) => updateNestedField("logo", "subtitle", e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg focus:outline-none transition-all text-black text-sm"
                      />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="block text-[#687280] font-semibold">Logo Image (via Multer Upload)</label>
                      <div className="flex items-center gap-4">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#FF6A00]/10 file:text-[#FF6A00] hover:file:bg-[#FF6A00]/20 cursor-pointer"
                        />
                        {pageData.logo?.logoUrl && (
                          <div className="flex items-center gap-2">
                            <img
                              src={pageData.logo.logoUrl.startsWith("http") ? pageData.logo.logoUrl : `http://localhost:5000${pageData.logo.logoUrl}`}
                              alt="Logo Preview"
                              className="h-10 w-auto object-contain rounded border bg-gray-50 p-1"
                            />
                            <button
                              type="button"
                              onClick={() => updateNestedField("logo", "logoUrl", "")}
                              className="text-red-500 hover:text-red-700 font-bold"
                            >
                              Clear
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#687280]/20 pt-6">
                  <h3 className="text-sm font-bold border-b border-[#687280]/20 pb-2 mb-4">2. Navigation Menu Links</h3>
                  <div className="space-y-4">
                    {(pageData.navigation || []).map((item, idx) => (
                      <div key={idx} className="flex items-end gap-4 p-3 bg-[#E5E7EB]/20 border border-[#687280]/15 rounded-xl">
                        <div className="flex-1 space-y-1.5">
                          <label className="block text-[#687280] font-semibold">Menu Label</label>
                          <input
                            type="text"
                            value={item.name || ""}
                            onChange={(e) => {
                              const newNav = [...(pageData.navigation || [])];
                              newNav[idx] = { ...newNav[idx], name: e.target.value };
                              setPageData((prev) => ({ ...prev, navigation: newNav }));
                            }}
                            className="w-full px-4 py-2 bg-white border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg focus:outline-none transition-all text-black text-sm"
                            required
                          />
                        </div>
                        <div className="flex-1 space-y-1.5">
                          <label className="block text-[#687280] font-semibold">Target Route/Path</label>
                          <input
                            type="text"
                            value={item.path || ""}
                            onChange={(e) => {
                              const newNav = [...(pageData.navigation || [])];
                              newNav[idx] = { ...newNav[idx], path: e.target.value };
                              setPageData((prev) => ({ ...prev, navigation: newNav }));
                            }}
                            className="w-full px-4 py-2 bg-white border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg focus:outline-none transition-all font-mono text-black text-sm"
                            required
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const newNav = (pageData.navigation || []).filter((_, i) => i !== idx);
                            setPageData((prev) => ({ ...prev, navigation: newNav }));
                          }}
                          className="px-4 py-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition border border-red-200 font-bold"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    
                    <button
                      type="button"
                      onClick={() => {
                        const newNav = [...(pageData.navigation || []), { name: "New Link", path: "/" }];
                        setPageData((prev) => ({ ...prev, navigation: newNav }));
                      }}
                      className="px-4 py-2.5 bg-[#FF6A00]/10 text-[#FF6A00] rounded-lg hover:bg-[#FF6A00]/20 transition border border-[#FF6A00]/30 font-bold text-xs uppercase tracking-wider"
                    >
                      + Add Menu Item
                    </button>
                  </div>
                </div>

                <div className="border-t border-[#687280]/20 pt-6">
                  <h3 className="text-sm font-bold border-b border-[#687280]/20 pb-2 mb-4">3. Action Buttons</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Login CTA */}
                    <div className="p-4 bg-[#E5E7EB]/20 border border-[#687280]/15 rounded-xl space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-[#0A1F44] font-bold text-xs uppercase">Login Button</label>
                        <input
                          type="checkbox"
                          checked={!!pageData.buttons?.showLogin}
                          onChange={(e) => {
                            updateNestedField("buttons", "showLogin", e.target.checked);
                          }}
                          className="w-4 h-4 text-[#FF6A00] focus:ring-[#FF6A00] border-gray-300 rounded"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-[#687280] font-semibold">Button Label</label>
                        <input
                          type="text"
                          value={pageData.buttons?.loginText || ""}
                          onChange={(e) => updateNestedField("buttons", "loginText", e.target.value)}
                          className="w-full px-4 py-2 bg-white border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg focus:outline-none transition-all text-black text-sm"
                          disabled={!pageData.buttons?.showLogin}
                        />
                      </div>
                    </div>

                    {/* Register CTA */}
                    <div className="p-4 bg-[#E5E7EB]/20 border border-[#687280]/15 rounded-xl space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-[#0A1F44] font-bold text-xs uppercase">Register Button</label>
                        <input
                          type="checkbox"
                          checked={!!pageData.buttons?.showRegister}
                          onChange={(e) => {
                            updateNestedField("buttons", "showRegister", e.target.checked);
                          }}
                          className="w-4 h-4 text-[#FF6A00] focus:ring-[#FF6A00] border-gray-300 rounded"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-[#687280] font-semibold">Button Label</label>
                        <input
                          type="text"
                          value={pageData.buttons?.registerText || ""}
                          onChange={(e) => updateNestedField("buttons", "registerText", e.target.value)}
                          className="w-full px-4 py-2 bg-white border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg focus:outline-none transition-all text-black text-sm"
                          disabled={!pageData.buttons?.showRegister}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ==================== HOME PAGE CMS ==================== */}
            {activeTab === "home" && pageData && (
              <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
                <div>
                  <h3 className="text-sm font-bold border-b border-[#687280]/20 pb-2 mb-4">1. Hero Section</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[#687280] font-semibold">Main Heading Title</label>
                      <input
                        type="text"
                        value={pageData.hero?.title || ""}
                        onChange={(e) => updateNestedField("hero", "title", e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg focus:outline-none transition-all font-semibold"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[#687280] font-semibold">Sub-heading Description</label>
                      <textarea
                        rows="3"
                        value={pageData.hero?.description || ""}
                        onChange={(e) => updateNestedField("hero", "description", e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg focus:outline-none transition-all resize-none leading-relaxed"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-[#687280] font-semibold">Primary CTA Label</label>
                        <input
                          type="text"
                          value={pageData.hero?.cta1 || ""}
                          onChange={(e) => updateNestedField("hero", "cta1", e.target.value)}
                          className="w-full px-4 py-2.5 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg focus:outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-[#687280] font-semibold">Secondary CTA Label</label>
                        <input
                          type="text"
                          value={pageData.hero?.cta2 || ""}
                          onChange={(e) => updateNestedField("hero", "cta2", e.target.value)}
                          className="w-full px-4 py-2.5 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg focus:outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#687280]/20 pt-6">
                  <h3 className="text-sm font-bold border-b border-[#687280]/20 pb-2 mb-4">2. Trust Statistics</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-1.5">
                      <label className="block text-[#687280] font-semibold">Stats Section Title</label>
                      <input
                        type="text"
                        value={pageData.stats?.title || ""}
                        onChange={(e) => updateNestedField("stats", "title", e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg focus:outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[#687280] font-semibold">Stats Description Subtext</label>
                      <input
                        type="text"
                        value={pageData.stats?.description || ""}
                        onChange={(e) => updateNestedField("stats", "description", e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">Metrics Slabs</span>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {(pageData.stats?.items || []).map((item, idx) => (
                      <div key={idx} className="p-3 bg-[#E5E7EB]/20 border border-[#687280]/15 rounded-xl space-y-2">
                        <div className="space-y-1">
                          <label className="text-[10px] text-gray-500 font-semibold">Metric {idx + 1} Target</label>
                          <input
                            type="text"
                            value={item?.value || ""}
                            onChange={(e) => {
                              const newItems = [...(pageData.stats?.items || [])];
                              newItems[idx] = { ...(newItems[idx] || {}), value: e.target.value };
                              setPageData((prev) => ({
                                ...prev,
                                stats: { ...(prev?.stats || {}), items: newItems },
                              }));
                            }}
                            className="w-full px-2.5 py-1.5 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-md font-bold text-[#FF6A00] font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-gray-500 font-semibold">Label Description</label>
                          <input
                            type="text"
                            value={item?.label || ""}
                            onChange={(e) => {
                              const newItems = [...(pageData.stats?.items || [])];
                              newItems[idx] = { ...(newItems[idx] || {}), label: e.target.value };
                              setPageData((prev) => ({
                                ...prev,
                                stats: { ...(prev?.stats || {}), items: newItems },
                              }));
                            }}
                            className="w-full px-2.5 py-1.5 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-md"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-[#687280]/20 pt-6">
                  <h3 className="text-sm font-bold border-b border-[#687280]/20 pb-2 mb-4">3. Services Section</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-1.5">
                      <label className="block text-[#687280] font-semibold">Services Section Title</label>
                      <input
                        type="text"
                        value={pageData.services?.title || ""}
                        onChange={(e) => updateNestedField("services", "title", e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg focus:outline-none transition-all font-semibold"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[#687280] font-semibold">Services Section Description</label>
                      <input
                        type="text"
                        value={pageData.services?.description || ""}
                        onChange={(e) => updateNestedField("services", "description", e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">Service Cards (4 items)</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {(pageData.services?.items || []).map((item, idx) => (
                      <div key={idx} className="p-3 bg-[#E5E7EB]/20 border border-[#687280]/15 rounded-xl space-y-2">
                        <div className="space-y-1">
                          <label className="text-[10px] text-gray-500 font-semibold">Service {idx + 1} Title</label>
                          <input
                            type="text"
                            value={item?.title || ""}
                            onChange={(e) => {
                              const newItems = [...(pageData.services?.items || [])];
                              newItems[idx] = { ...(newItems[idx] || {}), title: e.target.value };
                              setPageData((prev) => ({
                                ...prev,
                                services: { ...(prev?.services || {}), items: newItems },
                              }));
                            }}
                            className="w-full px-2 py-1 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-md font-semibold text-[#0A1F44]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-gray-500 font-semibold">Icon Identifier</label>
                          <select
                            value={item?.icon || "Globe"}
                            onChange={(e) => {
                              const newItems = [...(pageData.services?.items || [])];
                              newItems[idx] = { ...(newItems[idx] || {}), icon: e.target.value };
                              setPageData((prev) => ({
                                ...prev,
                                services: { ...(prev?.services || {}), items: newItems },
                              }));
                            }}
                            className="w-full px-2 py-1 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-md text-[#0A1F44]"
                          >
                            <option value="Globe">Globe</option>
                            <option value="Truck">Truck</option>
                            <option value="BarChart3">BarChart3</option>
                            <option value="Package">Package</option>
                            <option value="ShieldCheck">ShieldCheck</option>
                            <option value="Zap">Zap</option>
                            <option value="Wallet">Wallet</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-[#687280]/20 pt-6">
                  <h3 className="text-sm font-bold border-b border-[#687280]/20 pb-2 mb-4">4. How It Works Section</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-1.5">
                      <label className="block text-[#687280] font-semibold">How It Works Title</label>
                      <input
                        type="text"
                        value={pageData.howItWorks?.title || ""}
                        onChange={(e) => updateNestedField("howItWorks", "title", e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg focus:outline-none transition-all font-semibold"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[#687280] font-semibold">How It Works Description</label>
                      <input
                        type="text"
                        value={pageData.howItWorks?.description || ""}
                        onChange={(e) => updateNestedField("howItWorks", "description", e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">Steps list (4 items)</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {(pageData.howItWorks?.items || []).map((item, idx) => (
                      <div key={idx} className="p-3 bg-[#E5E7EB]/20 border border-[#687280]/15 rounded-xl space-y-2">
                        <div className="space-y-1">
                          <label className="text-[10px] text-gray-500 font-semibold">Step Badge (e.g. 01)</label>
                          <input
                            type="text"
                            value={item?.step || ""}
                            onChange={(e) => {
                              const newItems = [...(pageData.howItWorks?.items || [])];
                              newItems[idx] = { ...(newItems[idx] || {}), step: e.target.value };
                              setPageData((prev) => ({
                                ...prev,
                                howItWorks: { ...(prev?.howItWorks || {}), items: newItems },
                              }));
                            }}
                            className="w-full px-2.5 py-1 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-md font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-gray-500 font-semibold">Step Title</label>
                          <input
                            type="text"
                            value={item?.title || ""}
                            onChange={(e) => {
                              const newItems = [...(pageData.howItWorks?.items || [])];
                              newItems[idx] = { ...(newItems[idx] || {}), title: e.target.value };
                              setPageData((prev) => ({
                                ...prev,
                                howItWorks: { ...(prev?.howItWorks || {}), items: newItems },
                              }));
                            }}
                            className="w-full px-2.5 py-1 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-md"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-gray-500 font-semibold">Step Description</label>
                          <textarea
                            rows="2"
                            value={item?.desc || ""}
                            onChange={(e) => {
                              const newItems = [...(pageData.howItWorks?.items || [])];
                              newItems[idx] = { ...(newItems[idx] || {}), desc: e.target.value };
                              setPageData((prev) => ({
                                ...prev,
                                howItWorks: { ...(prev?.howItWorks || {}), items: newItems },
                              }));
                            }}
                            className="w-full px-2.5 py-1 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-md resize-none text-[11px]"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-[#687280]/20 pt-6">
                  <h3 className="text-sm font-bold border-b border-[#687280]/20 pb-2 mb-4">5. Rate Calculator Section</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-1.5">
                      <label className="block text-[#687280] font-semibold">Section Heading Title</label>
                      <input
                        type="text"
                        value={pageData.rateCalc?.title || ""}
                        onChange={(e) => updateNestedField("rateCalc", "title", e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg focus:outline-none transition-all font-semibold"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[#687280] font-semibold">Section Subtext</label>
                      <input
                        type="text"
                        value={pageData.rateCalc?.description || ""}
                        onChange={(e) => updateNestedField("rateCalc", "description", e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">Bullet Points (3 items)</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[0, 1, 2].map((idx) => (
                      <div key={idx} className="space-y-1">
                        <label className="text-[10px] text-gray-500 font-semibold">Bullet Point {idx + 1}</label>
                        <input
                          type="text"
                          value={(pageData.rateCalc?.points || [])[idx] || ""}
                          onChange={(e) => {
                            const newPoints = [...(pageData.rateCalc?.points || ["", "", ""])];
                            newPoints[idx] = e.target.value;
                            setPageData((prev) => ({
                              ...prev,
                              rateCalc: { ...(prev?.rateCalc || {}), points: newPoints },
                            }));
                          }}
                          className="w-full px-3 py-1.5 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-[#687280]/20 pt-6">
                  <h3 className="text-sm font-bold border-b border-[#687280]/20 pb-2 mb-4">6. Why Choose Section</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-1.5">
                      <label className="block text-[#687280] font-semibold">Section Heading Title</label>
                      <input
                        type="text"
                        value={pageData.whyChoose?.title || ""}
                        onChange={(e) => updateNestedField("whyChoose", "title", e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg focus:outline-none transition-all font-semibold"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[#687280] font-semibold">Section Description</label>
                      <input
                        type="text"
                        value={pageData.whyChoose?.description || ""}
                        onChange={(e) => updateNestedField("whyChoose", "description", e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">Features list (4 items)</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {(pageData.whyChoose?.items || []).map((item, idx) => (
                      <div key={idx} className="p-3 bg-[#E5E7EB]/20 border border-[#687280]/15 rounded-xl space-y-2">
                        <div className="space-y-1">
                          <label className="text-[10px] text-gray-500 font-semibold">Feature Title</label>
                          <input
                            type="text"
                            value={item?.title || ""}
                            onChange={(e) => {
                              const newItems = [...(pageData.whyChoose?.items || [])];
                              newItems[idx] = { ...(newItems[idx] || {}), title: e.target.value };
                              setPageData((prev) => ({
                                ...prev,
                                whyChoose: { ...(prev?.whyChoose || {}), items: newItems },
                              }));
                            }}
                            className="w-full px-2.5 py-1 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-md font-semibold text-[#0A1F44]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-gray-500 font-semibold">Feature Description</label>
                          <input
                            type="text"
                            value={item?.desc || ""}
                            onChange={(e) => {
                              const newItems = [...(pageData.whyChoose?.items || [])];
                              newItems[idx] = { ...(newItems[idx] || {}), desc: e.target.value };
                              setPageData((prev) => ({
                                ...prev,
                                whyChoose: { ...(prev?.whyChoose || {}), items: newItems },
                              }));
                            }}
                            className="w-full px-2.5 py-1 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-md"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-gray-500 font-semibold">Icon Identifier</label>
                          <select
                            value={item?.icon || "ShieldCheck"}
                            onChange={(e) => {
                              const newItems = [...(pageData.whyChoose?.items || [])];
                              newItems[idx] = { ...(newItems[idx] || {}), icon: e.target.value };
                              setPageData((prev) => ({
                                ...prev,
                                whyChoose: { ...(prev?.whyChoose || {}), items: newItems },
                              }));
                            }}
                            className="w-full px-2.5 py-1 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-md text-[#0A1F44]"
                          >
                            <option value="ShieldCheck">ShieldCheck</option>
                            <option value="Zap">Zap</option>
                            <option value="Globe">Globe</option>
                            <option value="Wallet">Wallet</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-[#687280]/20 pt-6">
                  <h3 className="text-sm font-bold border-b border-[#687280]/20 pb-2 mb-4">7. Testimonials Section (What Our Clients Say)</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-1.5">
                      <label className="block text-[#687280] font-semibold">Section Heading Title</label>
                      <input
                        type="text"
                        value={pageData.testimonials?.title || ""}
                        onChange={(e) => updateNestedField("testimonials", "title", e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg focus:outline-none transition-all font-semibold"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[#687280] font-semibold">Section Subtext</label>
                      <input
                        type="text"
                        value={pageData.testimonials?.description || ""}
                        onChange={(e) => updateNestedField("testimonials", "description", e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">Testimonials list (3 items)</span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(pageData.testimonials?.items || []).map((item, idx) => (
                      <div key={idx} className="p-3 bg-[#E5E7EB]/20 border border-[#687280]/15 rounded-xl space-y-2">
                        <div className="space-y-1">
                          <label className="text-[10px] text-gray-500 font-semibold">Client Name</label>
                          <input
                            type="text"
                            value={item?.name || ""}
                            onChange={(e) => {
                              const newItems = [...(pageData.testimonials?.items || [])];
                              newItems[idx] = { ...(newItems[idx] || {}), name: e.target.value };
                              setPageData((prev) => ({
                                ...prev,
                                testimonials: { ...(prev?.testimonials || {}), items: newItems },
                              }));
                            }}
                            className="w-full px-2.5 py-1 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-md font-semibold text-[#0A1F44]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-gray-500 font-semibold">Client Feedback</label>
                          <textarea
                            rows="3"
                            value={item?.feedback || ""}
                            onChange={(e) => {
                              const newItems = [...(pageData.testimonials?.items || [])];
                              newItems[idx] = { ...(newItems[idx] || {}), feedback: e.target.value };
                              setPageData((prev) => ({
                                ...prev,
                                testimonials: { ...(prev?.testimonials || {}), items: newItems },
                              }));
                            }}
                            className="w-full px-2.5 py-1 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-md resize-none text-[11px]"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-[#687280]/20 pt-6">
                  <h3 className="text-sm font-bold border-b border-[#687280]/20 pb-2 mb-4">8. Bottom Call-to-Action</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[#687280] font-semibold">CTA Box Heading</label>
                      <input
                        type="text"
                        value={pageData.cta?.title || ""}
                        onChange={(e) => updateNestedField("cta", "title", e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg focus:outline-none transition-all font-semibold"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[#687280] font-semibold">CTA Button Label</label>
                      <input
                        type="text"
                        value={pageData.cta?.buttonText || ""}
                        onChange={(e) => updateNestedField("cta", "buttonText", e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg focus:outline-none transition-all font-bold"
                      />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="block text-[#687280] font-semibold">CTA Subtext Description</label>
                      <input
                        type="text"
                        value={pageData.cta?.description || ""}
                        onChange={(e) => updateNestedField("cta", "description", e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ==================== ABOUT PAGE CMS ==================== */}
            {activeTab === "about" && pageData && (
              <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
                <div>
                  <h3 className="text-sm font-bold border-b border-[#687280]/20 pb-2 mb-4">1. About Hero</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[#687280] font-semibold">Headline</label>
                      <input
                        type="text"
                        value={pageData.hero?.title || ""}
                        onChange={(e) => updateNestedField("hero", "title", e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg focus:outline-none transition-all font-semibold"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[#687280] font-semibold">Subtext</label>
                      <textarea
                        rows="2"
                        value={pageData.hero?.description || ""}
                        onChange={(e) => updateNestedField("hero", "description", e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg focus:outline-none transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#687280]/20 pt-6">
                  <h3 className="text-sm font-bold border-b border-[#687280]/20 pb-2 mb-4">2. Who We Are Section</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[#687280] font-semibold">Title</label>
                      <input
                        type="text"
                        value={pageData.whoWeAre?.title || ""}
                        onChange={(e) => updateNestedField("whoWeAre", "title", e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg focus:outline-none transition-all font-semibold"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[#687280] font-semibold">Detailed Paragraph Description</label>
                      <textarea
                        rows="3"
                        value={pageData.whoWeAre?.description || ""}
                        onChange={(e) => updateNestedField("whoWeAre", "description", e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg focus:outline-none transition-all resize-none leading-relaxed"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[#687280] font-semibold">Bullet Points (separated by newlines)</label>
                      <textarea
                        rows="4"
                        value={pageData.whoWeAre?.points || ""}
                        onChange={(e) => updateNestedField("whoWeAre", "points", e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg focus:outline-none transition-all font-mono text-[11px]"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#687280]/20 pt-6">
                  <h3 className="text-sm font-bold border-b border-[#687280]/20 pb-2 mb-4">3. Mission & Vision</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-3 bg-[#E5E7EB]/25 p-4 rounded-xl border border-[#687280]/15">
                      <div className="space-y-1">
                        <label className="block text-[#687280] font-semibold">Mission Card Title</label>
                        <input
                          type="text"
                          value={pageData.missionVision?.missionTitle || ""}
                          onChange={(e) => updateNestedField("missionVision", "missionTitle", e.target.value)}
                          className="w-full px-3 py-2 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg focus:outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[#687280] font-semibold">Mission Description</label>
                        <textarea
                          rows="3"
                          value={pageData.missionVision?.missionDesc || ""}
                          onChange={(e) => updateNestedField("missionVision", "missionDesc", e.target.value)}
                          className="w-full px-3 py-2 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg focus:outline-none transition-all resize-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-3 bg-[#E5E7EB]/25 p-4 rounded-xl border border-[#687280]/15">
                      <div className="space-y-1">
                        <label className="block text-[#687280] font-semibold">Vision Card Title</label>
                        <input
                          type="text"
                          value={pageData.missionVision?.visionTitle || ""}
                          onChange={(e) => updateNestedField("missionVision", "visionTitle", e.target.value)}
                          className="w-full px-3 py-2 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg focus:outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[#687280] font-semibold">Vision Description</label>
                        <textarea
                          rows="3"
                          value={pageData.missionVision?.visionDesc || ""}
                          onChange={(e) => updateNestedField("missionVision", "visionDesc", e.target.value)}
                          className="w-full px-3 py-2 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg focus:outline-none transition-all resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#687280]/20 pt-6">
                  <h3 className="text-sm font-bold border-b border-[#687280]/20 pb-2 mb-4">4. Why Choose Us (Badges)</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {(pageData.whyChooseUs?.items || []).map((item, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <label className="block text-[#687280] font-semibold">Badge {idx + 1}</label>
                        <input
                          type="text"
                          value={item || ""}
                          onChange={(e) => {
                            const newItems = [...(pageData.whyChooseUs?.items || [])];
                            newItems[idx] = e.target.value;
                            setPageData((prev) => ({
                              ...prev,
                              whyChooseUs: { ...(prev?.whyChooseUs || {}), items: newItems },
                            }));
                          }}
                          className="w-full px-4 py-2 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg focus:outline-none transition-all font-semibold text-center"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-[#687280]/20 pt-6">
                  <h3 className="text-sm font-bold border-b border-[#687280]/20 pb-2 mb-4">5. Performance Statistics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {(pageData.stats?.items || [
                      { value: "10K+", label: "Shipments" },
                      { value: "500+", label: "Sellers" },
                      { value: "20+", label: "Countries" },
                      { value: "99%", label: "Success Rate" }
                    ]).map((item, idx) => (
                      <div key={idx} className="bg-[#E5E7EB]/25 p-4 rounded-xl border border-[#687280]/15 space-y-3">
                        <h4 className="text-xs font-bold text-[#FF6A00]">Stat {idx + 1}</h4>
                        <div className="space-y-1">
                          <label className="text-[10px] text-gray-500 font-semibold uppercase">Value</label>
                          <input
                            type="text"
                            value={item?.value || ""}
                            onChange={(e) => {
                              const newItems = [...(pageData.stats?.items || [
                                { value: "", label: "" },
                                { value: "", label: "" },
                                { value: "", label: "" },
                                { value: "", label: "" }
                              ])];
                              newItems[idx] = { ...(newItems[idx] || {}), value: e.target.value };
                              setPageData((prev) => ({
                                ...prev,
                                stats: { ...(prev?.stats || {}), items: newItems },
                              }));
                            }}
                            className="w-full px-3 py-1.5 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-md font-bold text-center"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-gray-500 font-semibold uppercase">Label</label>
                          <input
                            type="text"
                            value={item?.label || ""}
                            onChange={(e) => {
                              const newItems = [...(pageData.stats?.items || [
                                { value: "", label: "" },
                                { value: "", label: "" },
                                { value: "", label: "" },
                                { value: "", label: "" }
                              ])];
                              newItems[idx] = { ...(newItems[idx] || {}), label: e.target.value };
                              setPageData((prev) => ({
                                ...prev,
                                stats: { ...(prev?.stats || {}), items: newItems },
                              }));
                            }}
                            className="w-full px-3 py-1.5 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-md text-xs"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-[#687280]/20 pt-6">
                  <h3 className="text-sm font-bold border-b border-[#687280]/20 pb-2 mb-4">6. About Call to Action (CTA)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[#687280] font-semibold">CTA Headline</label>
                      <input
                        type="text"
                        value={pageData.cta?.title || ""}
                        onChange={(e) => updateNestedField("cta", "title", e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg focus:outline-none transition-all font-semibold"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[#687280] font-semibold">CTA Description</label>
                      <input
                        type="text"
                        value={pageData.cta?.description || ""}
                        onChange={(e) => updateNestedField("cta", "description", e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg focus:outline-none transition-all text-xs font-medium"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[#687280] font-semibold">CTA Button Text</label>
                      <input
                        type="text"
                        value={pageData.cta?.buttonText || ""}
                        onChange={(e) => updateNestedField("cta", "buttonText", e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg focus:outline-none transition-all font-semibold"
                      />
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* ==================== SERVICES PAGE CMS ==================== */}
            {activeTab === "services" && pageData && (
              <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
                <div>
                  <h3 className="text-sm font-bold border-b border-[#687280]/20 pb-2 mb-4">1. Services Hero</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[#687280] font-semibold">Heading Title</label>
                      <input
                        type="text"
                        value={pageData.hero?.title || ""}
                        onChange={(e) => updateNestedField("hero", "title", e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg focus:outline-none transition-all font-semibold"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[#687280] font-semibold">Headline Subtext</label>
                      <textarea
                        rows="2"
                        value={pageData.hero?.description || ""}
                        onChange={(e) => updateNestedField("hero", "description", e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg focus:outline-none transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#687280]/20 pt-6">
                  <h3 className="text-sm font-bold border-b border-[#687280]/20 pb-2 mb-4">2. Services Grid</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {(pageData.servicesGrid?.items || []).map((item, idx) => (
                      <div key={idx} className="p-4 bg-[#E5E7EB]/20 border border-[#687280]/15 rounded-xl space-y-3">
                        <div className="flex gap-4">
                          <div className="space-y-1 flex-1">
                            <label className="text-[10px] text-gray-500 font-semibold">Service {idx + 1} Title</label>
                            <input
                              type="text"
                              value={item?.title || ""}
                              onChange={(e) => {
                                const newItems = [...(pageData.servicesGrid?.items || [])];
                                newItems[idx] = { ...(newItems[idx] || {}), title: e.target.value };
                                setPageData((prev) => ({
                                  ...prev,
                                  servicesGrid: { ...(prev?.servicesGrid || {}), items: newItems },
                                }));
                              }}
                              className="w-full px-3 py-1.5 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-md font-bold"
                            />
                          </div>
                          <div className="space-y-1 w-28">
                            <label className="text-[10px] text-gray-500 font-semibold">Icon Identifier</label>
                            <select
                              value={item?.icon || "Globe"}
                              onChange={(e) => {
                                const newItems = [...(pageData.servicesGrid?.items || [])];
                                newItems[idx] = { ...(newItems[idx] || {}), icon: e.target.value };
                                setPageData((prev) => ({
                                  ...prev,
                                  servicesGrid: { ...(prev?.servicesGrid || {}), items: newItems },
                                }));
                              }}
                              className="w-full px-3 py-1.5 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-md cursor-pointer"
                            >
                              <option value="Globe">Globe</option>
                              <option value="Truck">Truck</option>
                              <option value="BarChart3">BarChart3</option>
                              <option value="Package">Package</option>
                            </select>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-gray-500 font-semibold">Description Text</label>
                          <textarea
                            rows="2"
                            value={item?.desc || ""}
                            onChange={(e) => {
                              const newItems = [...(pageData.servicesGrid?.items || [])];
                              newItems[idx] = { ...(newItems[idx] || {}), desc: e.target.value };
                              setPageData((prev) => ({
                                ...prev,
                                servicesGrid: { ...(prev?.servicesGrid || {}), items: newItems },
                              }));
                            }}
                            className="w-full px-3 py-1.5 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-md resize-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-[#687280]/20 pt-6">
                  <h3 className="text-sm font-bold border-b border-[#687280]/20 pb-2 mb-4">3. Platform Features & Points</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-1.5">
                      <label className="block text-[#687280] font-semibold">Heading Title</label>
                      <input
                        type="text"
                        value={pageData.featuresDetail?.title || ""}
                        onChange={(e) => updateNestedField("featuresDetail", "title", e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg focus:outline-none transition-all font-semibold"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[#687280] font-semibold">Features Block Subtext</label>
                      <input
                        type="text"
                        value={pageData.featuresDetail?.description || ""}
                        onChange={(e) => updateNestedField("featuresDetail", "description", e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">Bullet Points list</span>
                  <div className="space-y-2 max-w-xl">
                    {(pageData.featuresDetail?.points || []).map((pt, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <span className="font-bold text-gray-400 font-mono w-4">{idx + 1}.</span>
                        <input
                          type="text"
                          value={pt || ""}
                          onChange={(e) => {
                            const newPoints = [...(pageData.featuresDetail?.points || [])];
                            newPoints[idx] = e.target.value;
                            setPageData((prev) => ({
                              ...prev,
                              featuresDetail: { ...(prev?.featuresDetail || {}), points: newPoints },
                            }));
                          }}
                          className="flex-1 px-3 py-1.5 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg focus:outline-none transition-all"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ==================== CONTACT PAGE CMS ==================== */}
            {activeTab === "contact" && pageData && (
              <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
                <div>
                  <h3 className="text-sm font-bold border-b border-[#687280]/20 pb-2 mb-4">Contact Header</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[#687280] font-semibold">Heading Title</label>
                      <input
                        type="text"
                        value={pageData.header?.title || ""}
                        onChange={(e) => updateNestedField("header", "title", e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg focus:outline-none transition-all font-semibold"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[#687280] font-semibold">Description Subtext</label>
                      <input
                        type="text"
                        value={pageData.header?.description || ""}
                        onChange={(e) => updateNestedField("header", "description", e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
                <div className="border-t border-[#687280]/20 pt-6">
                  <h3 className="text-sm font-bold border-b border-[#687280]/20 pb-2 mb-4">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[#687280] font-semibold">Email Address</label>
                      <input
                        type="text"
                        value={pageData.info?.email || ""}
                        onChange={(e) => updateNestedField("info", "email", e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg focus:outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[#687280] font-semibold">Phone Number</label>
                      <input
                        type="text"
                        value={pageData.info?.phone || ""}
                        onChange={(e) => updateNestedField("info", "phone", e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg focus:outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[#687280] font-semibold">Physical Address</label>
                      <input
                        type="text"
                        value={pageData.info?.address || ""}
                        onChange={(e) => updateNestedField("info", "address", e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ==================== FOOTER PAGE CMS ==================== */}
            {activeTab === "footer" && pageData && (
              <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
                <div>
                  <h3 className="text-sm font-bold border-b border-[#687280]/20 pb-2 mb-4">Footer Brand Details</h3>
                  <div className="space-y-1.5">
                    <label className="block text-[#687280] font-semibold">Short Brand Description</label>
                    <textarea
                      rows="3"
                      value={pageData.brand?.description || ""}
                      onChange={(e) => updateNestedField("brand", "description", e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg focus:outline-none transition-all resize-none leading-relaxed"
                    />
                  </div>
                </div>
                <div className="border-t border-[#687280]/20 pt-6">
                  <h3 className="text-sm font-bold border-b border-[#687280]/20 pb-2 mb-4">Footer Contact Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[#687280] font-semibold">Contact Email</label>
                      <input
                        type="text"
                        value={pageData.contact?.email || ""}
                        onChange={(e) => updateNestedField("contact", "email", e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg focus:outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[#687280] font-semibold">Contact Phone</label>
                      <input
                        type="text"
                        value={pageData.contact?.phone || ""}
                        onChange={(e) => updateNestedField("contact", "phone", e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg focus:outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[#687280] font-semibold">Contact Address</label>
                      <input
                        type="text"
                        value={pageData.contact?.address || ""}
                        onChange={(e) => updateNestedField("contact", "address", e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
                <div className="border-t border-[#687280]/20 pt-6">
                  <h3 className="text-sm font-bold border-b border-[#687280]/20 pb-2 mb-4">Footer Copyright Text</h3>
                  <div className="space-y-1.5">
                    <label className="block text-[#687280] font-semibold">Copyright Label</label>
                    <input
                      type="text"
                      value={pageData.copyright?.text || ""}
                      onChange={(e) => updateNestedField("copyright", "text", e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg focus:outline-none transition-all font-semibold"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ==================== LEGAL & POLICY PAGES CMS ==================== */}
            {["privacy", "terms", "shipping", "refund", "claims", "prohibited-items", "customs", "cookie"].includes(activeTab) && pageData && (
              <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
                <div>
                  <h3 className="text-sm font-bold border-b border-[#687280]/20 pb-2 mb-4">Policy Document Metadata</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[#687280] font-semibold">Document Title</label>
                      <input
                        type="text"
                        value={pageData.title || ""}
                        onChange={(e) => setPageData(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg focus:outline-none transition-all font-bold text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[#687280] font-semibold">Last Updated Date</label>
                      <input
                        type="text"
                        value={pageData.lastUpdated || ""}
                        onChange={(e) => setPageData(prev => ({ ...prev, lastUpdated: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#687280]/20 pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold">Policy Clauses / Sections</h3>
                    <button
                      type="button"
                      onClick={() => {
                        const newSections = [...(pageData.sections || [])];
                        newSections.push({ heading: `New Section ${newSections.length + 1}`, text: "" });
                        setPageData(prev => ({ ...prev, sections: newSections }));
                      }}
                      className="px-3.5 py-1.5 bg-green-500 hover:bg-green-600 text-black font-extrabold rounded-lg text-[10px] uppercase tracking-wider transition-all shadow"
                    >
                      + Add Section
                    </button>
                  </div>

                  <div className="space-y-4">
                    {(pageData.sections || []).map((sec, idx) => (
                      <div key={idx} className="p-4 bg-[#E5E7EB]/20 border border-[#687280]/15 rounded-xl space-y-3 relative">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Section {idx + 1}</label>
                          <button
                            type="button"
                            onClick={() => {
                              const newSections = (pageData.sections || []).filter((_, i) => i !== idx);
                              setPageData(prev => ({ ...prev, sections: newSections }));
                            }}
                            className="text-red-500 hover:text-red-700 text-[10px] font-bold"
                          >
                            Delete Section
                          </button>
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-[#687280] font-semibold">Heading Title</label>
                          <input
                            type="text"
                            value={sec?.heading || ""}
                            onChange={(e) => {
                              const newSections = [...(pageData.sections || [])];
                              newSections[idx] = { ...(newSections[idx] || {}), heading: e.target.value };
                              setPageData((prev) => ({ ...prev, sections: newSections }));
                            }}
                            className="w-full px-3 py-2 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg focus:outline-none transition-all font-semibold"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-[#687280] font-semibold">Clause Text Content</label>
                          <textarea
                            rows="4"
                            value={sec?.text || ""}
                            onChange={(e) => {
                              const newSections = [...(pageData.sections || [])];
                              newSections[idx] = { ...(newSections[idx] || {}), text: e.target.value };
                              setPageData((prev) => ({ ...prev, sections: newSections }));
                            }}
                            className="w-full px-3 py-2 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg focus:outline-none transition-all leading-relaxed"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Action Submit Button */}
            <div className="border-t border-[#687280]/20 pt-5 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-[#FF6A00] hover:bg-orange-500 text-black font-extrabold rounded-xl transition-all shadow-lg flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 bg-black rounded-full animate-ping shrink-0"></span>
                    Syncing database...
                  </>
                ) : (
                  <>
                    <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    Commit Page Changes
                  </>
                )}
              </button>
            </div>

          </form>
        )}
      </div>
    </div>
  );
};

export default CMSManager;
