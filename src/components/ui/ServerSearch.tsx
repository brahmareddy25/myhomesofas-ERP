"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Search, Loader2 } from "lucide-react";

export default function ServerSearch({ placeholder = "Search..." }: { placeholder?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const initialQuery = searchParams?.get("q") || "";
  const [isPending, startTransition] = useTransition();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const input = form.querySelector('input') as HTMLInputElement;
    const val = input.value;
    
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (val) {
      params.set("q", val);
    } else {
      params.delete("q");
    }
    // Reset to page 1 on new search
    params.set("page", "1");
    
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', flex: 1, maxWidth: '500px' }}>
      <div style={{ position: 'relative', flex: 1 }}>
        {isPending ? (
          <Loader2 size={18} className="animate-spin" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gold-primary)' }} />
        ) : (
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
        )}
        <input
          type="text"
          className="premium-input"
          placeholder={placeholder}
          defaultValue={initialQuery}
          onChange={(e) => {
            const val = e.target.value;
            const params = new URLSearchParams(searchParams?.toString() || "");
            if (val) {
              params.set("q", val);
            } else {
              params.delete("q");
            }
            params.set("page", "1");
            startTransition(() => {
              router.push(`${pathname}?${params.toString()}`);
            });
          }}
          style={{ paddingLeft: '2.5rem', margin: 0, height: '42px', opacity: isPending ? 0.7 : 1 }}
        />
      </div>
      <button 
        type="submit" 
        className="btn btn-primary" 
        disabled={isPending}
        style={{ height: '42px', padding: '0 1.5rem' }}
      >
        Search
      </button>
    </form>
  );
}
