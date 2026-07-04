import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../services/api";

const CMSManager = () => {
  const { page } = useParams();
  const navigate = useNavigate();
  const activeTab = page && ["home", "about", "services"].includes(page.toLowerCase()) ? page.toLowerCase() : "home";

  const [loading, setLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState("");

  // CMS state for all pages
  const [homeData, setHomeData] = useState(null);
  const [aboutData, setAboutData] = useState(null);
  const [servicesData, setServicesData] = useState(null);

  // Fetch page content on tab activation or component mount
  const fetchPageData = async (page) => {
    setLoading(true);
    setError("");
    try {
      const res = await API.get(`/page-content/${page}`);
      if (page === "home") setHomeData(res.data.sections);
      if (page === "about") setAboutData(res.data.sections);
      if (page === "services") setServicesData(res.data.sections);
    } catch (err) {
      console.error(`Failed to load ${page} page content`, err);
      setError(`Failed to fetch database content for ${page} page. Please verify your backend connection.`);
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

    let sectionsPayload = null;
    if (activeTab === "home") sectionsPayload = homeData;
    if (activeTab === "about") sectionsPayload = aboutData;
    if (activeTab === "services") sectionsPayload = servicesData;

    try {
      await API.put(`/page-content/${activeTab}`, { sections: sectionsPayload });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
      alert(`Success: ${activeTab.toUpperCase()} page sections updated and committed successfully!`);
    } catch (err) {
      console.error(`Failed to update ${activeTab} page content`, err);
      setError(`Error committing changes to database: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Helper change handlers
  const updateNestedField = (page, section, field, value) => {
    if (page === "home") {
      setHomeData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      }));
    }
    if (page === "about") {
      setAboutData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      }));
    }
    if (page === "services") {
      setServicesData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      }));
    }
  };

  // Render Loading indicator
  const renderLoading = () => (
    <div className="flex items-center justify-center p-12 text-xs font-semibold text-gray-500 gap-2">
      <span className="w-2.5 h-2.5 bg-[#FF6A00] rounded-full animate-ping"></span>
      Fetching dynamic sections payload...
    </div>
  );

  return (
    <div className="space-y-8 select-none max-w-5xl mx-auto text-[#0A1F44]">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Website Content Manager (CMS)</h1>
        <p className="text-sm text-[#687280]">Modify and audit public website text grids, hero elements, CTA labels, and performance statistics in real time.</p>
      </div>

      {/* Tabs Menu */}
      <div className="glass-card p-2 rounded-xl border border-[#687280]/20 flex gap-1 w-fit bg-white/50">
        {["home", "about", "services"].map((tab) => (
          <button
            key={tab}
            onClick={() => navigate(`/admin/cms/${tab}`)}
            className={`px-5 py-1.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider ${
              activeTab === tab
                ? "bg-[#FF6A00] text-[#0A1F44] font-bold shadow-md"
                : "text-[#687280] hover:text-[#0A1F44]"
            }`}
          >
            {tab} Page
          </button>
        ))}
      </div>

      {/* Save Success Alert */}
      {isSaved && (
        <div className="p-3.5 bg-green-100 border border-green-500/20 text-green-600 rounded-xl text-xs flex items-center gap-2 animate-[fadeIn_0.3s_ease-out] font-semibold">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
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

        {loading && !homeData && !aboutData && !servicesData ? (
          renderLoading()
        ) : (
          <form onSubmit={handleSave} className="space-y-8 text-xs">
            
            {/* ==================== HOME PAGE CMS ==================== */}
            {activeTab === "home" && homeData && (
              <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
                <div>
                  <h3 className="text-sm font-bold border-b border-[#687280]/20 pb-2 mb-4">1. Hero Section</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[#687280] font-semibold">Main Heading Title</label>
                      <input
                        type="text"
                        value={homeData.hero.title}
                        onChange={(e) => updateNestedField("home", "hero", "title", e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg focus:outline-none transition-all font-semibold"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[#687280] font-semibold">Sub-heading Description</label>
                      <textarea
                        rows="3"
                        value={homeData.hero.description}
                        onChange={(e) => updateNestedField("home", "hero", "description", e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg focus:outline-none transition-all resize-none leading-relaxed"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-[#687280] font-semibold">Primary CTA Label</label>
                        <input
                          type="text"
                          value={homeData.hero.cta1}
                          onChange={(e) => updateNestedField("home", "hero", "cta1", e.target.value)}
                          className="w-full px-4 py-2.5 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg focus:outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-[#687280] font-semibold">Secondary CTA Label</label>
                        <input
                          type="text"
                          value={homeData.hero.cta2}
                          onChange={(e) => updateNestedField("home", "hero", "cta2", e.target.value)}
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
                        value={homeData.stats.title}
                        onChange={(e) => updateNestedField("home", "stats", "title", e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg focus:outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[#687280] font-semibold">Stats Description Subtext</label>
                      <input
                        type="text"
                        value={homeData.stats.description}
                        onChange={(e) => updateNestedField("home", "stats", "description", e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">Metrics Slabs</span>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {homeData.stats.items.map((item, idx) => (
                      <div key={idx} className="p-3 bg-[#E5E7EB]/20 border border-[#687280]/15 rounded-xl space-y-2">
                        <div className="space-y-1">
                          <label className="text-[10px] text-gray-500 font-semibold">Metric {idx + 1} Target</label>
                          <input
                            type="text"
                            value={item.value}
                            onChange={(e) => {
                              const newItems = [...homeData.stats.items];
                              newItems[idx].value = e.target.value;
                              setHomeData((prev) => ({
                                ...prev,
                                stats: { ...prev.stats, items: newItems },
                              }));
                            }}
                            className="w-full px-2.5 py-1.5 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-md font-bold text-[#FF6A00] font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-gray-500 font-semibold">Label Description</label>
                          <input
                            type="text"
                            value={item.label}
                            onChange={(e) => {
                              const newItems = [...homeData.stats.items];
                              newItems[idx].label = e.target.value;
                              setHomeData((prev) => ({
                                ...prev,
                                stats: { ...prev.stats, items: newItems },
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
                  <h3 className="text-sm font-bold border-b border-[#687280]/20 pb-2 mb-4">3. Bottom Call-to-Action</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[#687280] font-semibold">CTA Box Heading</label>
                      <input
                        type="text"
                        value={homeData.cta.title}
                        onChange={(e) => updateNestedField("home", "cta", "title", e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg focus:outline-none transition-all font-semibold"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[#687280] font-semibold">CTA Button Label</label>
                      <input
                        type="text"
                        value={homeData.cta.buttonText}
                        onChange={(e) => updateNestedField("home", "cta", "buttonText", e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg focus:outline-none transition-all font-bold"
                      />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="block text-[#687280] font-semibold">CTA Subtext Description</label>
                      <input
                        type="text"
                        value={homeData.cta.description}
                        onChange={(e) => updateNestedField("home", "cta", "description", e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ==================== ABOUT PAGE CMS ==================== */}
            {activeTab === "about" && aboutData && (
              <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
                <div>
                  <h3 className="text-sm font-bold border-b border-[#687280]/20 pb-2 mb-4">1. About Hero</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[#687280] font-semibold">Headline</label>
                      <input
                        type="text"
                        value={aboutData.hero.title}
                        onChange={(e) => updateNestedField("about", "hero", "title", e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg focus:outline-none transition-all font-semibold"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[#687280] font-semibold">Subtext</label>
                      <textarea
                        rows="2"
                        value={aboutData.hero.description}
                        onChange={(e) => updateNestedField("about", "hero", "description", e.target.value)}
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
                        value={aboutData.whoWeAre.title}
                        onChange={(e) => updateNestedField("about", "whoWeAre", "title", e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg focus:outline-none transition-all font-semibold"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[#687280] font-semibold">Detailed Paragraph Description</label>
                      <textarea
                        rows="3"
                        value={aboutData.whoWeAre.description}
                        onChange={(e) => updateNestedField("about", "whoWeAre", "description", e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg focus:outline-none transition-all resize-none leading-relaxed"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[#687280] font-semibold">Bullet Points (separated by newlines)</label>
                      <textarea
                        rows="4"
                        value={aboutData.whoWeAre.points}
                        onChange={(e) => updateNestedField("about", "whoWeAre", "points", e.target.value)}
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
                          value={aboutData.missionVision.missionTitle}
                          onChange={(e) => updateNestedField("about", "missionVision", "missionTitle", e.target.value)}
                          className="w-full px-3 py-2 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg focus:outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[#687280] font-semibold">Mission Description</label>
                        <textarea
                          rows="3"
                          value={aboutData.missionVision.missionDesc}
                          onChange={(e) => updateNestedField("about", "missionVision", "missionDesc", e.target.value)}
                          className="w-full px-3 py-2 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg focus:outline-none transition-all resize-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-3 bg-[#E5E7EB]/25 p-4 rounded-xl border border-[#687280]/15">
                      <div className="space-y-1">
                        <label className="block text-[#687280] font-semibold">Vision Card Title</label>
                        <input
                          type="text"
                          value={aboutData.missionVision.visionTitle}
                          onChange={(e) => updateNestedField("about", "missionVision", "visionTitle", e.target.value)}
                          className="w-full px-3 py-2 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg focus:outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[#687280] font-semibold">Vision Description</label>
                        <textarea
                          rows="3"
                          value={aboutData.missionVision.visionDesc}
                          onChange={(e) => updateNestedField("about", "missionVision", "visionDesc", e.target.value)}
                          className="w-full px-3 py-2 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg focus:outline-none transition-all resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#687280]/20 pt-6">
                  <h3 className="text-sm font-bold border-b border-[#687280]/20 pb-2 mb-4">4. Why Choose Us (Badges)</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {aboutData.whyChooseUs.items.map((item, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <label className="block text-[#687280] font-semibold">Badge {idx + 1}</label>
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => {
                            const newItems = [...aboutData.whyChooseUs.items];
                            newItems[idx] = e.target.value;
                            setAboutData((prev) => ({
                              ...prev,
                              whyChooseUs: { ...prev.whyChooseUs, items: newItems },
                            }));
                          }}
                          className="w-full px-4 py-2 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg focus:outline-none transition-all font-semibold text-center"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ==================== SERVICES PAGE CMS ==================== */}
            {activeTab === "services" && servicesData && (
              <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
                <div>
                  <h3 className="text-sm font-bold border-b border-[#687280]/20 pb-2 mb-4">1. Services Hero</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[#687280] font-semibold">Heading Title</label>
                      <input
                        type="text"
                        value={servicesData.hero.title}
                        onChange={(e) => updateNestedField("services", "hero", "title", e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg focus:outline-none transition-all font-semibold"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[#687280] font-semibold">Headline Subtext</label>
                      <textarea
                        rows="2"
                        value={servicesData.hero.description}
                        onChange={(e) => updateNestedField("services", "hero", "description", e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg focus:outline-none transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#687280]/20 pt-6">
                  <h3 className="text-sm font-bold border-b border-[#687280]/20 pb-2 mb-4">2. Services Grid</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {servicesData.servicesGrid.items.map((item, idx) => (
                      <div key={idx} className="p-4 bg-[#E5E7EB]/20 border border-[#687280]/15 rounded-xl space-y-3">
                        <div className="flex gap-4">
                          <div className="space-y-1 flex-1">
                            <label className="text-[10px] text-gray-500 font-semibold">Service {idx + 1} Title</label>
                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) => {
                                const newItems = [...servicesData.servicesGrid.items];
                                newItems[idx].title = e.target.value;
                                setServicesData((prev) => ({
                                  ...prev,
                                  servicesGrid: { ...prev.servicesGrid, items: newItems },
                                }));
                              }}
                              className="w-full px-3 py-1.5 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-md font-bold"
                            />
                          </div>
                          <div className="space-y-1 w-28">
                            <label className="text-[10px] text-gray-500 font-semibold">Icon Identifier</label>
                            <select
                              value={item.icon}
                              onChange={(e) => {
                                const newItems = [...servicesData.servicesGrid.items];
                                newItems[idx].icon = e.target.value;
                                setServicesData((prev) => ({
                                  ...prev,
                                  servicesGrid: { ...prev.servicesGrid, items: newItems },
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
                            value={item.desc}
                            onChange={(e) => {
                              const newItems = [...servicesData.servicesGrid.items];
                              newItems[idx].desc = e.target.value;
                              setServicesData((prev) => ({
                                ...prev,
                                servicesGrid: { ...prev.servicesGrid, items: newItems },
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
                        value={servicesData.featuresDetail.title}
                        onChange={(e) => updateNestedField("services", "featuresDetail", "title", e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg focus:outline-none transition-all font-semibold"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[#687280] font-semibold">Features Block Subtext</label>
                      <input
                        type="text"
                        value={servicesData.featuresDetail.description}
                        onChange={(e) => updateNestedField("services", "featuresDetail", "description", e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#E5E7EB]/40 border border-[#687280]/20 focus:border-[#FF6A00]/30 rounded-lg focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">Bullet Points list</span>
                  <div className="space-y-2 max-w-xl">
                    {servicesData.featuresDetail.points.map((pt, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <span className="font-bold text-gray-400 font-mono w-4">{idx + 1}.</span>
                        <input
                          type="text"
                          value={pt}
                          onChange={(e) => {
                            const newPoints = [...servicesData.featuresDetail.points];
                            newPoints[idx] = e.target.value;
                            setServicesData((prev) => ({
                              ...prev,
                              featuresDetail: { ...prev.featuresDetail, points: newPoints },
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
