"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save, MapPin, User, Phone, Map, Store as StoreIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import toast from 'react-hot-toast';

export default function NewCustomerPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gps, setGps] = useState<{lat: number | null, lng: number | null}>({ lat: null, lng: null });

  const [stores, setStores] = useState<any[]>([]);
  const [storeId, setStoreId] = useState("");

  useEffect(() => {
    if (role === "Admin") {
      fetch("/api/stores")
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setStores(data);
            if (data.length > 0) setStoreId(data[0]._id);
          }
        })
        .catch(console.error);
    }
  }, [role]);

  // Form Fields
  const [customerName, setCustomerName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [alternateMobileNumber, setAlternateMobileNumber] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [fullAddress, setFullAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");

  const fetchLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => setGps({ lat: position.coords.latitude, lng: position.coords.longitude }),
        (error) => toast.error("Failed to fetch location. Please enter manually.")
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          age: age ? Number(age) : undefined,
          gender: gender || undefined,
          mobileNumber,
          alternateMobileNumber,
          emailAddress,
          fullAddress,
          city,
          state,
          pincode,
          storeId: role === "Admin" ? storeId : undefined,
          gpsCoordinates: gps.lat && gps.lng ? { latitude: gps.lat, longitude: gps.lng } : undefined
        })
      });

      if (res.ok) {
        toast.success("Customer Profile Created Successfully!");
        router.push("/customers");
      } else {
        const error = await res.json();
        toast.error("Error saving customer: " + error.error);
      }
    } catch (err) {
      toast.error("Failed to connect to server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in" style={{ animation: 'fadeIn 0.6s ease', maxWidth: '900px', margin: '0 auto' }}>
      
      <div style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 300, letterSpacing: '1px' }}>
          New <span className="text-gold" style={{ fontWeight: 600 }}>Customer</span>
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem', marginTop: '0.25rem' }}>
          Register a new client profile into the ERP system.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Store Selection (Admin Only) */}
        {role === "Admin" && (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', border: '1px solid var(--color-gold-primary)' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-gold-primary)' }}>
              <StoreIcon size={20} /> Assign to Store
            </h4>
            <div className="premium-input-group">
              <select className="premium-input" value={storeId} onChange={e => setStoreId(e.target.value)} required>
                {stores.length === 0 && <option value="" disabled>Loading stores...</option>}
                {stores.map(store => (
                  <option key={store._id} value={store._id}>{store.storeName} ({store.city})</option>
                ))}
              </select>
              <label className="premium-label">Select Store</label>
            </div>
          </div>
        )}

        {/* Personal Details */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-primary)', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
            <User size={20} className="text-gold" /> Personal Information
          </h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="premium-input-group">
              <input type="text" className="premium-input" required value={customerName} onChange={e => setCustomerName(e.target.value)} />
              <label className="premium-label">Full Name *</label>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="premium-input-group">
                <input type="number" className="premium-input" value={age} onChange={e => setAge(e.target.value)} />
                <label className="premium-label">Age</label>
              </div>
              <div className="premium-input-group">
                <select className="premium-input" value={gender} onChange={e => setGender(e.target.value)}>
                  <option value="" disabled hidden></option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <label className="premium-label">Gender</label>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Details */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-primary)', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
            <Phone size={20} className="text-gold" /> Contact Information
          </h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="premium-input-group">
              <input type="tel" className="premium-input" required value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} />
              <label className="premium-label">Mobile Number *</label>
            </div>
            <div className="premium-input-group">
              <input type="tel" className="premium-input" value={alternateMobileNumber} onChange={e => setAlternateMobileNumber(e.target.value)} />
              <label className="premium-label">Alternate Number</label>
            </div>
            <div className="premium-input-group" style={{ gridColumn: '1 / -1' }}>
              <input type="email" className="premium-input" value={emailAddress} onChange={e => setEmailAddress(e.target.value)} />
              <label className="premium-label">Email Address</label>
            </div>
          </div>
        </div>

        {/* Address & GPS */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              <Map size={20} className="text-gold" /> Location Details
            </h4>
            <button type="button" onClick={fetchLocation} className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', gap: '0.5rem' }}>
              <MapPin size={16} /> Fetch GPS Coordinates
            </button>
          </div>
          
          {gps.lat && (
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--color-success)' }}>
              <MapPin size={16} /> GPS Captured: {gps.lat.toFixed(6)}, {gps.lng?.toFixed(6)}
            </div>
          )}

          <div className="premium-input-group">
            <textarea className="premium-input" rows={3} required value={fullAddress} onChange={e => setFullAddress(e.target.value)}></textarea>
            <label className="premium-label">Full Address *</label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
            <div className="premium-input-group">
              <input type="text" className="premium-input" required value={city} onChange={e => setCity(e.target.value)} />
              <label className="premium-label">City *</label>
            </div>
            <div className="premium-input-group">
              <input type="text" className="premium-input" required value={state} onChange={e => setState(e.target.value)} />
              <label className="premium-label">State *</label>
            </div>
            <div className="premium-input-group">
              <input type="text" className="premium-input" required value={pincode} onChange={e => setPincode(e.target.value)} />
              <label className="premium-label">Pincode *</label>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button type="button" className="btn btn-outline" onClick={() => router.back()}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ gap: '0.5rem', width: '250px' }}>
            <Save size={18} /> {isSubmitting ? 'Saving...' : 'Save Customer Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
