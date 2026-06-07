"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import OrderForm from "../../OrderForm";

export default function EditOrderPage() {
  const params = useParams();
  const id = params.id as string;
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.order) {
          setOrder(data.order);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, [id]);

  if (isLoading) return <div>Loading...</div>;
  if (!order) return <div>Order not found</div>;

  return (
    <div className="flex flex-col gap-6 animate-fade-in" style={{ animation: 'fadeIn 0.6s ease', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 300, letterSpacing: '1px' }}>
          Edit <span className="text-gold" style={{ fontWeight: 600 }}>Order</span>
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem', marginTop: '0.25rem' }}>
          Update an existing production order.
        </p>
      </div>

      <OrderForm initialData={order} orderId={id} />
    </div>
  );
}
