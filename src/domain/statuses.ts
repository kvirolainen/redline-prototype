// Car statuses for the Redline prototype. One car moves through these; every change writes an event.
export type CarStatus =
  | 'offered'
  | 'awaiting_pickup'
  | 'not_ready'
  | 'reprice_pending'
  | 'confirmed'
  | 'picked_up'
  | 'paid'
  | 'declined'
  | 'expired'
  | 'cancelled';

export type StatusTone = 'neutral' | 'active' | 'attention' | 'done' | 'closed';

export const STATUS: Record<CarStatus, { label: string; tone: StatusTone; hint: string }> = {
  offered: { label: 'Offer made', tone: 'neutral', hint: 'Firm offer, holds for 7 days' },
  awaiting_pickup: { label: 'Awaiting pickup', tone: 'active', hint: 'Joined the next pickup day' },
  not_ready: { label: 'Not ready', tone: 'attention', hint: 'Rolls to the next pickup day' },
  reprice_pending: { label: 'Re-price pending', tone: 'attention', hint: 'Waiting for the director' },
  confirmed: { label: 'Confirmed', tone: 'active', hint: 'Inspection matched the declaration' },
  picked_up: { label: 'Picked up', tone: 'active', hint: 'On a Clutch truck' },
  paid: { label: 'Paid', tone: 'done', hint: 'Payment sent to the dealer' },
  declined: { label: 'Declined', tone: 'closed', hint: 'Stays with the dealer' },
  expired: { label: 'Offer expired', tone: 'closed', hint: 'One-click refresh' },
  cancelled: { label: 'Cancelled', tone: 'closed', hint: 'Dealer cancelled before pickup' },
};

export const STATUS_ORDER: CarStatus[] = [
  'offered', 'awaiting_pickup', 'not_ready', 'confirmed', 'reprice_pending',
  'picked_up', 'paid', 'declined', 'expired', 'cancelled',
];
