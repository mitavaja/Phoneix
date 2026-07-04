import React, { useState, useEffect } from "react";
import API from "../../services/api";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  UploadCloud,
  Wallet,
  Home,
  ShieldAlert,
  HelpCircle,
  Bell,
  Search,
  Filter,
  Download,
  Calendar,
  Plus,
  Upload,
  Trash2,
  CheckCircle,
  Clock,
  AlertTriangle,
  Send,
  Check,
  ChevronDown,
  ChevronUp,
  MapPin,
  FileText
} from "lucide-react";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState(() => {
    const saved = localStorage.getItem("dashboard_active_tab");
    if (saved) {
      localStorage.removeItem("dashboard_active_tab");
      return saved;
    }
    return "overview";
  });
  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [wallets, setWallets] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState("INR");
  const [transactions, setTransactions] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [claims, setClaims] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [notifications, setNotifications] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Single Shipment Form
  const [singleForm, setSingleForm] = useState({
    customer: "",
    receiverName: "",
    receiverMobile: "",
    receiverAddress: "",
    receiverCity: "",
    receiverState: "",
    receiverCountry: "AE",
    receiverPincode: "",
    pickupAddressId: "",
    weight: "",
    length: "",
    width: "",
    height: "",
    shipmentType: "Parcel",
    productDescription: "",
    shipmentValue: "",
  });
  const [estimateResult, setEstimateResult] = useState(null);
  const [estimating, setEstimating] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState("");

  // Warehouse Add Form
  const [showAddWarehouse, setShowAddWarehouse] = useState(false);
  const [warehouseForm, setWarehouseForm] = useState({
    addressName: "",
    contactPerson: "",
    mobile: "",
    address: "",
    city: "",
    state: "",
    country: "IN",
    pincode: "",
    isDefault: false
  });
  
  // Bulk Upload Form
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [bulkValidationError, setBulkValidationError] = useState("");
  const [bulkResult, setBulkResult] = useState(null);
  const [bulkConfirming, setBulkConfirming] = useState(false);

  // Wallet Recharge Forms
  const [rechargeAmount, setRechargeAmount] = useState("");
  const [utrAmount, setUtrAmount] = useState("");
  const [utrNumber, setUtrNumber] = useState("");
  const [rechargeSuccess, setRechargeSuccess] = useState("");
  const [rechargeError, setRechargeError] = useState("");
  const [showMockRazorpay, setShowMockRazorpay] = useState(false);
  const [mockOrderDetails, setMockOrderDetails] = useState(null);
  const [mockKeyId, setMockKeyId] = useState("");

  // Coupon States
  const [coupons, setCoupons] = useState([]);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);

  // Claims Form
  const [claimForm, setClaimForm] = useState({
    shipmentId: "",
    claimType: "Lost Shipment",
    description: "",
    claimAmount: "",
  });
  const [claimSuccess, setClaimSuccess] = useState("");
  const [claimError, setClaimError] = useState("");

  // Tickets Form
  const [ticketForm, setTicketForm] = useState({
    subject: "",
    type: "Shipment Issue",
    description: ""
  });
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketReply, setTicketReply] = useState("");
  const [ticketSuccess, setTicketSuccess] = useState("");

  // Expandable shipment ID for tracking details
  const [expandedShipmentId, setExpandedShipmentId] = useState(null);
  const [shipmentTrackingSteps, setShipmentTrackingSteps] = useState({});
  const [trackingLoading, setTrackingLoading] = useState(false);

  // Pickup scheduling modal
  const [schedulingShipment, setSchedulingShipment] = useState(null);
  const [pickupDate, setPickupDate] = useState("");

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token") || localStorage.getItem("jwt");
    if (!token) {
      navigate("/login");
      return;
    }
    fetchInitialData();
  }, []);

  // Auto-refresh helpdesk ticket messages and roster
  useEffect(() => {
    let interval;
    if (activeTab === "tickets") {
      interval = setInterval(() => {
        refreshTickets();
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTab, selectedTicket]);

  const fetchInitialData = async () => {
    setLoading(true);
    setError("");
    try {
      // 1. Get user profile
      const userRes = await API.get("/auth/me");
      setUser(userRes.data);

      if (userRes.data.role !== "Seller" && userRes.data.role !== "Admin") {
        setError("Only registered sellers can access the logistics dashboard.");
        setLoading(false);
        return;
      }

      // 2. Fetch Wallet & Transactions
      await fetchWalletData();

      // 3. Fetch Shipments
      const shipmentsRes = await API.get("/shipments/list");
      setShipments(shipmentsRes.data || []);

      // 4. Fetch Warehouses
      const warehouseRes = await API.get("/warehouses/my-addresses");
      setWarehouses(warehouseRes.data || []);
      if (warehouseRes.data && warehouseRes.data.length > 0) {
        const defaultWh = warehouseRes.data.find(w => w.isDefault) || warehouseRes.data[0];
        setSingleForm(prev => ({ ...prev, pickupAddressId: defaultWh._id }));
      }

      // 5. Fetch Claims
      const claimsRes = await API.get("/tickets/my-claims");
      setClaims(claimsRes.data || []);

      // 6. Fetch Tickets
      const ticketsRes = await API.get("/tickets/my-tickets");
      setTickets(ticketsRes.data || []);

      // 7. Fetch Notifications
      const notifRes = await API.get("/notifications");
      setNotifications(notifRes.data || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to initialize Seller Dashboard. Verify API connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (wallets && wallets.length > 0) {
      const activeWallet = wallets.find(w => w.currency === selectedCurrency);
      setWallet(activeWallet || wallets[0]);
    }
  }, [selectedCurrency, wallets]);

  const fetchWalletData = async () => {
    try {
      const walletRes = await API.get("/wallet/me");
      setWallets(walletRes.data.wallets || []);
      setTransactions(walletRes.data.transactions || []);

      setCouponLoading(true);
      const couponsRes = await API.get("/coupons/applicable");
      setCoupons(couponsRes.data.coupons || []);
      setIsFirstTime(couponsRes.data.isFirstTime || false);
    } catch (err) {
      console.error("Wallet or coupon loading error", err);
    } finally {
      setCouponLoading(false);
    }
  };

  const refreshShipments = async () => {
    try {
      const shipmentsRes = await API.get("/shipments/list");
      setShipments(shipmentsRes.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const refreshWarehouses = async () => {
    try {
      const warehouseRes = await API.get("/warehouses/my-addresses");
      setWarehouses(warehouseRes.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const refreshClaims = async () => {
    try {
      const claimsRes = await API.get("/tickets/my-claims");
      setClaims(claimsRes.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const refreshTickets = async () => {
    try {
      const ticketsRes = await API.get("/tickets/my-tickets");
      setTickets(ticketsRes.data || []);
      if (selectedTicket) {
        const updated = ticketsRes.data.find(t => t._id === selectedTicket._id);
        if (updated) setSelectedTicket(updated);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const refreshNotifications = async () => {
    try {
      const notifRes = await API.get("/notifications");
      setNotifications(notifRes.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // 1. Single Booking Estimator
  const handleEstimateSingle = async () => {
    const { weight, length, width, height, receiverCountry, shipmentType } = singleForm;
    if (!weight || !receiverCountry) {
      setBookingError("Please provide at least a weight limit and destination country.");
      return;
    }

    setBookingError("");
    setEstimateResult(null);
    setEstimating(true);

    try {
      const res = await API.post("/rates/calculate", {
        originCountry: "IN",
        destinationCountry: receiverCountry,
        weight: parseFloat(weight),
        length: length ? parseFloat(length) : 0,
        width: width ? parseFloat(width) : 0,
        height: height ? parseFloat(height) : 0,
        shipmentType
      });
      setEstimateResult(res.data);
    } catch (err) {
      setBookingError(err.response?.data?.message || "Rate estimation failed.");
    } finally {
      setEstimating(false);
    }
  };

  // 2. Submit Single Booking
  const handleBookSingle = async (e) => {
    e.preventDefault();
    setBookingError("");
    setBookingSuccess("");

    if (user?.status !== "Active") {
      setBookingError("Booking locked: Your store account KYC status is currently not Active.");
      return;
    }

    const { customer, receiverMobile, receiverAddress, receiverCountry, pickupAddressId, weight } = singleForm;
    if (!customer || !receiverMobile || !receiverAddress || !receiverCountry || !pickupAddressId || !weight) {
      setBookingError("Please fill out recipient details, weight, and pickup warehouse.");
      return;
    }

    setBookingLoading(true);
    try {
      const res = await API.post("/shipments/book", singleForm);
      setBookingSuccess(res.data.message || "Shipment successfully booked!");
      setSingleForm({
        customer: "",
        receiverName: "",
        receiverMobile: "",
        receiverAddress: "",
        receiverCity: "",
        receiverState: "",
        receiverCountry: "AE",
        receiverPincode: "",
        pickupAddressId: warehouses[0]?._id || "",
        weight: "",
        length: "",
        width: "",
        height: "",
        shipmentType: "Parcel",
        productDescription: "",
        shipmentValue: "",
      });
      setEstimateResult(null);
      await fetchWalletData();
      await refreshShipments();
    } catch (err) {
      setBookingError(err.response?.data?.message || "Booking request failed.");
    } finally {
      setBookingLoading(false);
    }
  };

  // 3. Double-Pass Bulk Upload
  const handleBulkFileChange = (e) => {
    setBulkFile(e.target.files[0]);
    setBulkResult(null);
    setBulkValidationError("");
  };

  const handleBulkUploadValidate = async () => {
    if (!bulkFile) {
      setBulkValidationError("Please select a CSV upload file.");
      return;
    }

    setBulkValidationError("");
    setBulkProcessing(true);
    const formData = new FormData();
    formData.append("file", bulkFile);

    try {
      const res = await API.post("/shipments/bulk-upload", formData);
      setBulkResult(res.data);
    } catch (err) {
      setBulkValidationError(err.response?.data?.message || "Error parsing or validating bulk file.");
    } finally {
      setBulkProcessing(false);
    }
  };

  const handleBulkConfirm = async () => {
    if (!bulkResult || !bulkResult.validRows || bulkResult.validRows.length === 0) return;
    
    setBulkValidationError("");
    setBulkConfirming(true);

    try {
      const res = await API.post("/shipments/bulk-confirm", {
        validRows: bulkResult.validRows
      });
      alert(res.data.message || `Successfully booked ${bulkResult.validRows.length} shipments.`);
      setBulkFile(null);
      setBulkResult(null);
      await fetchWalletData();
      await refreshShipments();
      setActiveTab("shipments");
    } catch (err) {
      setBulkValidationError(err.response?.data?.message || "Failed to commit bulk bookings.");
    } finally {
      setBulkConfirming(false);
    }
  };

  // 4. Download PDF Invoice (Blob-safe)
  const handleDownloadInvoice = async (shipmentDbId, shipmentCode) => {
    try {
      const res = await API.get(`/shipments/${shipmentDbId}/invoice`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice-${shipmentCode}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Error printing PDF invoice. Try again.");
    }
  };

  // 5. Expand Tracking Timeline
  const toggleExpandShipment = async (shId, dbId) => {
    if (expandedShipmentId === shId) {
      setExpandedShipmentId(null);
      return;
    }

    setExpandedShipmentId(shId);
    if (shipmentTrackingSteps[dbId]) return; // Already cached

    setTrackingLoading(true);
    try {
      const res = await API.get(`/tracking/${shId}`);
      setShipmentTrackingSteps(prev => ({
        ...prev,
        [dbId]: res.data.trackingSteps || []
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setTrackingLoading(false);
    }
  };

  // 6. Schedule Pickup manifest
  const handleOpenPickupModal = (sh) => {
    setSchedulingShipment(sh);
    setPickupDate(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]); // Default tomorrow
  };

  const handleSchedulePickup = async () => {
    if (!schedulingShipment) return;
    try {
      const res = await API.post("/shipments/pickup/schedule", {
        shipmentIds: [schedulingShipment._id],
        pickupDate,
        pickupAddressId: schedulingShipment.pickupAddressId
      });
      alert(res.data.message || "Pickup runner scheduled successfully.");
      setSchedulingShipment(null);
      await refreshShipments();
    } catch (err) {
      alert(err.response?.data?.message || "Courier rejected pickup manifest.");
    }
  };

  // 7. Add Warehouse Address
  const handleAddWarehouse = async (e) => {
    e.preventDefault();
    try {
      await API.post("/warehouses/add", warehouseForm);
      setShowAddWarehouse(false);
      setWarehouseForm({
        addressName: "",
        contactPerson: "",
        mobile: "",
        address: "",
        city: "",
        state: "",
        country: "IN",
        pincode: "",
        isDefault: false
      });
      await refreshWarehouses();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save warehouse.");
    }
  };

  // 8. Delete / Toggle Warehouse
  const handleDeleteWarehouse = async (id) => {
    if (!confirm("Are you sure you want to remove this warehouse location?")) return;
    try {
      await API.delete(`/warehouses/${id}`);
      await refreshWarehouses();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete warehouse.");
    }
  };

  const handleSetDefaultWarehouse = async (id) => {
    try {
      await API.put(`/warehouses/${id}/default`);
      await refreshWarehouses();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to set default warehouse.");
    }
  };

  // 9. Wallet Top Ups
  const handleSimulateRazorpay = async () => {
    if (!rechargeAmount || isNaN(parseFloat(rechargeAmount)) || parseFloat(rechargeAmount) <= 0) {
      setRechargeError("Please enter a valid recharge amount.");
      return;
    }
    setRechargeError("");
    setRechargeSuccess("");
    
    try {
      // 1. Create order
      const orderRes = await API.post("/wallet/recharge", { 
        amount: parseFloat(rechargeAmount),
        currency: selectedCurrency
      });
      const { orderDetails, keyId } = orderRes.data;
      
      const orderId = orderDetails.id;
      const isSimulatedOrder = orderDetails.simulated || keyId === "your_key_id";

      if (isSimulatedOrder) {
        // Show simulated Razorpay modal
        setMockOrderDetails(orderDetails);
        setMockKeyId(keyId);
        setShowMockRazorpay(true);
      } else {
        // Open standard Razorpay Checkout
        if (window.Razorpay) {
          const options = {
            key: keyId,
            amount: orderDetails.amount,
            currency: orderDetails.currency,
            name: "Phreight Aggregator",
            description: "Wallet Recharge",
            order_id: orderId,
            handler: async function (response) {
              try {
                const verifyRes = await API.post("/wallet/verify-recharge", {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  razorpaySignature: response.razorpay_signature,
                  amount: parseFloat(rechargeAmount),
                  couponCode: selectedCoupon ? selectedCoupon.code : undefined,
                  currency: selectedCurrency
                });
                setRechargeSuccess(verifyRes.data.message || "Wallet recharged successfully!");
                setRechargeAmount("");
                setSelectedCoupon(null);
                await fetchWalletData();
              } catch (err) {
                setRechargeError(err.response?.data?.message || "Recharge verification failed.");
              }
            },
            prefill: {
              name: user?.name,
              email: user?.email,
              contact: user?.mobileNumber
            },
            theme: {
              color: "#FF6A00"
            }
          };
          const rzp = new window.Razorpay(options);
          rzp.open();
        } else {
          setRechargeError("Razorpay SDK failed to load. Please verify internet connection.");
        }
      }
    } catch (err) {
      setRechargeError(err.response?.data?.message || "Failed to initiate recharge order.");
    }
  };

  const handleMockRazorpaySuccess = async () => {
    if (!mockOrderDetails) return;
    setShowMockRazorpay(false);
    setRechargeError("");
    setRechargeSuccess("");
    try {
      const verifyRes = await API.post("/wallet/verify-recharge", {
        razorpay_order_id: mockOrderDetails.id,
        razorpayOrderId: mockOrderDetails.id,
        razorpay_payment_id: `pay_${Math.floor(100000 + Math.random() * 900000)}`,
        razorpayPaymentId: `pay_${Math.floor(100000 + Math.random() * 900000)}`,
        razorpay_signature: "mock_sig_code",
        razorpaySignature: "mock_sig_code",
        amount: parseFloat(rechargeAmount),
        couponCode: selectedCoupon ? selectedCoupon.code : undefined,
        currency: selectedCurrency
      });
      setRechargeSuccess(verifyRes.data.message || "Simulated Wallet Recharge completed!");
      setRechargeAmount("");
      setSelectedCoupon(null);
      await fetchWalletData();
    } catch (err) {
      setRechargeError(err.response?.data?.message || "Recharge verification failed.");
    } finally {
      setMockOrderDetails(null);
    }
  };

  const handleMockRazorpayCancel = () => {
    setShowMockRazorpay(false);
    setMockOrderDetails(null);
    setRechargeError("Payment checkout cancelled by user.");
  };

  // 10. File Insurance Claim
  const handleFileClaim = async (e) => {
    e.preventDefault();
    setClaimError("");
    setClaimSuccess("");
    try {
      const res = await API.post("/tickets/claim", claimForm);
      setClaimSuccess(res.data.message || "Insurance claim request submitted successfully.");
      setClaimForm({ shipmentId: "", claimType: "Lost Shipment", description: "", claimAmount: "" });
      await refreshClaims();
    } catch (err) {
      setClaimError(err.response?.data?.message || "Dispute claim request failed.");
    }
  };

  // 11. Support Tickets
  const handleCreateTicket = async (e) => {
    e.preventDefault();
    setTicketSuccess("");
    try {
      const res = await API.post("/tickets/ticket", ticketForm);
      setTicketSuccess(res.data.message || "Support ticket created successfully.");
      setTicketForm({ subject: "", type: "Shipment Issue", description: "" });
      await refreshTickets();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to open support ticket.");
    }
  };

  const handleTicketReply = async (e) => {
    e.preventDefault();
    if (!ticketReply.trim()) return;
    try {
      await API.post(`/tickets/ticket/${selectedTicket._id}/reply`, { content: ticketReply });
      setTicketReply("");
      await refreshTickets();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send message.");
    }
  };

  const handleMarkNotificationRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      await refreshNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  // Filters shipments
  const filteredShipments = shipments.filter(sh => {
    const matchesSearch =
      sh.shipmentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sh.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sh.courierTrackingNumber && sh.courierTrackingNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === "All" || sh.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "Booked":
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#FF6A00]/10 text-[#FF6A00] border border-[#FF6A00]/20">Booked</span>;
      case "Pickup Scheduled":
      case "Pickup Requested":
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">Pickup Scheduled</span>;
      case "Picked Up":
      case "In Transit":
      case "Out For Delivery":
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20">In Transit</span>;
      case "Delivered":
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-500/10 text-green-500 border border-green-500/20">Delivered</span>;
      case "Cancelled":
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-500 border border-red-500/20">Cancelled</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-500/10 text-gray-500 border border-gray-500/20">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="bg-[#0A1F44] text-white min-h-screen flex flex-col items-center justify-center px-6">
        <div className="w-12 h-12 border-4 border-[#FF6A00] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-[#687280]">Loading Seller Workspace Node...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#0A1F44] text-white min-h-screen flex flex-col items-center justify-center px-6">
        <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Workspace Error</h2>
        <p className="text-[#687280] text-center max-w-md mb-6">{error}</p>
        <button
          onClick={() => navigate("/login")}
          className="bg-[#FF6A00] text-white font-bold px-6 py-2.5 rounded-xl hover:scale-105 transition"
        >
          Return to Portal Access
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#0A1F44] text-white min-h-screen flex">
      
      {/* 🧭 SIDEBAR NAVIGATION */}
      <aside className="w-64 shrink-0 bg-[#071630] border-r border-[#687280]/20 pt-8 flex flex-col justify-between select-none hidden md:flex sticky top-0 h-screen">
        <div className="p-4 space-y-6">
          <div className="px-3">
            <span className="text-[10px] text-[#687280] uppercase tracking-widest font-bold">Seller Portal</span>
            <h2 className="text-lg font-bold text-white truncate">{wallet?.storeName || user?.name}</h2>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`w-2 h-2 rounded-full ${user?.status === "Active" ? "bg-green-500" : "bg-orange-500 animate-pulse"}`}></span>
              <span className="text-xs text-[#687280] font-semibold">{user?.status} Merchant</span>
            </div>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                activeTab === "overview" ? "bg-[#FF6A00] text-white" : "text-[#687280] hover:bg-white/5"
              }`}
            >
              <LayoutDashboard size={18} />
              Overview Stats
            </button>

            <button
              onClick={() => setActiveTab("shipments")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                activeTab === "shipments" ? "bg-[#FF6A00] text-white" : "text-[#687280] hover:bg-white/5"
              }`}
            >
              <Package size={18} />
              Shipments Register
            </button>

            <button
              onClick={() => setActiveTab("single")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                activeTab === "single" ? "bg-[#FF6A00] text-white" : "text-[#687280] hover:bg-white/5"
              }`}
            >
              <PlusCircle size={18} />
              Single Booking
            </button>

            <button
              onClick={() => setActiveTab("bulk")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                activeTab === "bulk" ? "bg-[#FF6A00] text-white" : "text-[#687280] hover:bg-white/5"
              }`}
            >
              <UploadCloud size={18} />
              Bulk CSV Upload
            </button>

            <button
              onClick={() => setActiveTab("wallet")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                activeTab === "wallet" ? "bg-[#FF6A00] text-white" : "text-[#687280] hover:bg-white/5"
              }`}
            >
              <Wallet size={18} />
              Wallet & Ledger
            </button>

            <button
              onClick={() => setActiveTab("warehouses")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                activeTab === "warehouses" ? "bg-[#FF6A00] text-white" : "text-[#687280] hover:bg-white/5"
              }`}
            >
              <Home size={18} />
              Warehouses
            </button>

            <button
              onClick={() => setActiveTab("claims")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                activeTab === "claims" ? "bg-[#FF6A00] text-white" : "text-[#687280] hover:bg-white/5"
              }`}
            >
              <ShieldAlert size={18} />
              Insurance Claims
            </button>

            <button
              onClick={() => setActiveTab("tickets")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                activeTab === "tickets" ? "bg-[#FF6A00] text-white" : "text-[#687280] hover:bg-white/5"
              }`}
            >
              <HelpCircle size={18} />
              Helpdesk Tickets
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-[#687280]/20 text-xs text-gray-500">
          Phoenix Aggregator v1.1
        </div>
      </aside>

      {/* 🖥️ MAIN CONTENT CONTAINER */}
      <main className="flex-1 min-h-screen pt-8 pb-20 px-6 lg:px-12 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* KYC Auditing Block Notice Banner */}
          {user && user.status === "Pending" && (
            <div className="bg-[#FF6A00]/10 border border-amber-500/30 rounded-2xl p-4 flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-[#FF6A00] shrink-0 animate-pulse" />
              <div>
                <h4 className="font-semibold text-amber-500 text-sm">KYC Documents Compliance Check Pending</h4>
                <p className="text-[#687280] text-xs mt-0.5">
                  Your store document checks are in queue. Booking and dispatch API features are locked until active approval.
                </p>
              </div>
            </div>
          )}

          {user && user.status === "Blocked" && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-500 shrink-0" />
              <div>
                <h4 className="font-semibold text-red-500 text-sm">Merchant Portal Suspended</h4>
                <p className="text-[#687280] text-xs mt-0.5">
                  Administrative holds are placed on this merchant account. Booking shipping API requests are blocked.
                </p>
              </div>
            </div>
          )}

          {/* 1. OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div className="space-y-8 animate-fade-in">
              {/* Top Row Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Balance Split Card */}
                <div className="bg-[#E5E7EB]/5 border border-[#687280]/20 rounded-3xl p-6 relative overflow-hidden group">
                  <div className="absolute right-4 bottom-4 opacity-5 text-[#FF6A00] group-hover:scale-110 transition duration-500">
                    <Wallet size={120} />
                  </div>
                  <span className="text-xs text-[#687280] uppercase tracking-widest font-semibold block mb-1">Store Wallet Ledger</span>
                  <div className="space-y-4">
                    <div>
                      <span className="text-xs text-[#687280] block">Available Booking Balance</span>
                      <h3 className="text-3xl font-black text-[#FF6A00]">₹{wallet ? wallet.availableBalance.toFixed(2) : "0.00"}</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-2 border-t border-[#687280]/20 pt-3">
                      <div>
                        <span className="text-[10px] text-gray-500 block">Reserved Holds</span>
                        <span className="text-xs font-bold text-amber-500">₹{wallet ? wallet.holdBalance.toFixed(2) : "0.00"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-500 block">Total Ledger balance</span>
                        <span className="text-xs font-bold text-gray-400">₹{wallet ? wallet.totalBalance.toFixed(2) : "0.00"}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab("wallet")}
                    className="w-full mt-4 bg-white/5 border border-white/10 text-white font-bold py-2 rounded-xl text-xs hover:bg-[#FF6A00] hover:text-white transition"
                  >
                    Top Up Balance
                  </button>
                </div>

                {/* Total Shipments */}
                <div className="bg-[#E5E7EB]/5 border border-[#687280]/20 rounded-3xl p-6 relative overflow-hidden group flex flex-col justify-between">
                  <div className="absolute right-4 bottom-4 opacity-5 text-blue-500 group-hover:scale-110 transition duration-500">
                    <Package size={120} />
                  </div>
                  <div>
                    <span className="text-xs text-[#687280] uppercase tracking-widest font-semibold block mb-1">Total Manifest Shipments</span>
                    <h3 className="text-4xl font-black text-blue-500">{shipments.length}</h3>
                    <p className="text-xs text-gray-500 mt-2">Overall parcels booked on Phoenix Node.</p>
                  </div>
                  <div className="border-t border-[#687280]/20 pt-3 mt-4 flex gap-4">
                    <div>
                      <span className="text-[10px] text-gray-500 block">Delivered</span>
                      <span className="text-xs font-bold text-green-500">{shipments.filter(s => s.status === "Delivered").length}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 block">Transit Dispatch</span>
                      <span className="text-xs font-bold text-[#FF6A00]">
                        {shipments.filter(s => ["Booked", "In Transit", "Pickup Scheduled"].includes(s.status)).length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Notifications & KYC Info */}
                <div className="bg-[#E5E7EB]/5 border border-[#687280]/20 rounded-3xl p-6 flex flex-col justify-between">
                  <div>
                    <span className="text-xs text-[#687280] uppercase tracking-widest font-semibold block mb-1">Merchant Details</span>
                    <div className="space-y-2 mt-2 text-sm">
                      <p className="flex justify-between">
                        <span className="text-gray-500">Owner:</span>
                        <span className="font-semibold">{user?.name}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-gray-500">Mobile:</span>
                        <span className="font-semibold">{user?.mobileNumber || "N/A"}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-gray-500">GST Registration:</span>
                        <span className="font-semibold">{user?.gstType}</span>
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-[#687280]/20 pt-3 mt-4 flex items-center justify-between text-xs">
                    <span className="text-[#687280]">Verification Audit:</span>
                    <span className={`px-2 py-0.5 rounded font-bold ${user?.status === "Active" ? "bg-green-500/10 text-green-500" : "bg-[#FF6A00]/10 text-[#FF6A00]"}`}>
                      {user?.status}
                    </span>
                  </div>
                </div>

              </div>

              {/* Second Row: Latest Shipments & Notifications */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Latest Shipments List */}
                <div className="bg-[#E5E7EB]/5 border border-[#687280]/20 rounded-3xl p-6 lg:col-span-2 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Package size={20} className="text-[#FF6A00]" />
                      Recent Bookings
                    </h3>
                    <button onClick={() => setActiveTab("shipments")} className="text-xs text-[#FF6A00] hover:underline">
                      View All Shipments
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {shipments.slice(0, 5).map(sh => (
                      <div key={sh._id} className="bg-white/5 border border-white/10 hover:border-[#FF6A00]/30 rounded-2xl p-4 flex justify-between items-center transition">
                        <div>
                          <span className="font-semibold font-mono text-[#FF6A00] block">{sh.shipmentId}</span>
                          <span className="text-[11px] text-gray-500 block mt-0.5">{sh.customer} | {sh.to}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold block text-sm">₹{sh.invoiceTotal.toFixed(2)}</span>
                          <span className="block mt-1">{getStatusBadge(sh.status)}</span>
                        </div>
                      </div>
                    ))}
                    {shipments.length === 0 && (
                      <p className="text-gray-500 text-center py-6 text-sm">No shipments booked yet.</p>
                    )}
                  </div>
                </div>

                {/* Notifications Center Panel */}
                <div className="bg-[#E5E7EB]/5 border border-[#687280]/20 rounded-3xl p-6 space-y-4 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                      <Bell size={20} className="text-[#FF6A00]" />
                      Alerts Center
                    </h3>
                    
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                      {notifications.filter(n => !n.isRead).slice(0, 5).map(n => (
                        <div key={n._id} className="bg-black/20 border border-white/5 rounded-xl p-3 space-y-1 relative">
                          <div className="flex justify-between items-start">
                            <span className="text-xs font-bold text-[#FF6A00]">{n.title}</span>
                            <button
                              onClick={() => handleMarkNotificationRead(n._id)}
                              className="text-[9px] text-[#687280] hover:text-[#FF6A00]"
                            >
                              Dismiss
                            </button>
                          </div>
                          <p className="text-[11px] text-[#687280]">{n.message}</p>
                          <span className="text-[9px] text-gray-500 block">{new Date(n.createdAt).toLocaleDateString()}</span>
                        </div>
                      ))}
                      {notifications.filter(n => !n.isRead).length === 0 && (
                        <p className="text-gray-500 text-center py-10 text-xs">No unread notifications.</p>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* 2. SHIPMENTS REGISTER TAB */}
          {activeTab === "shipments" && (
            <div className="bg-[#E5E7EB]/5 border border-[#687280]/20 rounded-3xl p-6 space-y-6 animate-fade-in">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#687280]/20 pb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Package size={22} className="text-[#FF6A00]" />
                  Shipment Manifest Register
                </h3>

                <div className="flex flex-wrap gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-[#687280]" size={16} />
                    <input
                      type="text"
                      placeholder="Search AWB, Recipient..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white outline-none w-64 focus:ring-1 focus:ring-[#FF6A00]"
                    />
                  </div>

                  <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5">
                    <Filter size={14} className="text-[#687280]" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="bg-transparent text-xs text-white outline-none"
                    >
                      <option value="All" className="bg-[#0A1F44]">All Statuses</option>
                      <option value="Draft" className="bg-[#0A1F44]">Draft</option>
                      <option value="Booked" className="bg-[#0A1F44]">Booked</option>
                      <option value="Pickup Scheduled" className="bg-[#0A1F44]">Pickup Scheduled</option>
                      <option value="In Transit" className="bg-[#0A1F44]">In Transit</option>
                      <option value="Delivered" className="bg-[#0A1F44]">Delivered</option>
                      <option value="Cancelled" className="bg-[#0A1F44]">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#687280]/20 text-[#687280] uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">Shipment ID</th>
                      <th className="py-3 px-4">Date Booked</th>
                      <th className="py-3 px-4">Recipient</th>
                      <th className="py-3 px-4 text-center">AWB Code</th>
                      <th className="py-3 px-4 text-center">Weight</th>
                      <th className="py-3 px-4 text-right">Invoice Charge</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#687280]/10">
                    {filteredShipments.map(sh => (
                      <React.Fragment key={sh._id}>
                        <tr className="hover:bg-white/5 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-[#FF6A00]">
                            {sh.shipmentId}
                          </td>
                          <td className="py-3.5 px-4 text-[#687280]">
                            {new Date(sh.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-white">
                            {sh.customer}
                            <span className="block text-[10px] text-gray-500 truncate max-w-[150px]">{sh.to}</span>
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono font-semibold text-gray-400">
                            {sh.courierTrackingNumber || "Awaiting Allocation"}
                          </td>
                          <td className="py-3.5 px-4 text-center font-semibold text-[#687280]">
                            {sh.weight} kg
                          </td>
                          <td className="py-3.5 px-4 text-right font-bold text-white">
                            ₹{sh.invoiceTotal.toFixed(2)}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {getStatusBadge(sh.status)}
                          </td>
                          <td className="py-3.5 px-4 text-center space-x-2">
                            <button
                              onClick={() => toggleExpandShipment(sh.courierTrackingNumber || sh.shipmentId, sh._id)}
                              className="px-2.5 py-1 bg-white/5 border border-white/10 hover:border-[#FF6A00] rounded text-[10px] font-semibold text-white transition inline-flex items-center gap-1"
                            >
                              Track
                              {expandedShipmentId === (sh.courierTrackingNumber || sh.shipmentId) ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                            </button>
                            <button
                              onClick={() => handleDownloadInvoice(sh._id, sh.shipmentId)}
                              className="px-2.5 py-1 bg-[#FF6A00]/20 border border-[#FF6A00]/30 hover:bg-[#FF6A00] rounded text-[10px] font-semibold text-[#FF6A00] hover:text-white transition inline-flex items-center gap-1"
                            >
                              <Download size={10} />
                              Invoice
                            </button>
                            {sh.status === "Booked" && (
                              <button
                                onClick={() => handleOpenPickupModal(sh)}
                                className="px-2.5 py-1 bg-blue-500/20 border border-blue-500/30 hover:bg-blue-500 rounded text-[10px] font-semibold text-blue-400 hover:text-white transition inline-flex items-center gap-1"
                              >
                                <Calendar size={10} />
                                Pickup
                              </button>
                            )}
                            {["Booked", "Pickup Scheduled", "In Transit"].includes(sh.status) && (
                              <button
                                onClick={() => setClaimForm(prev => ({ ...prev, shipmentId: sh.shipmentId })) || setActiveTab("claims")}
                                className="px-2.5 py-1 bg-red-500/10 border border-red-500/20 hover:bg-red-500 rounded text-[10px] font-semibold text-red-400 hover:text-white transition inline-flex items-center gap-1"
                              >
                                Claim
                              </button>
                            )}
                          </td>
                        </tr>
                        
                        {/* Expandable Details Track Steps & Weight Discrepancies */}
                        {expandedShipmentId === (sh.courierTrackingNumber || sh.shipmentId) && (
                          <tr>
                            <td colSpan="8" className="bg-[#071630]/60 p-6 border-b border-[#687280]/20">
                              <div className="grid md:grid-cols-2 gap-8">
                                
                                {/* Track Timeline */}
                                <div className="space-y-4 border-r border-[#687280]/10 pr-6">
                                  <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                                    <Clock size={14} className="text-[#FF6A00]" />
                                    Chronological Transit Steps
                                  </h4>
                                  
                                  {trackingLoading ? (
                                    <div className="text-gray-500 text-xs py-4">Querying telemetric logs...</div>
                                  ) : shipmentTrackingSteps[sh._id] && shipmentTrackingSteps[sh._id].length > 0 ? (
                                    <div className="relative border-l border-[#FF6A00]/30 ml-2 pl-4 space-y-4 text-[11px]">
                                      {shipmentTrackingSteps[sh._id].map((step, idx) => (
                                        <div key={idx} className="relative">
                                          <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 bg-[#FF6A00] rounded-full border border-white"></div>
                                          <div>
                                            <span className="font-bold text-white block">{step.status} {step.location && `(${step.location})`}</span>
                                            <p className="text-gray-500">{step.description}</p>
                                            <span className="text-[9px] text-gray-500">{new Date(step.eventTime).toLocaleString()}</span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="relative border-l border-[#FF6A00]/30 ml-2 pl-4 space-y-4 text-[11px]">
                                      {sh.statusHistory && sh.statusHistory.length > 0 ? (
                                        sh.statusHistory.map((hist, idx) => (
                                          <div key={idx} className="relative">
                                            <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 bg-[#FF6A00] rounded-full border border-white"></div>
                                            <div>
                                              <span className="font-bold text-white block">{hist.status}</span>
                                              <span className="text-[9px] text-gray-500">{new Date(hist.time).toLocaleString()}</span>
                                            </div>
                                          </div>
                                        ))
                                      ) : (
                                        <p className="text-gray-500 text-xs">No status logs archived.</p>
                                      )}
                                    </div>
                                  )}
                                </div>

                                {/* Dimensions, Decoupled GST Breakdown, & Discrepancies */}
                                <div className="space-y-4">
                                  <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                                    <FileText size={14} className="text-[#FF6A00]" />
                                    Chargeable Details & Tax Breakdown
                                  </h4>
                                  
                                  <div className="grid grid-cols-2 gap-4 text-[11px] bg-black/20 p-4 rounded-2xl border border-white/5">
                                    <div>
                                      <span className="text-gray-500 block">Chargeable Weight:</span>
                                      <span className="font-semibold text-white">{sh.chargeableWeight || sh.weight} kg (Volumetric: {sh.volumetricWeight || 0} kg)</span>
                                    </div>
                                    <div>
                                      <span className="text-gray-500 block">Sizing Dimensions:</span>
                                      <span className="font-semibold text-white">{sh.length || 0}L x {sh.width || 0}W x {sh.height || 0}H cm</span>
                                    </div>
                                    <div>
                                      <span className="text-gray-500 block">Shipping Base Charge:</span>
                                      <span className="font-bold text-white">₹{sh.shippingCharge.toFixed(2)}</span>
                                    </div>
                                    <div>
                                      <span className="text-gray-500 block">GST Tax (18%):</span>
                                      <span className="font-bold text-white">₹{sh.gstAmount.toFixed(2)}</span>
                                    </div>
                                    <div className="col-span-2 border-t border-white/10 pt-2 flex justify-between font-bold text-xs text-[#FF6A00]">
                                      <span>Invoice Total:</span>
                                      <span>₹{sh.invoiceTotal.toFixed(2)}</span>
                                    </div>
                                  </div>

                                  {/* Weight Discrepancy block */}
                                  {sh.weightDiscrepancy && (
                                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-[11px] space-y-1">
                                      <span className="font-bold block uppercase text-red-500 flex items-center gap-1">
                                        <AlertTriangle size={12} />
                                        Weight Discrepancy Dispute
                                      </span>
                                      <p>The courier scanned weight is <strong>{sh.scannedWeight} kg</strong> vs declared weight <strong>{sh.weight} kg</strong>.</p>
                                      <p>Delta penalty cost is <strong>₹{sh.deltaCost.toFixed(2)}</strong>. Review Status: <strong>{sh.discrepancyStatus}</strong></p>
                                      <p className="italic font-light">Details: {sh.discrepancyDetails}</p>
                                    </div>
                                  )}

                                </div>

                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                    {filteredShipments.length === 0 && (
                      <tr>
                        <td colSpan="8" className="py-8 text-center text-gray-500">
                          No matching shipments found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. SINGLE BOOKING TAB */}
          {activeTab === "single" && (
            <div className="bg-[#E5E7EB]/5 border border-[#687280]/20 rounded-3xl p-6 space-y-6 animate-fade-in">
              <h3 className="text-xl font-bold text-white flex items-center gap-2 border-b border-[#687280]/20 pb-4 mb-4">
                <PlusCircle size={22} className="text-[#FF6A00]" />
                Book Single Shipping Voucher
              </h3>

              <form onSubmit={handleBookSingle} className="space-y-6">
                
                {/* Warehouse selector */}
                <div className="bg-black/20 p-5 rounded-2xl border border-white/5 space-y-3">
                  <h4 className="text-xs font-bold uppercase text-[#FF6A00] tracking-wider">1. Select Warehouse Pickup Origin</h4>
                  <div className="grid md:grid-cols-2 gap-4 items-end">
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-1">Saved Warehouses</label>
                      <select
                        value={singleForm.pickupAddressId}
                        onChange={(e) => setSingleForm({ ...singleForm, pickupAddressId: e.target.value })}
                        required
                        className="w-full p-3 rounded-xl bg-[#0A1F44] border border-white/10 text-white outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs"
                      >
                        <option value="">-- Choose Warehouse --</option>
                        {warehouses.map(w => (
                          <option key={w._id} value={w._id}>
                            {w.addressName} ({w.city}, {w.country})
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab("warehouses") || setShowAddWarehouse(true)}
                      className="px-4 py-3 bg-white/5 border border-white/10 hover:border-[#FF6A00] text-white text-xs font-semibold rounded-xl transition inline-flex items-center gap-2"
                    >
                      <Plus size={14} /> Add Warehouse Location
                    </button>
                  </div>
                </div>

                {/* Recipient details */}
                <div className="bg-black/20 p-5 rounded-2xl border border-white/5 space-y-4">
                  <h4 className="text-xs font-bold uppercase text-[#FF6A00] tracking-wider">2. Recipient Customer Details</h4>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-1">Customer / Reference Name</label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={singleForm.customer}
                        onChange={(e) => setSingleForm({ ...singleForm, customer: e.target.value, receiverName: e.target.value })}
                        required
                        className="w-full p-3 rounded-xl bg-[#0A1F44] border border-white/10 text-white outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-1">Recipient Mobile</label>
                      <input
                        type="text"
                        placeholder="+971 50 1234567"
                        value={singleForm.receiverMobile}
                        onChange={(e) => setSingleForm({ ...singleForm, receiverMobile: e.target.value })}
                        required
                        className="w-full p-3 rounded-xl bg-[#0A1F44] border border-white/10 text-white outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-1">Receiver Address Line</label>
                      <input
                        type="text"
                        placeholder="Apartment, Street Name"
                        value={singleForm.receiverAddress}
                        onChange={(e) => setSingleForm({ ...singleForm, receiverAddress: e.target.value })}
                        required
                        className="w-full p-3 rounded-xl bg-[#0A1F44] border border-white/10 text-white outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-1">City</label>
                      <input
                        type="text"
                        placeholder="Dubai"
                        value={singleForm.receiverCity}
                        onChange={(e) => setSingleForm({ ...singleForm, receiverCity: e.target.value })}
                        className="w-full p-3 rounded-xl bg-[#0A1F44] border border-white/10 text-white outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-1">State / Province</label>
                      <input
                        type="text"
                        placeholder="Dubai State"
                        value={singleForm.receiverState}
                        onChange={(e) => setSingleForm({ ...singleForm, receiverState: e.target.value })}
                        className="w-full p-3 rounded-xl bg-[#0A1F44] border border-white/10 text-white outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-1">Country</label>
                      <select
                        value={singleForm.receiverCountry}
                        onChange={(e) => setSingleForm({ ...singleForm, receiverCountry: e.target.value })}
                        className="w-full p-3 rounded-xl bg-[#0A1F44] border border-white/10 text-white outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs"
                      >
                        <option value="AE">United Arab Emirates (AE)</option>
                        <option value="SA">Saudi Arabia (SA)</option>
                        <option value="US">United States (US)</option>
                        <option value="GB">United Kingdom (GB)</option>
                        <option value="IN">India (IN)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-1">Pincode / Zipcode</label>
                      <input
                        type="text"
                        placeholder="00000"
                        value={singleForm.receiverPincode}
                        onChange={(e) => setSingleForm({ ...singleForm, receiverPincode: e.target.value })}
                        className="w-full p-3 rounded-xl bg-[#0A1F44] border border-white/10 text-white outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Package weights & dimensions */}
                <div className="bg-black/20 p-5 rounded-2xl border border-white/5 space-y-4">
                  <h4 className="text-xs font-bold uppercase text-[#FF6A00] tracking-wider">3. Package Specifications & Value</h4>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-1">Dead Weight (kg)</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="1.5"
                        value={singleForm.weight}
                        onChange={(e) => setSingleForm({ ...singleForm, weight: e.target.value })}
                        required
                        className="w-full p-3 rounded-xl bg-[#0A1F44] border border-white/10 text-white outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-1">Shipment Type</label>
                      <select
                        value={singleForm.shipmentType}
                        onChange={(e) => setSingleForm({ ...singleForm, shipmentType: e.target.value })}
                        className="w-full p-3 rounded-xl bg-[#0A1F44] border border-white/10 text-white outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs"
                      >
                        <option value="Parcel">Parcel (Box/Bag)</option>
                        <option value="Document">Document (Envelopes)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-1">Product Description</label>
                      <input
                        type="text"
                        placeholder="Apparel, Electronics..."
                        value={singleForm.productDescription}
                        onChange={(e) => setSingleForm({ ...singleForm, productDescription: e.target.value })}
                        className="w-full p-3 rounded-xl bg-[#0A1F44] border border-white/10 text-white outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">Dimensions (L x W x H cm) - Optional for Volumetric Weight</label>
                    <div className="grid grid-cols-3 gap-3">
                      <input
                        type="number"
                        placeholder="Length"
                        value={singleForm.length}
                        onChange={(e) => setSingleForm({ ...singleForm, length: e.target.value })}
                        className="p-3 rounded-xl bg-[#0A1F44] border border-white/10 text-white text-center outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs"
                      />
                      <input
                        type="number"
                        placeholder="Width"
                        value={singleForm.width}
                        onChange={(e) => setSingleForm({ ...singleForm, width: e.target.value })}
                        className="p-3 rounded-xl bg-[#0A1F44] border border-white/10 text-white text-center outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs"
                      />
                      <input
                        type="number"
                        placeholder="Height"
                        value={singleForm.height}
                        onChange={(e) => setSingleForm({ ...singleForm, height: e.target.value })}
                        className="p-3 rounded-xl bg-[#0A1F44] border border-white/10 text-white text-center outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Estimate Result Block */}
                {estimateResult && (
                  <div className="bg-black/30 p-5 rounded-2xl border border-[#FF6A00]/30 space-y-3">
                    <h4 className="text-xs font-bold uppercase text-[#FF6A00] tracking-wider">Dynamic Shipping Quotation Breakdown</h4>
                    <div className="grid md:grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="text-gray-500 block">Courier Name:</span>
                        <span className="font-bold text-white">{estimateResult.courierName}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Chargeable Weight:</span>
                        <span className="font-bold text-[#FF6A00]">{estimateResult.chargeableWeight}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Volumetric weight:</span>
                        <span className="text-gray-400 font-semibold">{estimateResult.volumetricWeight}</span>
                      </div>
                    </div>
                    <div className="border-t border-white/10 pt-3 flex flex-wrap justify-between items-center text-sm gap-2">
                      <div className="space-x-4">
                        <span className="text-[#687280]">Shipping Charge: <strong>₹{estimateResult.shippingCharge}</strong></span>
                        <span className="text-[#687280]">GST (18%): <strong>₹{estimateResult.gstAmount}</strong></span>
                      </div>
                      <span className="text-lg font-black text-[#FF6A00]">Total Payable: ₹{estimateResult.invoiceTotal}</span>
                    </div>
                  </div>
                )}

                {bookingError && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-500 text-xs p-3.5 rounded-xl flex items-center gap-2">
                    <AlertTriangle size={14} className="shrink-0" />
                    <span>{bookingError}</span>
                  </div>
                )}

                {bookingSuccess && (
                  <div className="bg-green-500/10 border border-green-500/30 text-green-500 text-xs p-3.5 rounded-xl flex items-center gap-2">
                    <Check size={14} className="shrink-0" />
                    <span>{bookingSuccess}</span>
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={handleEstimateSingle}
                    disabled={estimating || !singleForm.weight || !singleForm.receiverCountry}
                    className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-3.5 rounded-xl text-xs transition"
                  >
                    {estimating ? "Calculating..." : "Calculate Cost Quote"}
                  </button>

                  <button
                    type="submit"
                    disabled={bookingLoading || user?.status !== "Active"}
                    className="flex-1 bg-[#FF6A00] text-[#0A1F44] font-extrabold py-3.5 rounded-xl text-xs hover:brightness-110 active:scale-95 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {bookingLoading ? (
                      <span className="w-5 h-5 border-2 border-[#0A1F44] border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <Check size={16} />
                        Confirm Booking
                      </>
                    )}
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* 4. BULK CSV UPLOAD TAB */}
          {activeTab === "bulk" && (
            <div className="bg-[#E5E7EB]/5 border border-[#687280]/20 rounded-3xl p-6 space-y-6 animate-fade-in">
              <h3 className="text-xl font-bold text-white flex items-center gap-2 border-b border-[#687280]/20 pb-4 mb-4">
                <UploadCloud size={22} className="text-[#FF6A00]" />
                Double-Pass Bulk Consignments Upload
              </h3>

              <div className="bg-black/20 p-5 rounded-2xl border border-white/5 space-y-3 text-xs">
                <span className="text-[#FF6A00] font-bold block uppercase tracking-wider">CSV Upload Guidelines</span>
                <p className="text-[#687280]">
                  Your CSV columns must exactly match these headers in order:
                </p>
                <code className="block bg-[#0A1F44] p-3 rounded-xl border border-white/5 text-gray-300 font-mono select-all overflow-x-auto whitespace-nowrap">
                  customer,receiverMobile,receiverAddress,receiverCity,receiverState,receiverCountry,receiverPincode,weight,length,width,height,productDescription,shipmentValue,pickupWarehouseName
                </code>
                <p className="text-[#687280] italic">
                  * Note: The `pickupWarehouseName` column value must match the exact "Warehouse Address Name" saved in your Warehouses list (case-insensitive).
                </p>
              </div>

              {/* Step 1: Upload File */}
              <div className="grid md:grid-cols-2 gap-6 items-end">
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1 font-bold">Select CSV File</label>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleBulkFileChange}
                    className="w-full text-xs text-gray-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#FF6A00]/20 file:text-[#FF6A00] hover:file:bg-[#FF6A00]/30 transition"
                  />
                </div>
                <button
                  onClick={handleBulkUploadValidate}
                  disabled={bulkProcessing || !bulkFile}
                  className="bg-[#FF6A00] text-[#0A1F44] font-bold py-3 px-6 rounded-xl hover:brightness-110 text-xs transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {bulkProcessing ? (
                    <span className="w-5 h-5 border-2 border-[#0A1F44] border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    "Process & Dry-Run Validate"
                  )}
                </button>
              </div>

              {bulkValidationError && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-500 text-xs p-3.5 rounded-xl">
                  {bulkValidationError}
                </div>
              )}

              {/* Step 2: Validate Results */}
              {bulkResult && (
                <div className="space-y-6">
                  
                  {/* Summary Card */}
                  <div className="bg-black/20 p-5 rounded-2xl border border-white/5 grid md:grid-cols-4 gap-6 text-xs">
                    <div>
                      <span className="text-gray-500 block">Total Processed Rows:</span>
                      <span className="text-lg font-bold text-white">{bulkResult.summary.totalRows}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Valid Rows (Bookable):</span>
                      <span className="text-lg font-bold text-green-500">{bulkResult.summary.validCount}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Invalid Rows (Error):</span>
                      <span className="text-lg font-bold text-red-500">{bulkResult.summary.invalidCount}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Total Estimated Cost:</span>
                      <span className="text-lg font-bold text-[#FF6A00]">₹{bulkResult.summary.totalEstimatedCost.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Fund Check Warning */}
                  {!bulkResult.summary.hasSufficientFunds && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-500 text-xs p-3.5 rounded-xl flex items-center gap-2">
                      <AlertTriangle size={14} className="shrink-0" />
                      <span>
                        Insufficient Funds! Your available wallet balance (₹{bulkResult.summary.walletAvailable.toFixed(2)}) is lower than the total batch cost (₹{bulkResult.summary.totalEstimatedCost.toFixed(2)}). Please recharge first.
                      </span>
                    </div>
                  )}

                  {/* Invalid Rows Errors Grid */}
                  {bulkResult.summary.invalidCount > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-red-500 uppercase tracking-wider">Validation Errors Listing</h4>
                      <div className="max-h-60 overflow-y-auto border border-red-500/10 rounded-2xl">
                        <table className="w-full text-left text-xs bg-red-500/5">
                          <thead>
                            <tr className="border-b border-red-500/10 text-red-400 text-[10px] uppercase font-bold">
                              <th className="py-2.5 px-4 text-center">Row</th>
                              <th className="py-2.5 px-4">Recipient Name</th>
                              <th className="py-2.5 px-4">Error Reasons</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-red-500/10">
                            {bulkResult.invalidRows.map((inv, idx) => (
                              <tr key={idx} className="hover:bg-red-500/10 transition-colors">
                                <td className="py-2 px-4 text-center font-bold text-red-400">{inv.line}</td>
                                <td className="py-2 px-4 font-semibold">{inv.row.customer || "Empty name"}</td>
                                <td className="py-2 px-4 text-red-400 italic">{inv.errors.join(", ")}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Valid Rows Preview Grid */}
                  {bulkResult.summary.validCount > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-green-500 uppercase tracking-wider">Valid Bookings Preview Grid</h4>
                      <div className="max-h-60 overflow-y-auto border border-green-500/10 rounded-2xl">
                        <table className="w-full text-left text-xs bg-green-500/5">
                          <thead>
                            <tr className="border-b border-green-500/10 text-green-400 text-[10px] uppercase font-bold">
                              <th className="py-2.5 px-4 text-center">Row</th>
                              <th className="py-2.5 px-4">Customer Name</th>
                              <th className="py-2.5 px-4">Route</th>
                              <th className="py-2.5 px-4 text-center">Charge Weight</th>
                              <th className="py-2.5 px-4 text-right">Cost + GST</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-green-500/10">
                            {bulkResult.validRows.map((val, idx) => (
                              <tr key={idx} className="hover:bg-green-500/10 transition-colors">
                                <td className="py-2 px-4 text-center font-bold text-green-400">{val.line}</td>
                                <td className="py-2 px-4 font-semibold">{val.customer}</td>
                                <td className="py-2 px-4">{val.receiverCity}, {val.receiverCountry} (from {val.pickupWarehouseName})</td>
                                <td className="py-2 px-4 text-center font-mono">{val.chargeableWeight} kg</td>
                                <td className="py-2 px-4 text-right font-bold text-white">₹{val.invoiceTotal.toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Commit Execution Button */}
                  {bulkResult.summary.validCount > 0 && bulkResult.summary.hasSufficientFunds && user?.status === "Active" && (
                    <button
                      onClick={handleBulkConfirm}
                      disabled={bulkConfirming}
                      className="w-full bg-[#FF6A00] text-[#0A1F44] font-extrabold py-4 rounded-xl text-xs hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-2"
                    >
                      {bulkConfirming ? (
                        <span className="w-5 h-5 border-2 border-[#0A1F44] border-t-transparent rounded-full animate-spin"></span>
                      ) : (
                        <>
                          <CheckCircle size={16} />
                          Confirm & Book Batch (Debits ₹{bulkResult.summary.totalEstimatedCost.toFixed(2)})
                        </>
                      )}
                    </button>
                  )}

                </div>
              )}

            </div>
          )}

          {/* 5. WALLET & FINANCIAL LEDGER TAB */}
          {activeTab === "wallet" && (
            <div className="space-y-8 animate-fade-in">
              
              {/* Currency Selector */}
              <div className="flex gap-2 bg-white/5 p-1 rounded-xl border border-white/10 w-fit">
                {["INR", "AED", "USD", "GBP"].map((curr) => (
                  <button
                    key={curr}
                    onClick={() => setSelectedCurrency(curr)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                      selectedCurrency === curr
                        ? "bg-[#FF6A00] text-[#0A1F44] shadow-lg"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {curr} Wallet
                  </button>
                ))}
              </div>

              {/* Wallet Top Section: Balance & Recharge */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Available Balance Card */}
                <div className="bg-gradient-to-br from-[#0A1F44] to-[#071630] border border-[#687280]/20 rounded-3xl p-8 flex flex-col justify-between min-h-[220px] relative overflow-hidden group">
                  {/* Decorative background logo icon */}
                  <div className="absolute right-6 bottom-6 opacity-[0.03] text-[#FF6A00] group-hover:scale-110 transition duration-500 pointer-events-none">
                    <Wallet size={160} />
                  </div>
                  
                  <div className="space-y-2">
                    <span className="text-xs text-[#FF6A00] uppercase tracking-[0.2em] font-extrabold bg-[#FF6A00]/10 px-3.5 py-1.5 rounded-full border border-[#FF6A00]/25 w-fit block">
                      {selectedCurrency} Ledger Status
                    </span>
                    <h3 className="text-sm text-gray-400 font-semibold uppercase tracking-wider mt-2">Available Balance</h3>
                  </div>

                  <div className="my-4">
                    <span className="text-4xl lg:text-5xl font-black tracking-tight text-white font-mono">
                      {selectedCurrency === "INR" ? "₹" : selectedCurrency === "AED" ? "AED " : selectedCurrency === "USD" ? "$" : "£"}
                      {wallet ? wallet.availableBalance.toFixed(2) : "0.00"}
                    </span>
                    <div className="flex gap-4 mt-2 text-xs text-gray-400 font-semibold">
                      <span>Hold: {selectedCurrency === "INR" ? "₹" : selectedCurrency === "AED" ? "AED " : selectedCurrency === "USD" ? "$" : "£"}{wallet ? wallet.holdBalance.toFixed(2) : "0.00"}</span>
                      <span>Total: {selectedCurrency === "INR" ? "₹" : selectedCurrency === "AED" ? "AED " : selectedCurrency === "USD" ? "$" : "£"}{wallet ? wallet.totalBalance.toFixed(2) : "0.00"}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-[#687280] leading-relaxed">
                      Consumable funds reserved or utilized for logistics services in {selectedCurrency}.
                    </p>
                  </div>
                </div>

                {/* Simulated Razorpay Top Up */}
                <div className="bg-[#E5E7EB]/5 border border-[#687280]/20 rounded-3xl p-8 flex flex-col justify-between min-h-[220px] space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-[#687280]/20 pb-3">
                      <Wallet size={18} className="text-[#FF6A00]" />
                      Simulated Instant Card Recharge
                    </h4>
                    <p className="text-xs text-[#687280] pt-1">
                      Simulate Razorpay payment gateway checkout orders verification.
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-1.5 font-bold uppercase tracking-wider">
                        Recharge Amount (₹)
                      </label>
                      <input
                        type="number"
                        placeholder="5000"
                        value={rechargeAmount}
                        onChange={(e) => setRechargeAmount(e.target.value)}
                        className="w-full p-3 rounded-xl bg-[#0A1F44] border border-white/10 text-white outline-none focus:ring-2 focus:ring-[#FF6A00] text-xs transition duration-300"
                      />
                    </div>

                    {/* Available Offers & Coupons Section */}
                    {coupons.length > 0 && (
                      <div className="space-y-2">
                        <label className="text-[10px] text-[#FF6A00] block font-extrabold uppercase tracking-widest flex justify-between items-center">
                          <span>Promo Codes & Coupons</span>
                          {isFirstTime && (
                            <span className="text-[9px] bg-[#FF6A00]/25 text-[#FF6A00] border border-[#FF6A00]/30 px-2 py-0.5 rounded-full font-bold animate-pulse">
                              First Recharge Active
                            </span>
                          )}
                        </label>
                        <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-1">
                          {coupons.map((coupon) => {
                            const isEligible = (parseFloat(rechargeAmount) || 0) >= coupon.minRecharge;
                            const isSelected = selectedCoupon?._id === coupon._id;
                            
                            return (
                              <div
                                key={coupon._id}
                                onClick={() => {
                                  if (isSelected) {
                                    setSelectedCoupon(null);
                                  } else {
                                    if (!isEligible) {
                                      // Auto-adjust recharge amount to minRecharge
                                      setRechargeAmount(coupon.minRecharge.toString());
                                    }
                                    setSelectedCoupon(coupon);
                                  }
                                }}
                                className={`p-3 rounded-2xl border transition duration-300 cursor-pointer flex flex-col justify-between space-y-1.5 relative overflow-hidden group ${
                                  isSelected
                                    ? "bg-[#FF6A00]/10 border-[#FF6A00] shadow-md shadow-[#FF6A00]/5"
                                    : "bg-white/5 border-white/10 hover:border-white/20"
                                }`}
                              >
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-2">
                                    <span className="border border-dashed border-[#FF6A00] text-[#FF6A00] px-2 py-0.5 rounded font-mono font-black text-[10px] tracking-wider bg-[#FF6A00]/5">
                                      {coupon.code}
                                    </span>
                                    {coupon.firstTimeOnly && (
                                      <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[9px] font-bold px-1.5 py-0.5 rounded">
                                        First Time
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-white font-extrabold text-[11px]">
                                    {coupon.couponType === "Percentage" ? `${coupon.value}% Bonus` : `₹${coupon.value} Flat`}
                                  </span>
                                </div>
                                <p className="text-[10px] text-gray-400 leading-relaxed">
                                  {coupon.description}
                                </p>
                                <div className="flex justify-between items-center text-[9px] pt-1">
                                  <span className="text-gray-500">
                                    Min. Recharge: <span className="font-bold text-gray-300">₹{coupon.minRecharge}</span>
                                  </span>
                                  {isSelected ? (
                                    <span className="text-green-400 font-bold flex items-center gap-0.5">
                                      ✓ Applied
                                    </span>
                                  ) : isEligible ? (
                                    <span className="text-gray-400 font-medium group-hover:text-white transition">
                                      Click to Apply
                                    </span>
                                  ) : (
                                    <span className="text-gray-500 italic">
                                      Click to adjust to ₹{coupon.minRecharge}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Calculated Bonus Visualizer */}
                    {selectedCoupon && (
                      <div className="p-3 rounded-2xl bg-green-500/5 border border-green-500/15 flex flex-col space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Deposit Amount:</span>
                          <span className="font-bold text-white">₹{(parseFloat(rechargeAmount) || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400 flex items-center gap-1">
                            Coupon Bonus ({selectedCoupon.code}):
                            {parseFloat(rechargeAmount) < selectedCoupon.minRecharge && (
                              <span className="text-[9px] text-amber-500 font-bold">(Ineligible)</span>
                            )}
                          </span>
                          <span className="font-bold text-green-400">
                            {parseFloat(rechargeAmount) >= selectedCoupon.minRecharge ? (
                              `+₹${(selectedCoupon.couponType === "Percentage" 
                                ? ((parseFloat(rechargeAmount) || 0) * selectedCoupon.value) / 100 
                                : selectedCoupon.value).toFixed(2)}`
                            ) : (
                              "₹0.00"
                            )}
                          </span>
                        </div>
                        {parseFloat(rechargeAmount) < selectedCoupon.minRecharge && (
                          <div className="text-[10px] text-amber-500 pt-1 font-medium leading-tight">
                            ⚠️ Enter ₹{(selectedCoupon.minRecharge - (parseFloat(rechargeAmount) || 0)).toFixed(2)} more to activate coupon.
                          </div>
                        )}
                        {parseFloat(rechargeAmount) >= selectedCoupon.minRecharge && (
                          <div className="flex justify-between border-t border-white/5 pt-1.5 font-bold text-sm">
                            <span className="text-[#FF6A00]">Total Wallet Credit:</span>
                            <span className="text-white">
                              ₹{(
                                (parseFloat(rechargeAmount) || 0) + 
                                (selectedCoupon.couponType === "Percentage" 
                                  ? ((parseFloat(rechargeAmount) || 0) * selectedCoupon.value) / 100 
                                  : selectedCoupon.value)
                              ).toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <button
                      onClick={handleSimulateRazorpay}
                      className="w-full bg-[#FF6A00] hover:bg-[#ff7b1a] text-[#0A1F44] font-extrabold py-3.5 rounded-xl text-xs hover:scale-[1.01] active:scale-[0.99] transition duration-300 shadow-lg shadow-[#FF6A00]/20"
                    >
                      Process Simulated Topup
                    </button>
                  </div>
                </div>

              </div>

              {rechargeError && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-500 text-xs p-3.5 rounded-xl">
                  {rechargeError}
                </div>
              )}

              {rechargeSuccess && (
                <div className="bg-green-500/10 border border-green-500/30 text-green-500 text-xs p-3.5 rounded-xl">
                  {rechargeSuccess}
                </div>
              )}

              {/* Transactions Ledger Table */}
              <div className="bg-[#E5E7EB]/5 border border-[#687280]/20 rounded-3xl p-6 space-y-4">
                <h3 className="text-lg font-bold text-white">Wallet Transaction Audit Ledger</h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#687280]/20 text-[#687280] uppercase tracking-wider text-[10px]">
                        <th className="py-2.5 px-4">Date</th>
                        <th className="py-2.5 px-4 text-center">Type</th>
                        <th className="py-2.5 px-4 text-right">Amount</th>
                        <th className="py-2.5 px-4 text-right">Opening Balance</th>
                        <th className="py-2.5 px-4 text-right">Closing Balance</th>
                        <th className="py-2.5 px-4">Reference ID / Remarks</th>
                        <th className="py-2.5 px-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#687280]/10">
                      {transactions.filter(tx => (tx.currency || "INR") === selectedCurrency).map(tx => {
                        const symbol = selectedCurrency === "INR" ? "₹" : selectedCurrency === "AED" ? "AED " : selectedCurrency === "USD" ? "$" : "£";
                        return (
                          <tr key={tx._id} className="hover:bg-white/5 transition-colors">
                            <td className="py-3 px-4 text-gray-500">{new Date(tx.createdAt).toLocaleString()}</td>
                            <td className="py-3 px-4 text-center font-semibold text-white">{tx.transactionType}</td>
                            <td className={`py-3 px-4 text-right font-bold ${tx.amount > 0 ? "text-green-500" : "text-red-400"}`}>
                              {tx.amount > 0 ? `+${symbol}${tx.amount.toFixed(2)}` : `-${symbol}${Math.abs(tx.amount).toFixed(2)}`}
                            </td>
                            <td className="py-3 px-4 text-right text-gray-500">{symbol}{tx.openingBalance.toFixed(2)}</td>
                            <td className="py-3 px-4 text-right text-white">{symbol}{tx.closingBalance.toFixed(2)}</td>
                          <td className="py-3 px-4 text-gray-400">
                            <span className="font-mono block text-[10px] text-[#FF6A00] font-bold">{tx.referenceId}</span>
                            <span className="text-[11px] block">{tx.remarks}</span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              tx.status === "Completed" ? "bg-green-500/10 text-green-500" :
                              tx.status === "HOLD" ? "bg-amber-500/10 text-amber-500" : "bg-red-500/10 text-red-500"
                            }`}>
                              {tx.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                      {transactions.length === 0 && (
                        <tr>
                          <td colSpan="7" className="py-6 text-center text-gray-500">No ledger transactions recorded.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* 6. WAREHOUSES TAB */}
          {activeTab === "warehouses" && (
            <div className="bg-[#E5E7EB]/5 border border-[#687280]/20 rounded-3xl p-6 space-y-6 animate-fade-in">
              <div className="flex justify-between items-center border-b border-[#687280]/20 pb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Home size={22} className="text-[#FF6A00]" />
                  Pickup Warehouses Manager
                </h3>
                
                <button
                  onClick={() => setShowAddWarehouse(!showAddWarehouse)}
                  className="bg-[#FF6A00] text-[#0A1F44] font-extrabold py-2 px-4 rounded-xl text-xs hover:brightness-110 transition flex items-center gap-1"
                >
                  <Plus size={14} /> Add New Warehouse
                </button>
              </div>

              {/* Add warehouse form */}
              {showAddWarehouse && (
                <form onSubmit={handleAddWarehouse} className="bg-black/20 p-5 rounded-2xl border border-white/5 space-y-4">
                  <h4 className="text-xs font-bold uppercase text-[#FF6A00]">Save New Warehouse Location</h4>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-1">Warehouse Nickname</label>
                      <input
                        type="text"
                        placeholder="Mumbai Main Hub"
                        value={warehouseForm.addressName}
                        onChange={(e) => setWarehouseForm({ ...warehouseForm, addressName: e.target.value })}
                        required
                        className="w-full p-3 rounded-xl bg-[#0A1F44] border border-white/10 text-white outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-1">Contact Person Name</label>
                      <input
                        type="text"
                        placeholder="John Manager"
                        value={warehouseForm.contactPerson}
                        onChange={(e) => setWarehouseForm({ ...warehouseForm, contactPerson: e.target.value })}
                        required
                        className="w-full p-3 rounded-xl bg-[#0A1F44] border border-white/10 text-white outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-1">Contact Mobile Number</label>
                      <input
                        type="text"
                        placeholder="+91 99999 88888"
                        value={warehouseForm.mobile}
                        onChange={(e) => setWarehouseForm({ ...warehouseForm, mobile: e.target.value })}
                        required
                        className="w-full p-3 rounded-xl bg-[#0A1F44] border border-white/10 text-white outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">Warehouse Address Line</label>
                    <input
                      type="text"
                      placeholder="Plot No 22, MIDC Industrial Area"
                      value={warehouseForm.address}
                      onChange={(e) => setWarehouseForm({ ...warehouseForm, address: e.target.value })}
                      required
                      className="w-full p-3 rounded-xl bg-[#0A1F44] border border-white/10 text-white outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs"
                    />
                  </div>

                  <div className="grid md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-1">City</label>
                      <input
                        type="text"
                        placeholder="Mumbai"
                        value={warehouseForm.city}
                        onChange={(e) => setWarehouseForm({ ...warehouseForm, city: e.target.value })}
                        required
                        className="w-full p-3 rounded-xl bg-[#0A1F44] border border-white/10 text-white outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-1">State / Province</label>
                      <input
                        type="text"
                        placeholder="Maharashtra"
                        value={warehouseForm.state}
                        onChange={(e) => setWarehouseForm({ ...warehouseForm, state: e.target.value })}
                        required
                        className="w-full p-3 rounded-xl bg-[#0A1F44] border border-white/10 text-white outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-1">Country</label>
                      <input
                        type="text"
                        value={warehouseForm.country}
                        onChange={(e) => setWarehouseForm({ ...warehouseForm, country: e.target.value })}
                        required
                        className="w-full p-3 rounded-xl bg-[#0A1F44] border border-white/10 text-white outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-1">Pincode / Zipcode</label>
                      <input
                        type="text"
                        placeholder="400001"
                        value={warehouseForm.pincode}
                        onChange={(e) => setWarehouseForm({ ...warehouseForm, pincode: e.target.value })}
                        required
                        className="w-full p-3 rounded-xl bg-[#0A1F44] border border-white/10 text-white outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-[#FF6A00] to-orange-500 text-white font-bold py-3 rounded-xl text-xs hover:brightness-110 transition"
                    >
                      Save Location
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddWarehouse(false)}
                      className="flex-1 bg-white/5 border border-white/10 text-white font-bold py-3 rounded-xl text-xs hover:bg-white/10 transition"
                    >
                      Cancel
                    </button>
                  </div>

                </form>
              )}

              {/* Warehouse Listing */}
              <div className="grid md:grid-cols-2 gap-6">
                {warehouses.map(w => (
                  <div key={w._id} className="bg-black/20 border border-white/5 hover:border-[#FF6A00]/30 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition">
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-white text-sm">{w.addressName}</h4>
                          <span className="text-[10px] text-gray-500">Contact: {w.contactPerson} ({w.mobile})</span>
                        </div>
                        {w.isDefault ? (
                          <span className="px-2 py-0.5 rounded text-[9px] bg-green-500/10 text-green-500 border border-green-500/20 font-bold uppercase">Default Origin</span>
                        ) : (
                          <button
                            onClick={() => handleSetDefaultWarehouse(w._id)}
                            className="text-[9px] text-[#FF6A00] hover:underline"
                          >
                            Set Default
                          </button>
                        )}
                      </div>
                      
                      <p className="text-xs text-gray-400 mt-3 flex items-start gap-1">
                        <MapPin size={12} className="shrink-0 text-[#FF6A00] mt-0.5" />
                        {w.address}, {w.city}, {w.state}, {w.country} - {w.pincode}
                      </p>
                    </div>

                    <div className="flex justify-end border-t border-white/5 pt-3">
                      <button
                        onClick={() => handleDeleteWarehouse(w._id)}
                        className="text-red-400 hover:text-red-600 transition flex items-center gap-1 text-[10px]"
                      >
                        <Trash2 size={12} />
                        Remove Warehouse
                      </button>
                    </div>
                  </div>
                ))}
                {warehouses.length === 0 && (
                  <p className="text-gray-500 text-sm md:col-span-2 text-center py-10">No warehouse pickup locations registered.</p>
                )}
              </div>
            </div>
          )}

          {/* 7. INSURANCE CLAIMS TAB */}
          {activeTab === "claims" && (
            <div className="space-y-8 animate-fade-in">
              
              <div className="bg-[#E5E7EB]/5 border border-[#687280]/20 rounded-3xl p-6 space-y-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2 border-b border-[#687280]/20 pb-4">
                  <ShieldAlert size={22} className="text-[#FF6A00]" />
                  Logistics Insurance Claims
                </h3>

                <form onSubmit={handleFileClaim} className="bg-black/20 p-5 rounded-2xl border border-white/5 space-y-4">
                  <h4 className="text-xs font-bold uppercase text-[#FF6A00]">File New Insurance claim dispute</h4>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-1">Shipment ID or AWB Tracking Number</label>
                      <input
                        type="text"
                        placeholder="PHX-SH-123456"
                        value={claimForm.shipmentId}
                        onChange={(e) => setClaimForm({ ...claimForm, shipmentId: e.target.value })}
                        required
                        className="w-full p-3 rounded-xl bg-[#0A1F44] border border-white/10 text-white outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-1">Claim Dispute Category</label>
                      <select
                        value={claimForm.claimType}
                        onChange={(e) => setClaimForm({ ...claimForm, claimType: e.target.value })}
                        className="w-full p-3 rounded-xl bg-[#0A1F44] border border-white/10 text-white outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs"
                      >
                        <option value="Lost Shipment">Lost Shipment (In-Transit)</option>
                        <option value="Damaged Shipment">Damaged Shipment (Broken parcel)</option>
                        <option value="Delayed Shipment">Delayed Shipment (SLA Breached)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-1">Requested Payout Amount (₹)</label>
                      <input
                        type="number"
                        placeholder="5000"
                        value={claimForm.claimAmount}
                        onChange={(e) => setClaimForm({ ...claimForm, claimAmount: e.target.value })}
                        required
                        className="w-full p-3 rounded-xl bg-[#0A1F44] border border-white/10 text-white outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">Description & Incident Details</label>
                    <textarea
                      placeholder="Please details the loss or delay particulars..."
                      value={claimForm.description}
                      onChange={(e) => setClaimForm({ ...claimForm, description: e.target.value })}
                      rows="3"
                      className="w-full p-3 rounded-xl bg-[#0A1F44] border border-white/10 text-white outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs"
                    />
                  </div>

                  {claimError && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-500 text-xs p-3.5 rounded-xl">
                      {claimError}
                    </div>
                  )}

                  {claimSuccess && (
                    <div className="bg-green-500/10 border border-green-500/30 text-green-500 text-xs p-3.5 rounded-xl">
                      {claimSuccess}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-[#FF6A00] text-[#0A1F44] font-extrabold py-3.5 rounded-xl text-xs hover:brightness-110 transition"
                  >
                    Submit Dispute Claim Request
                  </button>

                </form>
              </div>

              {/* Claims list */}
              <div className="bg-[#E5E7EB]/5 border border-[#687280]/20 rounded-3xl p-6 space-y-4">
                <h3 className="text-lg font-bold text-white">Disputed claims register</h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#687280]/20 text-[#687280] uppercase tracking-wider text-[10px]">
                        <th className="py-2.5 px-4">Date Filed</th>
                        <th className="py-2.5 px-4">Shipment</th>
                        <th className="py-2.5 px-4 text-center">Dispute Class</th>
                        <th className="py-2.5 px-4 text-right">Requested Payout</th>
                        <th className="py-2.5 px-4">Description</th>
                        <th className="py-2.5 px-4 text-center">Status</th>
                        <th className="py-2.5 px-4">Admin Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#687280]/10">
                      {claims.map(c => (
                        <tr key={c._id} className="hover:bg-white/5 transition-colors">
                          <td className="py-3 px-4 text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                          <td className="py-3 px-4 font-mono font-bold text-[#FF6A00]">
                            {c.shipmentId?.shipmentId || "Unknown"}
                          </td>
                          <td className="py-3 px-4 text-center font-semibold">{c.claimType}</td>
                          <td className="py-3 px-4 text-right font-bold text-white">₹{c.claimAmount.toFixed(2)}</td>
                          <td className="py-3 px-4 text-gray-400">{c.description}</td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              c.status === "Approved" || c.status === "Paid" ? "bg-green-500/10 text-green-500" :
                              c.status === "Pending" ? "bg-amber-500/10 text-amber-500" : "bg-red-500/10 text-red-500"
                            }`}>
                              {c.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-400 italic">{c.adminRemarks || "No admin notes yet."}</td>
                        </tr>
                      ))}
                      {claims.length === 0 && (
                        <tr>
                          <td colSpan="7" className="py-6 text-center text-gray-500">No insurance claims filed yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* 8. HELPDESK SUPPORT TICKETS TAB */}
          {activeTab === "tickets" && (
            <div className="bg-[#E5E7EB]/5 border border-[#687280]/20 rounded-3xl p-6 animate-fade-in grid lg:grid-cols-3 gap-8">
              
              {/* Ticket creation and listing */}
              <div className="lg:col-span-1 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white border-b border-[#687280]/20 pb-2">Open New Ticket</h3>
                  
                  <form onSubmit={handleCreateTicket} className="space-y-3 text-xs">
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-1">Subject</label>
                      <input
                        type="text"
                        placeholder="Delayed delivery AWB..."
                        value={ticketForm.subject}
                        onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                        required
                        className="w-full p-3 rounded-xl bg-[#0A1F44] border border-white/10 text-white outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-1">Issue category</label>
                      <select
                        value={ticketForm.type}
                        onChange={(e) => setTicketForm({ ...ticketForm, type: e.target.value })}
                        className="w-full p-3 rounded-xl bg-[#0A1F44] border border-white/10 text-white outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs"
                      >
                        <option value="Shipment Issue">Shipment Issue</option>
                        <option value="Tracking Issue">Tracking Issue</option>
                        <option value="Pickup Issue">Pickup Issue</option>
                        <option value="Billing Issue">Billing Issue</option>
                        <option value="Account Issue">Account Issue</option>
                        <option value="Other">Other Query</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-1">Problem details</label>
                      <textarea
                        placeholder="Elaborate details..."
                        value={ticketForm.description}
                        onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                        rows="3"
                        required
                        className="w-full p-3 rounded-xl bg-[#0A1F44] border border-white/10 text-white outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs"
                      />
                    </div>
                    
                    {ticketSuccess && (
                      <div className="bg-green-500/10 border border-green-500/30 text-green-500 text-xs p-2 rounded">
                        {ticketSuccess}
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full bg-[#FF6A00] text-[#0A1F44] font-bold py-2.5 rounded-xl text-xs hover:brightness-110 transition"
                    >
                      Submit Ticket
                    </button>
                  </form>
                </div>

                {/* Ticket roster list */}
                <div className="space-y-4 pt-4 border-t border-[#687280]/20">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Active Tickets</h3>
                  
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                    {tickets.map(t => (
                      <div
                        key={t._id}
                        onClick={() => setSelectedTicket(t)}
                        className={`p-3 rounded-xl border cursor-pointer transition flex justify-between items-center ${
                          selectedTicket?._id === t._id ? "bg-[#FF6A00]/20 border-[#FF6A00]" : "bg-black/20 border-white/5 hover:border-white/10"
                        }`}
                      >
                        <div className="space-y-1">
                          <span className="font-mono text-[10px] text-[#FF6A00] font-bold block">{t.ticketId}</span>
                          <span className="font-bold text-white text-xs block truncate max-w-[120px]">{t.subject}</span>
                          <span className="text-[9px] text-gray-500 block">{new Date(t.createdAt).toLocaleDateString()}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          t.status === "Resolved" || t.status === "Closed" ? "bg-green-500/10 text-green-500" : "bg-amber-500/10 text-amber-500"
                        }`}>
                          {t.status}
                        </span>
                      </div>
                    ))}
                    {tickets.length === 0 && (
                      <p className="text-gray-500 text-center py-6 text-xs">No active tickets opened.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Ticket Chat thread */}
              <div className="lg:col-span-2 bg-black/20 border border-white/5 rounded-3xl p-6 flex flex-col justify-between min-h-[450px]">
                {selectedTicket ? (
                  <>
                    <div>
                      <div className="flex justify-between items-start border-b border-[#687280]/20 pb-4 mb-4">
                        <div>
                          <span className="font-mono text-xs text-[#FF6A00] font-bold">{selectedTicket.ticketId} | {selectedTicket.type}</span>
                          <h4 className="text-lg font-bold text-white">{selectedTicket.subject}</h4>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          selectedTicket.status === "Resolved" || selectedTicket.status === "Closed" ? "bg-green-500/10 text-green-500" : "bg-amber-500/10 text-amber-500"
                        }`}>
                          Status: {selectedTicket.status}
                        </span>
                      </div>

                      {/* Chat Messages */}
                      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 mb-6">
                        {selectedTicket.messages.map((m, idx) => (
                          <div key={idx} className={`flex flex-col ${m.sender === "Seller" ? "items-end" : "items-start"}`}>
                            <div className={`p-3 rounded-2xl max-w-sm text-xs ${
                              m.sender === "Seller" ? "bg-[#FF6A00]/20 text-white rounded-tr-none" : "bg-[#0A1F44] text-white rounded-tl-none border border-white/5"
                            }`}>
                              {m.content.startsWith("data:image/") ? (
                                <img 
                                  src={m.content} 
                                  alt="Attachment" 
                                  className="max-w-xs rounded-lg cursor-zoom-in hover:opacity-90 transition"
                                  onClick={() => {
                                    const w = window.open();
                                    w.document.write(`<img src="${m.content}" style="max-width:100%; max-height:100vh; display:block; margin:auto;" />`);
                                  }}
                                />
                              ) : (
                                <p>{m.content}</p>
                              )}
                            </div>
                            <span className="text-[9px] text-gray-500 mt-1">{new Date(m.time).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Send reply message */}
                    {selectedTicket.status !== "Closed" && (
                      <form onSubmit={handleTicketReply} className="flex gap-3 items-center">
                        <input
                          id="ticket-image-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            if (e.target.files && e.target.files[0]) {
                              const file = e.target.files[0];
                              const reader = new FileReader();
                              reader.onloadend = async () => {
                                const base64String = reader.result;
                                try {
                                  await API.post(`/tickets/ticket/${selectedTicket._id}/reply`, { content: base64String });
                                  await refreshTickets();
                                } catch (err) {
                                  alert(err.response?.data?.message || "Failed to send image attachment.");
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => document.getElementById("ticket-image-upload").click()}
                          className="bg-[#0A1F44] hover:bg-white/5 border border-white/10 text-[#FF6A00] p-3 rounded-xl transition flex items-center justify-center shrink-0"
                          title="Upload Image"
                        >
                          <Upload size={16} />
                        </button>
                        <input
                          type="text"
                          placeholder="Type reply message content..."
                          value={ticketReply}
                          onChange={(e) => setTicketReply(e.target.value)}
                          required
                          className="flex-1 p-3 rounded-xl bg-[#0A1F44] border border-white/10 text-white outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs"
                        />
                        <button
                          type="submit"
                          className="bg-[#FF6A00] text-[#0A1F44] font-bold px-4 py-3 rounded-xl hover:brightness-110 transition flex items-center justify-center shrink-0"
                        >
                          <Send size={16} />
                        </button>
                      </form>
                    )}
                  </>
                ) : (
                  <div className="my-auto text-center text-gray-500 py-20">
                    <HelpCircle size={48} className="mx-auto mb-3 text-gray-600 animate-pulse" />
                    <p className="text-sm">Select a ticket from the left panel to inspect communication logs.</p>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      </main>

      {/* 🗓️ COURIER PICKUP SCHEDULER MODAL */}
      {schedulingShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-6">
          <div className="bg-[#0A1F44] border border-white/10 text-white rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
            <h3 className="text-lg font-bold text-[#FF6A00] mb-4 flex items-center gap-2">
              <Calendar size={20} />
              Schedule Courier pickup manifest
            </h3>

            <div className="space-y-4 text-xs">
              <p className="text-gray-400">
                You are scheduling an Aramex courier pickup for Shipment <strong>{schedulingShipment.shipmentId}</strong>.
              </p>

              <div>
                <label className="text-[10px] text-gray-400 block mb-1">Pickup Manifest Date</label>
                <input
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#071630] border border-white/10 text-white outline-none focus:ring-1 focus:ring-[#FF6A00] text-xs"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSchedulePickup}
                  className="flex-1 bg-[#FF6A00] text-[#0A1F44] font-extrabold py-3 rounded-xl hover:brightness-110 transition"
                >
                  Confirm Schedule
                </button>
                <button
                  onClick={() => setSchedulingShipment(null)}
                  className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-3 rounded-xl transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 💳 SIMULATED RAZORPAY PAYMENT MODAL */}
      {showMockRazorpay && mockOrderDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[#0B1528] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
            
            {/* Blue Razorpay Header */}
            <div className="bg-[#1F6BFF] px-6 py-4 flex items-center justify-between text-white select-none">
              <div className="flex items-center gap-2">
                <div className="bg-white text-[#1F6BFF] w-7 h-7 rounded-lg flex items-center justify-center font-black text-lg shadow-sm">
                  R
                </div>
                <div>
                  <h4 className="font-extrabold text-sm tracking-tight">Razorpay Checkout</h4>
                  <span className="text-[10px] text-white/70 font-semibold uppercase tracking-wider block">Demo/Simulation Mode</span>
                </div>
              </div>
              <button 
                onClick={handleMockRazorpayCancel}
                className="text-white/80 hover:text-white text-xs font-semibold bg-black/10 hover:bg-black/20 px-2.5 py-1.5 rounded-lg transition"
              >
                Cancel
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              
              {/* Amount Display */}
              <div className="text-center bg-[#071630] border border-white/5 rounded-xl p-4">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold block mb-1">Payment Amount</span>
                <span className="text-3xl font-black text-white">₹{parseFloat(rechargeAmount).toFixed(2)}</span>
                <span className="text-[10px] text-gray-500 block mt-1">Order ID: {mockOrderDetails.id}</span>
              </div>

              {/* Prefill User Info */}
              <div className="bg-[#0A1F44] border border-white/5 rounded-xl p-4 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Merchant Store:</span>
                  <span className="font-semibold text-white">{wallet?.storeName || user?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Billing Email:</span>
                  <span className="font-semibold text-white">{user?.email}</span>
                </div>
              </div>

              {/* Mock Methods Selector */}
              <div className="space-y-2">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold block">Simulate Payment Method</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-[#0A1F44] border border-[#1F6BFF]/30 text-white rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-[#1F6BFF]/60 transition">
                    <span className="font-bold">Instant Card</span>
                    <span className="text-[9px] text-[#1F6BFF] font-semibold">Demo Auto-Success</span>
                  </div>
                  <div className="bg-[#0A1F44] border border-white/5 text-gray-400 rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 opacity-50 select-none">
                    <span className="font-bold">UPI / QR Code</span>
                    <span className="text-[9px]">Unavailable</span>
                  </div>
                </div>
              </div>

              {/* Simulated Action Buttons */}
              <div className="space-y-3 pt-4 border-t border-white/5">
                <button
                  onClick={handleMockRazorpaySuccess}
                  className="w-full bg-[#1F6BFF] hover:bg-[#3479FF] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition shadow-lg shadow-[#1F6BFF]/25"
                >
                  <CheckCircle size={16} />
                  <span>Simulate Payment Success</span>
                </button>
                <button
                  onClick={handleMockRazorpayCancel}
                  className="w-full bg-white/5 hover:bg-white/10 text-gray-300 py-3 rounded-xl text-xs font-semibold transition"
                >
                  Simulate Payment Cancel/Failure
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
