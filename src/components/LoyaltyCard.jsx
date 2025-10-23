export default function LoyaltyCard({ loyaltyId, points }) {
  return (
    <div className="loyalty-card">
      <p>Your Loyalty ID: <strong>{loyaltyId}</strong></p>
      <p>Points: {points}</p>
    </div>
  );
}
