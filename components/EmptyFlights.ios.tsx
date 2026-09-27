import { ContentUnavailableView, Host } from '@expo/ui/swift-ui';

/** The system empty state, so it matches Mail, Photos and Wallet exactly. */
export function EmptyFlights() {
  return (
    <Host colorScheme="dark" style={{ height: 220 }}>
      <ContentUnavailableView
        title="No Upcoming Flights"
        systemImage="airplane"
        description="Flights you add will appear here."
      />
    </Host>
  );
}
