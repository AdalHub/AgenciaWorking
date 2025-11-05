// src/components/Public/PaymentFailed.tsx

export default function PaymentFailed() {
  return (
    <div style={{ maxWidth: 700, margin: '2rem auto', padding: '0 1rem' }}>
      <h1>Payment canceled</h1>
      <p>Your payment was not completed. You can go back to the schedule page and try again.</p>
    </div>
  );
}
