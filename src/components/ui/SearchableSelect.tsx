"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Search } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

export default function SearchableSelect({ options, value, onChange, placeholder = "Select...", required }: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`searchable-select-container ${selectedOption ? 'has-value' : ''}`} ref={dropdownRef} style={{ position: 'relative', width: '100%' }}>
      {/* Hidden native input for form validation if required */}
      {required && (
        <input 
          type="text" 
          value={value} 
          onChange={() => {}} 
          required 
          style={{ opacity: 0, position: 'absolute', height: 0, width: 0, zIndex: -1 }} 
        />
      )}

      {/* Trigger Button */}
      <div 
        className={`premium-input ${selectedOption ? 'has-value' : ''}`}
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          cursor: 'pointer',
          color: selectedOption ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
          background: 'var(--color-bg-elevated)'
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={16} style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          right: 0,
          background: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          zIndex: 50,
          maxHeight: '300px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Search Box */}
          <div style={{ padding: '0.5rem', borderBottom: '1px solid var(--color-border)', position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
            <input 
              type="text" 
              autoFocus
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.5rem 0.5rem 2rem',
                border: 'none',
                background: 'transparent',
                outline: 'none',
                color: 'var(--color-text-primary)',
                fontSize: '0.875rem'
              }}
            />
          </div>

          {/* Options List */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div 
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                    setSearchQuery("");
                  }}
                  style={{
                    padding: '0.75rem 1rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    background: value === opt.value ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                    color: value === opt.value ? 'var(--color-gold-primary)' : 'var(--color-text-primary)',
                    borderLeft: value === opt.value ? '3px solid var(--color-gold-primary)' : '3px solid transparent',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = value === opt.value ? 'rgba(212, 175, 55, 0.1)' : 'var(--color-bg-base)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = value === opt.value ? 'rgba(212, 175, 55, 0.1)' : 'transparent'}
                >
                  {opt.label}
                </div>
              ))
            ) : (
              <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                No results found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
