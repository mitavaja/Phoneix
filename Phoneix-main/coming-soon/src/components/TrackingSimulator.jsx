import React, { useState } from 'react';
import { Search, Package, CheckCircle2, Clock, MapPin, Truck, Plane, AlertCircle, ArrowRight, RefreshCw, ShieldCheck } from 'lucide-react';

const SAMPLE_PARCELS = {
  'PX-8890-US': {
    code: 'PX-8890-US',
    origin: 'Shanghai Air Freight Terminal (PVG)',
    destination: 'New York JFK Hub, USA',
    courier: 'Phoenix Express Air Prime',
    flight: 'PX-904 Boeing 777-F',
    weight: '4.8 kg (Electronics & Cargo)',
    estimatedDelivery: 'Tomorrow, 14:00 EST',
    currentStep: 3,
    steps: [
      { title: 'Package Registered & Barcode Generated', time: 'Aug 04, 08:30 AM', location: 'Shanghai Logistics Hub', status: 'completed' },
      { title: 'Passed Export Customs & Security Screening', time: 'Aug 04, 02:15 PM', location: 'Shanghai Airport Customs', status: 'completed' },
      { title: 'Loaded on International Cargo Flight PX-904', time: 'Aug 05, 01:00 AM', location: 'In Transit Over Pacific', status: 'completed' },
      { title: 'In Flight - Scheduled Landing JFK', time: 'Aug 05, 10:45 AM', location: 'New York Hub Approach', status: 'current' },
      { title: 'Out for Final Express Delivery', time: 'Pending', location: 'Manhattan Distribution Center', status: 'upcoming' },
    ]
  },
  'PX-4421-EU': {
    code: 'PX-4421-EU',
    origin: 'Frankfurt Hub (FRA), Germany',
    destination: 'London Heathrow (LHR), UK',
    courier: 'Phoenix Euro-Express Air',
    flight: 'PX-202 Airbus A330',
    weight: '12.4 kg (Automotive Parts)',
    estimatedDelivery: 'Today, 18:30 GMT',
    currentStep: 4,
    steps: [
      { title: 'Merchant Package Handover', time: 'Aug 04, 10:00 AM', location: 'Frankfurt Depot', status: 'completed' },
      { title: 'EU Export Clearance Completed', time: 'Aug 04, 04:30 PM', location: 'Frankfurt Cargo City', status: 'completed' },
      { title: 'Air Transit to London Heathrow', time: 'Aug 05, 06:00 AM', location: 'LHR Cargo Gate 4', status: 'completed' },
      { title: 'UK Customs Cleared & Sorted', time: 'Aug 05, 11:20 AM', location: 'London Hub', status: 'completed' },
      { title: 'Out for Delivery with Last-Mile Van', time: 'Aug 05, 02:10 PM', location: 'Central London Route', status: 'current' },
    ]
  },
  'PX-9012-ASIA': {
    code: 'PX-9012-ASIA',
    origin: 'Dubai Logistics City (DXB)',
    destination: 'Singapore Changi (SIN)',
    courier: 'Phoenix Global Connect',
    flight: 'PX-771 Air Cargo',
    weight: '2.1 kg (Luxury Fashion Goods)',
    estimatedDelivery: 'Aug 07, 09:00 SGT',
    currentStep: 2,
    steps: [
      { title: 'Digital Invoice & Customs Manifest Uploaded', time: 'Aug 05, 09:00 AM', location: 'Dubai HQ', status: 'completed' },
      { title: 'Sorted & Prepared for Flight Dispatch', time: 'Aug 05, 01:40 PM', location: 'DXB Air Gateway', status: 'current' },
      { title: 'International Cargo Flight En Route', time: 'Pending', location: 'Indian Ocean Transit', status: 'upcoming' },
      { title: 'Import Customs Inspection', time: 'Pending', location: 'Singapore Changi', status: 'upcoming' },
      { title: 'Delivered to Recipient', time: 'Pending', location: 'Singapore Downtown', status: 'upcoming' },
    ]
  }
};

