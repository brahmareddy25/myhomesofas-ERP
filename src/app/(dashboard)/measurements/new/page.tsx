"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import StoreSelector from "@/components/ui/StoreSelector";
import SearchableSelect from "@/components/ui/SearchableSelect";
import FurniturePreview from "@/components/preview/FurniturePreview";
import { Save, User, Ruler, Palette, Calculator, Hash } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import toast from 'react-hot-toast';

export default function NewMeasurementWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [productType, setProductType] = useState("Straight Sofa");
  const [unit, setUnit] = useState<"cm" | "in">("cm");
  
  const [customers, setCustomers] = useState<any[]>([]);
  const [materialCatalogs, setMaterialCatalogs] = useState<any[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [storeId, setStoreId] = useState("");

  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    fetch("/api/customers").then(res => res.json()).then(data => {
      if (data.customers) setCustomers(data.customers);
    });
    fetch("/api/settings").then(res => res.json()).then(data => {
      if (!data.error) setSettings(data);
    });
  }, []);
  useEffect(() => {
    const fetchCatalogs = async () => {
      try {
        const url = storeId ? `/api/material-catalogs?storeId=${storeId}` : "/api/material-catalogs";
        const res = await fetch(url);
        const data = await res.json();
        if (data.catalogs) {
          setMaterialCatalogs(data.catalogs);
          // Auto-select first catalog if none selected or current is invalid
          if (data.catalogs.length > 0) {
            const firstCat = data.catalogs[0];
            setCatalog(firstCat.name);
            if (firstCat.colors && firstCat.colors.length > 0) {
              setColorCode(firstCat.colors[0].code);
            }
          } else {
            setCatalog("");
            setColorCode("");
          }
        }
      } catch (err) {
        console.error("Failed to fetch catalogs", err);
      }
    };
    fetchCatalogs();
  }, [storeId]);
  
  // Dimensions
  const [length, setLength] = useState<number>(220);
  const [width, setWidth] = useState<number>(90);
  const [height, setHeight] = useState<number>(85);
  const [seatWidth, setSeatWidth] = useState<number>(60);
  const [seatHeight, setSeatHeight] = useState<number>(45);
  const [seatDepth, setSeatDepth] = useState<number>(60);
  const [backrestHeight, setBackrestHeight] = useState<number>(40);
  const [cushionThickness, setCushionThickness] = useState<number>(15);
  const [armrestWidth, setArmrestWidth] = useState<number>(20);
  const [handleType, setHandleType] = useState("Standard Block");
  const [legHeight, setLegHeight] = useState<number>(10);
  const [legType, setLegType] = useState("Hidden Base");
  
  // Recliner Specific
  const [isMotorized, setIsMotorized] = useState(false);
  const [reclinerSeats, setReclinerSeats] = useState<number>(0);

  // Bed Specific
  const [headboardHeight, setHeadboardHeight] = useState<number>(120);
  const [hasStorage, setHasStorage] = useState(false);

  // Asymmetric L/U Shape Layout
  const [chaisePlacement, setChaisePlacement] = useState("Left Side");
  const [leftSideLength, setLeftSideLength] = useState<number>(150);
  const [leftSideType, setLeftSideType] = useState("Bed Type");
  const [rightSideLength, setRightSideLength] = useState<number>(150);
  const [rightSideType, setRightSideType] = useState("Seat Type");

  // Styling & Config
  const [colorCode, setColorCode] = useState<string>("");
  const [catalog, setCatalog] = useState("");
  const [cushionType, setCushionType] = useState("Signature Medium (40D)");
  
  // Add-ons
  const [hasAdjustableHeadrest, setHasAdjustableHeadrest] = useState(false);
  const [hasUSB, setHasUSB] = useState(false);
  const [hasCupHolder, setHasCupHolder] = useState(false);

  const [specialNotes, setSpecialNotes] = useState("");

  // Manual Pricing Configuration
  const [estimatedMaterialCost, setEstimatedMaterialCost] = useState<number>(0);
  const [estimatedLaborCost, setEstimatedLaborCost] = useState<number>(0);
  const [finalQuotationPrice, setFinalQuotationPrice] = useState<number>(0); // This will act as Base Selling Price
  const [discount, setDiscount] = useState<number>(0);
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Derived calculations for final quotation
  const afterDiscountPrice = Math.max(0, finalQuotationPrice - discount);
  const gstRatePercent = settings ? ((settings.cgstRate || 0) + (settings.sgstRate || 0) + (settings.igstRate || 0)) : 18;
  const taxAmount = afterDiscountPrice * (gstRatePercent / 100);
  const finalEstimationAmount = afterDiscountPrice + taxAmount;

  const handleFinalize = async () => {
    if (!customerId) return toast.error("Please select a customer profile first!");
    if (!expectedDeliveryDate) return toast.error("Please select an Expected Delivery Date.");
    if (!finalQuotationPrice) return toast.error("Please enter the Final Quoted Selling Price.");
    
    setIsSubmitting(true);
    try {
      let previewImages = {};
      if (typeof (window as any).capture3DViews === 'function') {
        previewImages = await (window as any).capture3DViews();
      }

      const measurementRes = await fetch("/api/measurements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId, productType, unit, length, width, height, seatWidth, seatHeight, seatDepth, backrestHeight, cushionThickness, armrestWidth, handleType, legHeight, legType, colorCode, catalog,
          reclinerType: isMotorized ? "Motorized" : "Manual", numberOfReclinerSeats: reclinerSeats, isMotorized, headboardHeight, hasStorage,
          sideDimensions: { chaisePlacement, leftSideLength, leftSideType, rightSideLength, rightSideType },
          cushionType, hasAdjustableHeadrest, hasUSB, hasCupHolder, specialNotes: specialNotes || "None",
          expectedDeliveryDate,
          previewImages, storeId: storeId || undefined
        })
      });
      const measurementData = await measurementRes.json();
      if (!measurementRes.ok) throw new Error(measurementData.error);

      const quoteRes = await fetch("/api/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          measurementId: measurementData.measurement._id,
          estimatedMaterialCost, estimatedLaborCost, totalCost: estimatedMaterialCost + estimatedLaborCost,
          subTotal: finalQuotationPrice,
          discount: discount,
          taxAmount: taxAmount,
          suggestedSellingPrice: finalQuotationPrice, 
          finalSellingPrice: finalEstimationAmount,
          estimatedProfitMargin: finalEstimationAmount - (estimatedMaterialCost + estimatedLaborCost) - taxAmount,
          expectedDeliveryDate: expectedDeliveryDate || undefined,
          termsAndConditions: specialNotes || (settings?.defaultTerms || "Standard Manufacturing Terms Apply."),
          storeId: storeId || undefined
        })
      });
      const quoteData = await quoteRes.json();
      if (!quoteRes.ok) throw new Error(quoteData.error);

      toast.success("Blueprint and Quotation saved successfully!");
      router.push("/quotations");
    } catch (error: any) {
      toast.error("Error saving: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleUnit = (newUnit: "cm" | "in") => {
    if (unit === newUnit) return;
    const factor = newUnit === "in" ? (1 / 2.54) : 2.54;
    
    setLength(Math.round(length * factor));
    setWidth(Math.round(width * factor));
    setHeight(Math.round(height * factor));
    setSeatWidth(Math.round(seatWidth * factor));
    setSeatHeight(Math.round(seatHeight * factor));
    setSeatDepth(Math.round(seatDepth * factor));
    setBackrestHeight(Math.round(backrestHeight * factor));
    setCushionThickness(Math.round(cushionThickness * factor));
    setArmrestWidth(Math.round(armrestWidth * factor));
    setLegHeight(Math.round(legHeight * factor));
    setLeftSideLength(Math.round(leftSideLength * factor));
    setRightSideLength(Math.round(rightSideLength * factor));
    setHeadboardHeight(Math.round(headboardHeight * factor));
    
    setUnit(newUnit);
  };

  // Helper to render dual-input (Slider + Number)
  const renderDualInput = (label: string, val: number, setVal: (v: number) => void, min: number, max: number) => (
    <div key={label} style={{ marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', alignItems: 'center' }}>
        <label style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', letterSpacing: '1px' }}>{label}</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input 
            type="number" 
            value={val} 
            onChange={(e) => setVal(Number(e.target.value))}
            className="premium-input"
            style={{ width: '80px', padding: '0.25rem 0.5rem', textAlign: 'center', fontSize: '0.875rem', height: 'auto', marginBottom: 0 }}
          />
          <span className="text-gold" style={{ fontWeight: 600, fontSize: '0.875rem', textTransform: 'lowercase' }}>{unit}</span>
        </div>
      </div>
      <input 
        type="range" 
        min={min} 
        max={max} 
        value={val} 
        onChange={e => setVal(Number(e.target.value))} 
        className="premium-slider" 
      />
    </div>
  );

  // Dynamic Seat String Algorithm
  // Use Math.round to perfectly match the 3D Physics Engine's cushion generator
  const mainSeats = Math.max(1, Math.round((length - (armrestWidth * 2)) / seatWidth));
  let calculatedSeatsString = `${mainSeats} Seats`;

  if (productType === "L Shape Sofa" || productType === "U Shape Sofa") {
    const parts = [];
    
    if (chaisePlacement === "Left Side" || productType === "U Shape Sofa") {
      if (leftSideType === "Bed Type") parts.push("[Bed]");
      else {
        // Space for cushions is the protruding length minus the front armrest.
        // We do NOT add the corner seat here because it is already counted in `mainSeats`.
        const extSeatsL = Math.max(1, Math.round((leftSideLength - armrestWidth) / seatWidth));
        parts.push(`[${extSeatsL} Seats]`);
      }
    }

    parts.push(`${mainSeats} Seats`);

    if (chaisePlacement === "Right Side" || productType === "U Shape Sofa") {
      if (rightSideType === "Bed Type") parts.push("[Bed]");
      else {
        const extSeatsR = Math.max(1, Math.round((rightSideLength - armrestWidth) / seatWidth));
        parts.push(`[${extSeatsR} Seats]`);
      }
    }

    calculatedSeatsString = parts.join(" + ");
  }

  const isLShape = productType === "L Shape Sofa";
  const isUShape = productType === "U Shape Sofa";
  const isSofa = productType.includes("Sofa");
  const isBed = productType === "Bed";
  const isMattress = productType === "Mattress";
  const isTable = productType.includes("Table");
  const isChair = productType.includes("Chair");

  return (
    <div className="flex flex-col gap-6" style={{ height: 'calc(100vh - 120px)' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 300, letterSpacing: '1px' }}>Configure <span className="text-gold" style={{ fontWeight: 600 }}>Blueprint</span></h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Precision parametric specification engine.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/measurements" className="btn btn-outline">Cancel</Link>
          <button className="btn btn-primary" style={{ gap: '0.5rem' }} onClick={handleFinalize} disabled={isSubmitting}>
            <Save size={18} /> {isSubmitting ? "Generating..." : "Generate Quotation"}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isSofa ? '450px 1fr' : '1fr', gap: '2.5rem', height: '100%', maxWidth: isSofa ? '100%' : '800px', margin: isSofa ? '0' : '0 auto', width: '100%' }}>
        
        {/* Left Column: Premium Wizard Form */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
          
          {/* Wizard Steps Header */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-elevated)' }}>
            {[
              { num: 1, icon: User, label: "Profile" },
              { num: 2, icon: Ruler, label: "Dimensions" },
              { num: 3, icon: Palette, label: "Styling" },
              { num: 4, icon: Calculator, label: "Pricing" },
            ].map(s => (
              <button 
                key={s.num}
                onClick={() => setStep(s.num)}
                style={{ 
                  flex: 1, padding: '1.25rem 0.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                  borderBottom: step === s.num ? '2px solid var(--color-gold-primary)' : '2px solid transparent',
                  color: step === s.num ? 'var(--color-gold-primary)' : 'var(--color-text-secondary)',
                  opacity: step === s.num ? 1 : 0.5,
                  transition: 'all 0.3s',
                  background: 'transparent',
                  borderTop: 'none', borderLeft: 'none', borderRight: 'none',
                  cursor: 'pointer'
                }}
              >
                <s.icon size={18} />
                <span style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{s.label}</span>
              </button>
            ))}
          </div>

          {/* Scrollable Form Content */}
          <div style={{ padding: '2rem', overflowY: 'auto', flex: 1, overflowX: 'hidden' }}>
            <AnimatePresence mode="wait">
              
              {/* STEP 1: PROFILE */}
              {step === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
                >
                  <StoreSelector value={storeId} onChange={setStoreId} />
                  
                  <div className="premium-input-group" style={{ zIndex: 10 }}>
                    <SearchableSelect 
                      options={customers.map(c => ({ value: c._id, label: c.customerName }))}
                      value={customerId}
                      onChange={setCustomerId}
                      placeholder="Search and Select Customer..."
                      required
                    />
                    <label className="premium-label">Customer *</label>
                  </div>

                  <div className="premium-input-group">
                    <select 
                      className="premium-input" 
                      value={productType}
                      onChange={(e) => setProductType(e.target.value)}
                    >
                      <option>Straight Sofa</option>
                      <option>L Shape Sofa</option>
                      <option>U Shape Sofa</option>
                      <option>Sectional Sofa</option>
                      <option>Recliner Sofa</option>
                      <option>Bed</option>
                      <option>Mattress</option>
                      <option>Tea Table</option>
                      <option>Center Table</option>
                      <option>Dining Chair</option>
                      <option>Single Chair</option>
                    </select>
                    <label className="premium-label">Product Base Architecture</label>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: DIMENSIONS */}
              {step === 2 && (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
                >
                  
                  {/* Dynamic Seat Capacity Display */}
                  {(!productType.includes("Bed") && !productType.includes("Table")) && (
                    <div style={{ background: 'rgba(212, 175, 55, 0.05)', border: '1px solid var(--color-gold-dark)', padding: '1rem', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Hash size={18} className="text-gold" />
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-gold-primary)', letterSpacing: '1px', textTransform: 'uppercase' }}>Auto-Calculated Seats</span>
                      </div>
                      <span style={{ fontSize: '1rem', fontWeight: 600 }}>{calculatedSeatsString}</span>
                    </div>
                  )}

                  {/* Core Dimensions */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-gold-primary)', letterSpacing: '1px', textTransform: 'uppercase' }}>Overall Architecture</h4>
                    <div style={{ display: 'flex', gap: '0.25rem', background: 'rgba(255,255,255,0.05)', padding: '0.25rem', borderRadius: 'var(--radius-sm)' }}>
                      <button 
                        onClick={() => toggleUnit("cm")}
                        style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', fontWeight: 600, borderRadius: 'var(--radius-sm)', background: unit === "cm" ? 'var(--color-gold-primary)' : 'transparent', color: unit === "cm" ? '#000' : 'var(--color-text-secondary)' }}
                      >CM</button>
                      <button 
                        onClick={() => toggleUnit("in")}
                        style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', fontWeight: 600, borderRadius: 'var(--radius-sm)', background: unit === "in" ? 'var(--color-gold-primary)' : 'transparent', color: unit === "in" ? '#000' : 'var(--color-text-secondary)' }}
                      >IN</button>
                    </div>
                  </div>
                  
                  {renderDualInput('OVERALL LENGTH', length, setLength, 50, 400)}
                  {/* If L/U shape, Overall depth refers to main body depth. The extensions have their own lengths. */}
                  {renderDualInput('MAIN BODY DEPTH', width, setWidth, 40, 200)}
                  {renderDualInput('OVERALL HEIGHT', height, setHeight, 30, 150)}

                  <hr style={{ borderColor: 'var(--color-border)', margin: '0.5rem 0' }} />

                  {/* Product Specific Details */}
                  {(isSofa || isChair) && (
                    <>
                      <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-gold-primary)', letterSpacing: '1px', textTransform: 'uppercase' }}>Seating Details</h4>
                      {renderDualInput('SEAT WIDTH', seatWidth, setSeatWidth, 40, 120)}
                      {renderDualInput('SEAT HEIGHT', seatHeight, setSeatHeight, 20, 65)}
                      {renderDualInput('SEAT DEPTH', seatDepth, setSeatDepth, 30, 90)}
                      {renderDualInput('BACKREST HEIGHT', backrestHeight, setBackrestHeight, 20, 90)}
                      
                      {isSofa && (
                        <>
                          {renderDualInput('CUSHION THICKNESS', cushionThickness, setCushionThickness, 5, 25)}
                          {renderDualInput('ARMREST WIDTH', armrestWidth, setArmrestWidth, 0, 40)}
                          
                          <div className="premium-input-group" style={{ marginTop: '0.5rem', marginBottom: '1.25rem' }}>
                            <select className="premium-input" value={handleType} onChange={e => setHandleType(e.target.value)}>
                              <option>Standard Block</option>
                              <option>Track Arm (Sharp & Slim)</option>
                              <option>Rounded Curve</option>
                            </select>
                            <label className="premium-label">Type of Handles</label>
                          </div>
                        </>
                      )}

                      {renderDualInput('LEG HEIGHT', legHeight, setLegHeight, 2, 25)}

                      <div className="premium-input-group" style={{ marginTop: '0.5rem' }}>
                        <select className="premium-input" value={legType} onChange={e => setLegType(e.target.value)}>
                          <option>Hidden Base</option>
                          <option>Metal Pins</option>
                          <option>Wooden Blocks</option>
                        </select>
                        <label className="premium-label">Type of Legs</label>
                      </div>
                    </>
                  )}

                  {isBed && (
                    <>
                      <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-gold-primary)', letterSpacing: '1px', textTransform: 'uppercase' }}>Bed Specifications</h4>
                      {renderDualInput('HEADBOARD HEIGHT', headboardHeight, setHeadboardHeight, 60, 200)}
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-text-primary)', marginTop: '1rem' }}>
                        <input type="checkbox" checked={hasStorage} onChange={e => setHasStorage(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: 'var(--color-gold-primary)' }} />
                        Includes Built-in Storage (Hydraulic/Drawers)
                      </label>
                    </>
                  )}

                  {isMattress && (
                    <>
                      <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-gold-primary)', letterSpacing: '1px', textTransform: 'uppercase' }}>Mattress Details</h4>
                      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>Note: Use Overall Height for the Mattress Thickness.</p>
                    </>
                  )}

                  {/* Asymmetric Extensions */}
                  {(isLShape || isUShape) && (
                    <>
                      <hr style={{ borderColor: 'var(--color-border)', margin: '0.5rem 0' }} />
                      <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-gold-primary)', letterSpacing: '1px', textTransform: 'uppercase' }}>Asymmetric Extensions</h4>
                      
                      {isLShape && (
                        <div className="premium-input-group">
                          <select className="premium-input" value={chaisePlacement} onChange={e => setChaisePlacement(e.target.value)}>
                            <option>Left Side</option>
                            <option>Right Side</option>
                          </select>
                          <label className="premium-label">Extension Placement</label>
                        </div>
                      )}

                      {(chaisePlacement === "Left Side" || isUShape) && (
                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', marginBottom: '1rem' }}>
                          <h5 style={{ fontSize: '0.8rem', color: 'var(--color-text-primary)', marginBottom: '1rem', letterSpacing: '1px' }}>LEFT EXTENSION</h5>
                          <div className="premium-input-group">
                            <select className="premium-input" value={leftSideType} onChange={e => setLeftSideType(e.target.value)}>
                              <option>Bed Type</option>
                              <option>Seat Type</option>
                            </select>
                            <label className="premium-label">Configuration</label>
                          </div>
                          {renderDualInput('EXTENSION LENGTH', leftSideLength, setLeftSideLength, 80, 300)}
                        </div>
                      )}

                      {(chaisePlacement === "Right Side" || isUShape) && (
                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                          <h5 style={{ fontSize: '0.8rem', color: 'var(--color-text-primary)', marginBottom: '1rem', letterSpacing: '1px' }}>RIGHT EXTENSION</h5>
                          <div className="premium-input-group">
                            <select className="premium-input" value={rightSideType} onChange={e => setRightSideType(e.target.value)}>
                              <option>Bed Type</option>
                              <option>Seat Type</option>
                            </select>
                            <label className="premium-label">Configuration</label>
                          </div>
                          {renderDualInput('EXTENSION LENGTH', rightSideLength, setRightSideLength, 80, 300)}
                        </div>
                      )}
                    </>
                  )}

                  {productType === "Recliner Sofa" && (
                    <>
                      <hr style={{ borderColor: 'var(--color-border)', margin: '0.5rem 0' }} />
                      <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-gold-primary)', letterSpacing: '1px', textTransform: 'uppercase' }}>Recliner Options</h4>
                      <div className="premium-input-group">
                        <input type="number" className="premium-input" value={reclinerSeats} onChange={e => setReclinerSeats(Number(e.target.value))} />
                        <label className="premium-label">Number of Recliner Seats</label>
                      </div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-text-primary)' }}>
                        <input type="checkbox" checked={isMotorized} onChange={e => setIsMotorized(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: 'var(--color-gold-primary)' }} />
                        Motorized Mechanism
                      </label>
                    </>
                  )}


                </motion.div>
              )}

              {/* STEP 3: STYLING */}
              {step === 3 && (
                <motion.div 
                  key="step3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
                >
                  <div className="premium-input-group">
                    <select value={catalog} onChange={e => {
                      setCatalog(e.target.value);
                      const selectedCatalog = materialCatalogs.find(c => c.name === e.target.value);
                      if (selectedCatalog && selectedCatalog.colors && selectedCatalog.colors.length > 0) {
                        setColorCode(selectedCatalog.colors[0].code);
                      } else {
                        setColorCode("");
                      }
                    }} className="premium-input">
                      <option value="">Select a Catalog</option>
                      {materialCatalogs.map(c => (
                        <option key={c._id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                    <label className="premium-label">Material Catalog</label>
                  </div>

                  {catalog && (
                    <div className="premium-input-group">
                      <select value={colorCode} onChange={e => setColorCode(e.target.value)} className="premium-input">
                        {materialCatalogs.find(c => c.name === catalog)?.colors?.map((c: any) => (
                          <option key={c.code} value={c.code}>{c.name} ({c.code})</option>
                        ))}
                      </select>
                      <label className="premium-label">Material Color Code</label>
                    </div>
                  )}

                  {(!isTable) && (
                    <div className="premium-input-group">
                      <select value={cushionType} onChange={e => setCushionType(e.target.value)} className="premium-input">
                        {isMattress ? (
                          <>
                            <option>Memory Foam</option>
                            <option>Orthopedic Spring</option>
                            <option>Natural Latex</option>
                            <option>Hybrid Medium-Firm</option>
                          </>
                        ) : (
                          <>
                            <option>Soft Plume (32D)</option>
                            <option>Signature Medium (40D)</option>
                            <option>Firm Support (50D)</option>
                          </>
                        )}
                      </select>
                      <label className="premium-label">{isMattress ? "Mattress Material" : "Cushion Core Density"}</label>
                    </div>
                  )}

                  {(isSofa || isChair) && (
                    <>
                      <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-gold-primary)', letterSpacing: '1px', textTransform: 'uppercase' }}>Premium Add-ons</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-text-primary)' }}>
                          <input type="checkbox" checked={hasAdjustableHeadrest} onChange={e => setHasAdjustableHeadrest(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: 'var(--color-gold-primary)' }} />
                          Adjustable Headrest Mechanism
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-text-primary)' }}>
                          <input type="checkbox" checked={hasCupHolder} onChange={e => setHasCupHolder(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: 'var(--color-gold-primary)' }} />
                          Center Console Cup Holders
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-text-primary)' }}>
                          <input type="checkbox" checked={hasUSB} onChange={e => setHasUSB(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: 'var(--color-gold-primary)' }} />
                          Integrated USB Charging Ports
                        </label>
                      </div>
                    </>
                  )}

                  <div className="premium-input-group" style={{ marginTop: '1rem' }}>
                    <textarea 
                      value={specialNotes}
                      onChange={e => setSpecialNotes(e.target.value)}
                      className="premium-input" 
                      rows={4} 
                      placeholder="Mandatory for custom stitching, color matching, or delivery constraints..."
                      style={{ resize: 'none' }}
                    ></textarea>
                    <label className="premium-label">Production & Bespoke Notes *</label>
                  </div>
                </motion.div>
              )}

              {/* STEP 4: MANUAL PRICING */}
              {step === 4 && (
                <motion.div 
                  key="step4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
                >
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-gold-primary)', letterSpacing: '1px', textTransform: 'uppercase' }}>Manual Pricing Configuration</h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>Please calculate offline and enter the final estimated values to generate the official quotation.</p>
                  
                  <div className="premium-input-group">
                    <input type="number" className="premium-input" value={estimatedMaterialCost || ""} onChange={e => setEstimatedMaterialCost(Number(e.target.value))} placeholder="₹ 0" />
                    <label className="premium-label">Estimated Material Cost (Fabric, Foam, Wood)</label>
                  </div>

                  <div className="premium-input-group">
                    <input type="number" className="premium-input" value={estimatedLaborCost || ""} onChange={e => setEstimatedLaborCost(Number(e.target.value))} placeholder="₹ 0" />
                    <label className="premium-label">Estimated Labor & Logistics Cost</label>
                  </div>

                  <div style={{ background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1), transparent)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-gold-dark)', marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--color-text-secondary)' }}>Total Internal Cost</span>
                      <span style={{ fontWeight: 600 }}>₹{(estimatedMaterialCost + estimatedLaborCost).toLocaleString()}</span>
                    </div>
                    
                    <hr style={{ borderColor: 'var(--color-border)' }} />
                    
                    <div className="premium-input-group" style={{ margin: 0 }}>
                      <input type="number" className="premium-input" value={finalQuotationPrice || ""} onChange={e => setFinalQuotationPrice(Number(e.target.value))} placeholder="₹ 0" style={{ fontSize: '1.25rem', fontWeight: 600 }} />
                      <label className="premium-label">Base Selling Price</label>
                    </div>

                    <div className="premium-input-group" style={{ margin: 0 }}>
                      <input type="number" className="premium-input" value={discount || ""} onChange={e => setDiscount(Number(e.target.value))} placeholder="₹ 0" />
                      <label className="premium-label">Discount Amount (₹)</label>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)' }}>
                      <span>GST ({settings ? ((settings.cgstRate || 0) + (settings.sgstRate || 0) + (settings.igstRate || 0)) : 18}%)</span>
                      <span>+ ₹{taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>

                    <hr style={{ borderColor: 'var(--color-border)' }} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--color-gold-primary)', fontWeight: 600, letterSpacing: '1px' }}>FINAL ESTIMATION</span>
                      <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-gold-primary)' }}>₹{finalEstimationAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>

                  <div className="premium-input-group" style={{ marginTop: '0.5rem' }}>
                    <input type="date" className="premium-input" value={expectedDeliveryDate} onChange={e => setExpectedDeliveryDate(e.target.value)} required />
                    <label className="premium-label">Expected Delivery Date *</label>
                  </div>

                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Footer Navigation */}
          <div style={{ padding: '1.5rem', borderTop: '1px solid var(--color-border)', background: 'var(--color-bg-elevated)', display: 'flex', justifyContent: 'space-between', zIndex: 10 }}>
            <button 
              className="btn btn-outline" 
              style={{ visibility: step === 1 ? 'hidden' : 'visible' }}
              onClick={() => setStep(step - 1)}
            >
              Previous
            </button>
            <button 
              className="btn btn-primary" 
              onClick={() => step < 4 ? setStep(step + 1) : handleFinalize()}
              disabled={isSubmitting}
            >
              {step === 4 ? (isSubmitting ? 'Generating...' : 'Generate Quotation') : 'Next Category'}
            </button>
          </div>
        </div>

        {/* Right Column: 3D Preview or 2D Graphic */}
        {isSofa && (
          <div style={{ height: '100%', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-glass)' }}>
            <FurniturePreview 
              productType={productType}
              length={length}
              width={width}
              height={height}
              seatWidth={seatWidth}
              seatHeight={seatHeight}
              armrestWidth={armrestWidth}
              colorCode={colorCode}
              chaisePlacement={chaisePlacement}
              leftSideLength={leftSideLength}
              leftSideType={leftSideType}
              rightSideLength={rightSideLength}
              rightSideType={rightSideType}
              calculatedSeats={mainSeats}
              unit={unit}
              handleType={handleType}
              legType={legType}
              legHeight={legHeight}
            />
          </div>
        )}

      </div>
    </div>
  );
}
