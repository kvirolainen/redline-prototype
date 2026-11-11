import type { Meta, StoryObj } from '@storybook/react-vite';
import { OfferCard } from '../../components/ui/OfferCard';
import { Group, Page } from './Specimen';

function Offer() {
  return (
    <Page title="Offer card" intro="Clutch's “Here's your firm offer” card, plus what a dealer needs: the gap to the auction estimate and how long it holds.">
      <div className="grid gap-10 md:grid-cols-2">
        <Group label="Firm offer">
          <h3 className="mb-6 text-center text-h4 font-bold text-ink">Here's your firm offer</h3>
          <OfferCard
            amount={17850}
            auctionEstimate={16000}
            validUntil="Wed Nov 18"
            car="2019 Honda Civic EX"
            vin="2HGFC2F69KH512345"
            km={68400}
            reference="R-YH-0412"
          />
        </Group>
        <Group label="Guaranteed floor" note="When the calculator isn't confident: a floor now, the firm offer the same business day.">
          <h3 className="mb-6 text-center text-h4 font-bold text-ink">Your guaranteed floor</h3>
          <div className="rounded-card border border-line bg-white px-6 py-8 text-center">
            <p className="text-base text-ink">Guaranteed at least</p>
            <p className="mt-3 text-price font-bold text-ink">$15,500</p>
            <p className="mx-auto mt-3 max-w-[360px] text-sm text-muted">
              Close the deal now. Your firm offer lands in the back office by 5 pm today and won't go below this number.
            </p>
          </div>
        </Group>
      </div>
    </Page>
  );
}

const meta = { title: 'Foundations/Offer card', component: Offer, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof Offer>;
export default meta;
export const Default: StoryObj<typeof meta> = {};
