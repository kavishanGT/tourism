import { Trip } from "@/lib/api/trips";
import {
  DestinationMeta,
  TripClimateSummary,
  TripBudgetSummary,
} from "@/lib/constants/destination-registry";

/**
 * Generates an official, print-ready HTML voucher for the trip,
 * formatted cleanly for A4 printing and "Save as PDF".
 */
export function printTripVoucher(
  trip: Trip,
  destinations: DestinationMeta[],
  climate?: TripClimateSummary | null,
  budget?: TripBudgetSummary | null
): void {
  if (!trip) return;

  const voucherRef = `SLT-${trip.id ? trip.id.substring(0, 8).toUpperCase() : "EXP-" + Math.floor(1000 + Math.random() * 9000)}`;
  const issueDate = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const destinationsList = destinations.map((d) => d.name).join(" → ");

  // Build Day-by-Day schedule HTML
  const daysHtml = (trip.days || [])
    .map(
      (day) => `
      <div class="day-section">
        <div class="day-header">
          <span class="day-number">DAY ${day.day_number}</span>
          <span class="day-title">${day.title || `Day ${day.day_number}`}</span>
          ${day.date ? `<span class="day-date">📅 ${day.date}</span>` : ""}
        </div>
        <table class="schedule-table">
          <thead>
            <tr>
              <th style="width: 22%;">Time</th>
              <th style="width: 38%;">Activity</th>
              <th style="width: 40%;">Notes & Highlights</th>
            </tr>
          </thead>
          <tbody>
            ${(day.items || [])
              .map(
                (item) => `
              <tr>
                <td class="time-col">
                  <strong>${item.start_time ? item.start_time.substring(0, 5) : "09:00"}</strong>
                  ${item.end_time ? ` - ${item.end_time.substring(0, 5)}` : ""}
                </td>
                <td>
                  <div class="item-title">${item.title}</div>
                  ${item.estimated_cost ? `<span class="cost-badge">Est. ${item.currency || "USD"} ${item.estimated_cost}</span>` : ""}
                </td>
                <td class="notes-col">${item.notes || "—"}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `
    )
    .join("");

  const destinationsCardsHtml = destinations
    .map(
      (dest) => `
      <div class="dest-mini-card">
        <div class="dest-name">${dest.name}</div>
        <div class="dest-region">${dest.region}</div>
        <div class="dest-tagline">${dest.tagline}</div>
      </div>
    `
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${trip.title} - Official Travel Voucher</title>
  <style>
    @page {
      size: A4;
      margin: 14mm 14mm 14mm 14mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      background: #ffffff;
      line-height: 1.45;
      font-size: 11pt;
    }
    .voucher-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 10px;
    }
    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #059669;
      padding-bottom: 12px;
      margin-bottom: 16px;
    }
    .brand-title {
      font-size: 20pt;
      font-weight: 800;
      color: #065f46;
      letter-spacing: -0.5px;
    }
    .brand-sub {
      font-size: 9pt;
      color: #047857;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .voucher-badge {
      text-align: right;
    }
    .badge-ref {
      font-family: monospace;
      font-weight: 700;
      font-size: 11pt;
      color: #0f172a;
      background: #f1f5f9;
      padding: 4px 8px;
      border-radius: 4px;
      border: 1px solid #cbd5e1;
    }
    .badge-date {
      font-size: 8.5pt;
      color: #64748b;
      margin-top: 4px;
    }
    /* Hero info */
    .trip-title {
      font-size: 16pt;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 6px;
    }
    .trip-desc {
      font-size: 10pt;
      color: #475569;
      margin-bottom: 14px;
    }
    /* Summary Grid */
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 16px;
    }
    .summary-item .label {
      font-size: 8pt;
      text-transform: uppercase;
      color: #64748b;
      font-weight: 600;
    }
    .summary-item .val {
      font-size: 10.5pt;
      font-weight: 700;
      color: #0f172a;
      margin-top: 2px;
    }
    /* Destinations bar */
    .dest-section {
      margin-bottom: 18px;
    }
    .section-heading {
      font-size: 11pt;
      font-weight: 700;
      color: #065f46;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 4px;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .dest-cards {
      display: grid;
      grid-template-columns: repeat(${Math.min(destinations.length, 3)}, 1fr);
      gap: 10px;
    }
    .dest-mini-card {
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 8px 10px;
      background: #ffffff;
    }
    .dest-name {
      font-weight: 700;
      font-size: 10pt;
      color: #0f172a;
    }
    .dest-region {
      font-size: 8pt;
      color: #059669;
      font-weight: 600;
    }
    .dest-tagline {
      font-size: 8.5pt;
      color: #64748b;
      margin-top: 2px;
    }
    /* Schedule */
    .day-section {
      margin-bottom: 16px;
      page-break-inside: avoid;
    }
    .day-header {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #065f46;
      color: #ffffff;
      padding: 6px 10px;
      border-radius: 6px 6px 0 0;
    }
    .day-number {
      background: #047857;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 8pt;
      font-weight: 700;
    }
    .day-title {
      font-weight: 700;
      font-size: 10.5pt;
    }
    .day-date {
      margin-left: auto;
      font-size: 8.5pt;
      opacity: 0.9;
    }
    .schedule-table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #cbd5e1;
      border-top: none;
      border-radius: 0 0 6px 6px;
      font-size: 9.5pt;
    }
    .schedule-table th {
      background: #f1f5f9;
      color: #475569;
      text-align: left;
      padding: 6px 10px;
      font-size: 8pt;
      text-transform: uppercase;
      border-bottom: 1px solid #cbd5e1;
    }
    .schedule-table td {
      padding: 8px 10px;
      border-bottom: 1px solid #f1f5f9;
      vertical-align: top;
    }
    .schedule-table tr:last-child td {
      border-bottom: none;
    }
    .time-col {
      font-family: monospace;
      color: #334155;
      font-size: 9pt;
    }
    .item-title {
      font-weight: 600;
      color: #0f172a;
    }
    .cost-badge {
      display: inline-block;
      margin-top: 2px;
      font-size: 7.5pt;
      background: #ecfdf5;
      color: #047857;
      border: 1px solid #a7f3d0;
      padding: 1px 4px;
      border-radius: 3px;
    }
    .notes-col {
      color: #475569;
      font-size: 8.5pt;
    }
    /* Emergency Contacts */
    .emergency-box {
      margin-top: 20px;
      border: 1px solid #fca5a5;
      background: #fff1f2;
      border-radius: 8px;
      padding: 10px 14px;
      page-break-inside: avoid;
    }
    .emergency-title {
      font-weight: 700;
      font-size: 9.5pt;
      color: #991b1b;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .emergency-numbers {
      display: flex;
      gap: 16px;
      font-size: 8.5pt;
      color: #7f1d1d;
    }
    .emergency-numbers strong {
      color: #991b1b;
    }
    .footer {
      margin-top: 16px;
      text-align: center;
      font-size: 8pt;
      color: #94a3b8;
      border-top: 1px solid #e2e8f0;
      padding-top: 8px;
    }
    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="voucher-container">
    <div class="no-print" style="margin-bottom: 12px; display: flex; justify-content: flex-end; gap: 8px;">
      <button onclick="window.print()" style="background: #059669; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 600; cursor: pointer;">
        🖨️ Print / Save as PDF
      </button>
      <button onclick="window.close()" style="background: #e2e8f0; color: #334155; border: none; padding: 8px 14px; border-radius: 6px; font-weight: 600; cursor: pointer;">
        Close
      </button>
    </div>

    <!-- Header -->
    <div class="header">
      <div>
        <div class="brand-title">Sri Lanka Tourism</div>
        <div class="brand-sub">Official Itinerary & Travel Voucher</div>
      </div>
      <div class="voucher-badge">
        <div class="badge-ref">REF: ${voucherRef}</div>
        <div class="badge-date">Issued: ${issueDate}</div>
      </div>
    </div>

    <!-- Trip Overview -->
    <h1 class="trip-title">${trip.title}</h1>
    ${trip.description ? `<p class="trip-desc">${trip.description}</p>` : ""}

    <div class="summary-grid">
      <div class="summary-item">
        <div class="label">Duration</div>
        <div class="val">${trip.days ? trip.days.length : 1} Days</div>
      </div>
      <div class="summary-item">
        <div class="label">Destinations</div>
        <div class="val">${destinationsList || trip.destination || "Sri Lanka"}</div>
      </div>
      <div class="summary-item">
        <div class="label">Est. Budget</div>
        <div class="val">${budget ? `$${budget.totalMinUsd} - $${budget.totalMaxUsd} USD` : "Flexible"}</div>
      </div>
      <div class="summary-item">
        <div class="label">Best Window</div>
        <div class="val">${climate ? climate.bestSeason.split("(")[0] : "Nov - Apr"}</div>
      </div>
    </div>

    <!-- Destination Highlights -->
    ${
      destinations.length > 0
        ? `
      <div class="dest-section">
        <div class="section-heading">Planned Destination Stops</div>
        <div class="dest-cards">
          ${destinationsCardsHtml}
        </div>
      </div>
    `
        : ""
    }

    <!-- Schedule -->
    <div class="dest-section">
      <div class="section-heading">Day-by-Day Schedule & Itinerary</div>
      ${daysHtml}
    </div>

    <!-- Emergency Contacts -->
    <div class="emergency-box">
      <div class="emergency-title">🚨 Essential Sri Lanka Traveler Hotlines</div>
      <div class="emergency-numbers">
        <span>Tourist Police Hotline: <strong>1912</strong></span>
        <span>National Police Emergency: <strong>119</strong></span>
        <span>Suwa Seriya Free Ambulance: <strong>1990</strong></span>
        <span>Airport Inquiries (BIA): <strong>+94 11 225 2861</strong></span>
      </div>
    </div>

    <div class="footer">
      Generated by Sri Lanka Tourism Platform • Present this voucher or digital PDF to tour operators, drivers, and hotels.
    </div>
  </div>

  <script>
    // Auto-trigger print dialog upon load
    window.addEventListener("load", () => {
      setTimeout(() => {
        window.print();
      }, 500);
    });
  </script>
</body>
</html>
  `;

  const printWindow = window.open("", "_blank", "width=900,height=750");
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  }
}