export default function TrackingSimulator() {
  const [inputCode, setInputCode] = useState('PX-8890-US');
  const [activeParcel, setActiveParcel] = useState(SAMPLE_PARCELS['PX-8890-US']);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSearch = (e) => {
    e?.preventDefault();
    setErrorMessage('');
    const cleaned = inputCode.trim().toUpperCase();

    if (!cleaned) {
      setErrorMessage('Please enter a valid tracking number');
      return;
    }

    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      if (SAMPLE_PARCELS[cleaned]) {
        setActiveParcel(SAMPLE_PARCELS[cleaned]);
      } else {
        // Fallback dynamically generated object for custom input
        setActiveParcel({
          code: cleaned,
          origin: 'Global Shipping Point',
          destination: 'Destination Terminal',
          courier: 'Phoenix AI Multi-Carrier',
          flight: 'PX-DYNAMIC-88',
          weight: '3.5 kg',
          estimatedDelivery: '3 Days via Express Routing',
          currentStep: 2,
          steps: [
            { title: 'Shipment Registered on Phoenix Platform', time: 'Just now', location: 'Origin Gateway', status: 'completed' },
            { title: 'AI Route Optimization Selected Lowest Cost Courier', time: 'Just now', location: 'Phoenix Smart Router', status: 'current' },
            { title: 'In Transit to International Distribution Hub', time: 'Pending', location: 'Air Freight Cargo', status: 'upcoming' },
            { title: 'Automated Customs Clearance', time: 'Pending', location: 'Destination Customs', status: 'upcoming' },
            { title: 'Final Doorstep Delivery', time: 'Pending', location: 'Customer Location', status: 'upcoming' },
          ]
        });
      }
    }, 600);
  };

  const handleSampleClick = (code) => {
    setInputCode(code);
    setActiveParcel(SAMPLE_PARCELS[code]);
  };

  return (
    <div id="tracking" className="w-full glass-card rounded-2xl p-6 sm:p-8 border border-cyan-500/30 shadow-2xl relative">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-xs font-mono text-cyan-300 mb-2">
            <Package className="w-3.5 h-3.5 text-cyan-400" />
            <span>INTERACTIVE FEATURE DEMO</span>
          </div>
          <h3 className="font-display font-bold text-2xl text-white">
            Live Parcel Tracking Engine
          </h3>
          <p className="text-sm text-slate-400">
            Experience our unified multi-courier tracking interface in action before launch.
          </p>
        </div>

        {/* Quick Sample Tracking Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">Try Samples:</span>
          {Object.keys(SAMPLE_PARCELS).map((code) => (
            <button
              key={code}
              onClick={() => handleSampleClick(code)}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                activeParcel.code === code
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-cyan-500/40'
              }`}
            >
              {code}
            </button>
          ))}
        </div>
      </div>

      {/* Input Search Form */}
      <form onSubmit={handleSearch} className="my-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            placeholder="Enter tracking number (e.g. PX-8890-US)"
            className="w-full pl-12 pr-4 py-3.5 rounded-xl glass-input text-white text-sm placeholder-slate-500 font-mono tracking-wider"
          />
        </div>
        <button
          type="submit"
          disabled={isSearching}
          className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20"
        >
          {isSearching ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
              <span>Fetching Telemetry...</span>
            </>
          ) : (
            <>
              <span>Track Parcel</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {errorMessage && (
        <div className="mb-4 p-3 rounded-lg bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Active Parcel Telemetry Detail */}
      {activeParcel && (
        <div className="rounded-xl bg-[#070d1e] border border-cyan-900/50 p-5 sm:p-6 space-y-6">
          
          {/* Summary Meta Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-5 border-b border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block mb-1">Tracking Number</span>
              <span className="font-mono font-bold text-cyan-300 text-base">{activeParcel.code}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Courier Carrier</span>
              <span className="font-medium text-white flex items-center gap-1.5">
                <Plane className="w-3.5 h-3.5 text-cyan-400" />
                {activeParcel.courier}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Parcel Weight & Type</span>
              <span className="font-medium text-white">{activeParcel.weight}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Est. Delivery Window</span>
              <span className="font-mono font-bold text-emerald-400 text-sm">{activeParcel.estimatedDelivery}</span>
            </div>
          </div>

          {/* Route Overview: Origin -> Destination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/70 border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Origin</span>
                <span className="text-xs font-semibold text-white">{activeParcel.origin}</span>
              </div>
            </div>

            <div className="flex-1 flex items-center gap-2 px-4 w-full sm:w-auto">
              <div className="h-[2px] flex-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-1.5 rounded-full bg-cyan-400 text-slate-950 animate-pulse">
                  <Plane className="w-3 h-3 rotate-90" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Destination</span>
                <span className="text-xs font-semibold text-white">{activeParcel.destination}</span>
              </div>
            </div>
          </div>

          {/* Steps Timeline Visual */}
          <div className="space-y-4 pt-2">
            <h4 className="font-mono text-xs text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Real-Time Audit Trail Events</span>
            </h4>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-800">
              {activeParcel.steps.map((step, idx) => {
                const isDone = step.status === 'completed';
                const isCurrent = step.status === 'current';

                return (
                  <div key={idx} className="relative flex items-start gap-4 group">
                    {/* Circle Node */}
                    <div className={`absolute -left-6 top-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                      isDone 
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/40' 
                        : isCurrent 
                          ? 'bg-blue-500 text-white animate-pulse shadow-md shadow-blue-500/50' 
                          : 'bg-slate-900 border border-slate-700 text-slate-500'
                    }`}>
                      {isDone ? '✓' : idx + 1}
                    </div>

                    <div className="flex-1 bg-slate-900/40 p-3 rounded-lg border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-semibold ${isCurrent ? 'text-cyan-300' : isDone ? 'text-white' : 'text-slate-400'}`}>
                            {step.title}
                          </span>
                          {isCurrent && (
                            <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono border border-cyan-500/30">
                              IN PROGRESS
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          {step.location}
                        </span>
                      </div>

                      <div className="text-[11px] font-mono text-slate-400 self-start sm:self-center">
                        {step.time}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 text-[11px] text-slate-400 border-t border-slate-800/60 font-mono">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              AES-256 Encrypted Telemetry Link
            </span>
            <span>Refreshed: Just now</span>
          </div>

        </div>
      )}

    </div>
  );
}
