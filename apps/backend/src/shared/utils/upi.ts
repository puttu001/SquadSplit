// Generates a UPI deep-link that opens any UPI app on the receiver's device.
// Format: upi://pay?pa=<upi_id>&pn=<name>&am=<amount>&cu=INR&tn=<note>

export function buildUpiLink(params: {
  upiId: string;
  name: string;
  amount: number;
  note?: string;
}): string {
  const { upiId, name, amount, note = 'SquadSplit settlement' } = params;
  const url = new URL('upi://pay');
  url.searchParams.set('pa', upiId);
  url.searchParams.set('pn', name);
  url.searchParams.set('am', amount.toFixed(2));
  url.searchParams.set('cu', 'INR');
  url.searchParams.set('tn', note);
  return url.toString();
}
