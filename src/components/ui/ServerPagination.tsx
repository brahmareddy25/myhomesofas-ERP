"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ServerPagination({ currentPage, totalPages, totalItems }: { currentPage: number, totalPages: number, totalItems: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set("page", newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  if (totalPages <= 1 && totalItems === 0) return null;

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderTop: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-50)' }}>
      <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
        Showing <strong>{totalItems === 0 ? 0 : (currentPage - 1) * 10 + 1}</strong> to <strong>{Math.min(currentPage * 10, totalItems)}</strong> of <strong>{totalItems}</strong> entries
      </span>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button 
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: currentPage <= 1 ? 'var(--color-surface-100)' : 'var(--color-surface-0)', color: currentPage <= 1 ? 'var(--color-text-secondary)' : 'var(--color-text-primary)', cursor: currentPage <= 1 ? 'not-allowed' : 'pointer' }}
        >
          <ChevronLeft size={16} /> Prev
        </button>
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 0.5rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>
          Page {currentPage} of {totalPages || 1}
        </div>
        <button 
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: currentPage >= totalPages ? 'var(--color-surface-100)' : 'var(--color-surface-0)', color: currentPage >= totalPages ? 'var(--color-text-secondary)' : 'var(--color-text-primary)', cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer' }}
        >
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
