import { Booking, TechnicianTask, PoolProfile } from '../types';

export interface DriveExportBundle {
  markdownDocument: string;
  htmlDocument: string;
  bookingsCsv: string;
  tasksCsv: string;
  fullJsonBackup: string;
  totalProjects: number;
}

export function generateGoogleDriveExport(
  pools: PoolProfile[],
  bookings: Booking[],
  tasks: TechnicianTask[]
): DriveExportBundle {
  const generatedAt = new Date().toLocaleString();

  // 1. Google Docs Formatted Markdown
  let markdown = `# Sello Pools - Master Pool Projects & Quotations Dossier
*Generated on: ${generatedAt}*
*Location: Pretoria and surrounds, South Africa*
*Standard Specification: 0.75kW Speck Pump & 2-Bag Sand Filter Always Included*

---

## 1. Executive Summary & Projects Overview
- **Active Pool Installations & Profiles**: ${pools.length}
- **Total Quotation & Service Bookings**: ${bookings.length}
- **Technician Field Logs & Inspections**: ${tasks.length}
- **Completed Projects / Commissioned Pools**: ${bookings.filter(b => b.status === 'completed').length}

---

## 2. Pool Installation & Renovation Profiles
`;

  pools.forEach((p, idx) => {
    markdown += `
### Project #${idx + 1}: ${p.poolName}
- **Address**: ${p.address}
- **Client**: ${p.customerName}
- **Pool Type**: ${p.poolType.replace(/_/g, ' ')}
- **Dimensions / Volume**: ${p.dimensions || `${p.volumeGallons.toLocaleString()} Gallons`}
- **Filtration**: ${p.filtrationType || '2-Bag Sand Filter with Silica Media'}
- **Pump & Sanitizer**: ${p.sanitizerType || '0.75kW Speck Porpoise Pump'}
- **Notes**: ${p.notes || 'Pump and sand filter included'}
`;
  });

  markdown += `
---

## 3. Quotation Records & Project Schedules
`;

  bookings.forEach((b) => {
    markdown += `
### Booking: ${b.serviceType.replace(/_/g, ' ').toUpperCase()} (${b.scheduledDate})
- **Status**: ${b.status.toUpperCase()}
- **Location**: ${b.address} (${b.suburb || 'Pretoria'})
- **Client**: ${b.customerName} (${b.customerPhone || 'N/A'})
- **Time Window**: ${b.timeSlot || 'Scheduled'}
- **Lead Contractor / Tech**: ${b.assignedTechnicianName || 'Sello Pools Lead'}
- **Price / Estimate**: R ${(b.price || b.quoteAmount || 0).toLocaleString()} ZAR
- **Notes**: ${b.notes || 'Speck pump and sand filter included'}
`;
  });

  markdown += `
---

## 4. Technician Field Logs & Chemical Water Analysis
`;

  tasks.forEach((t) => {
    const chem = t.chemicalReadings || {};
    markdown += `
### Task #${t.id}: ${t.serviceType.replace(/_/g, ' ')} for ${t.customerName}
- **Date**: ${t.scheduledDate} | **Status**: ${t.status.toUpperCase()}
- **Technician**: ${t.technicianName}
- **Water Chemistry Readings**:
  - pH: ${chem.ph ?? 'N/A'} (Target: 7.2 - 7.6)
  - Free Chlorine: ${chem.freeChlorine ?? 'N/A'} ppm (Target: 1.0 - 3.0 ppm)
  - Total Alkalinity: ${chem.totalAlkalinity ?? 'N/A'} ppm (Target: 80 - 120 ppm)
  - Salt Level: ${chem.saltPpm ? `${chem.saltPpm} ppm` : 'N/A'}
  - Water Clarity: ${chem.clarity ? chem.clarity.replace(/_/g, ' ') : 'Checked'}
- **Field Notes**: ${t.notes || 'Routine check and equipment test passed'}
`;
  });

  // HTML format for rich copy or Google Docs opening
  const htmlDocument = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Sello Pools - Master Projects Dossier</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #0a2a3a; max-width: 850px; margin: 40px auto; padding: 20px; }
    h1 { color: #06364d; border-bottom: 3px solid #1bb6d4; padding-bottom: 8px; }
    h2 { color: #0a6f93; margin-top: 30px; border-bottom: 1px solid #cfe3e8; padding-bottom: 4px; }
    h3 { color: #06364d; margin-top: 20px; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; background: #e0f2fe; color: #0369a1; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th, td { border: 1px solid #cfe3e8; padding: 8px 12px; text-align: left; }
    th { background: #f4fafb; font-weight: 600; color: #06364d; }
    .footer { margin-top: 50px; font-size: 12px; color: #496776; text-align: center; }
  </style>
</head>
<body>
  <h1>Sello Pools Projects & Quotations Dossier</h1>
  <p><strong>Export Date:</strong> ${generatedAt} | <strong>Location:</strong> Pretoria & Surrounds</p>
  <p><strong>Standard Spec:</strong> 0.75kW Speck Pump & 2-Bag Sand Filter Always Included</p>
  
  <h2>Project Overview</h2>
  <table>
    <tr><th>Metric</th><th>Count</th></tr>
    <tr><td>Registered Pool Projects</td><td>${pools.length}</td></tr>
    <tr><td>Quotations & Bookings</td><td>${bookings.length}</td></tr>
    <tr><td>Technician Work Orders</td><td>${tasks.length}</td></tr>
  </table>

  <h2>Customer Pool Projects</h2>
  ${pools.map(p => `
    <h3>${p.poolName} <span class="badge">${p.poolType}</span></h3>
    <p><strong>Address:</strong> ${p.address}<br>
    <strong>Client:</strong> ${p.customerName}<br>
    <strong>Dimensions / Specs:</strong> ${p.dimensions || `${p.volumeGallons.toLocaleString()} Gallons`}<br>
    <strong>Filtration & Pump:</strong> ${p.filtrationType || '2-Bag Sand Filter'} / ${p.sanitizerType || '0.75kW Speck Pump'}<br>
    <strong>Notes:</strong> ${p.notes || 'Standard setup'}</p>
  `).join('')}

  <h2>Quotation & Project Schedules</h2>
  <table>
    <tr>
      <th>Date</th>
      <th>Client</th>
      <th>Service</th>
      <th>Status</th>
      <th>Contractor</th>
      <th>Estimate (ZAR)</th>
    </tr>
    ${bookings.map(b => `
      <tr>
        <td>${b.scheduledDate}</td>
        <td>${b.customerName}</td>
        <td>${b.serviceType.replace(/_/g, ' ')}</td>
        <td><span class="badge">${b.status}</span></td>
        <td>${b.assignedTechnicianName || 'Sello Pools Lead'}</td>
        <td>R ${(b.price || b.quoteAmount || 0).toLocaleString()}</td>
      </tr>
    `).join('')}
  </table>

  <div class="footer">Exported from Sello Pools Management Cloud. Ready for Google Drive Docs and Sheets Storage.</div>
</body>
</html>`;

  // 2. CSV for Google Sheets
  const bookingsCsvHeader = 'QuotationID,ScheduledDate,TimeSlot,CustomerName,Address,Suburb,ServiceType,Status,Contractor,PriceZAR,Notes\n';
  const bookingsCsvRows = bookings.map(b => [
    `"${b.id}"`,
    `"${b.scheduledDate}"`,
    `"${b.timeSlot || ''}"`,
    `"${b.customerName}"`,
    `"${b.address.replace(/"/g, '""')}"`,
    `"${b.suburb || ''}"`,
    `"${b.serviceType}"`,
    `"${b.status}"`,
    `"${b.assignedTechnicianName || 'Sello Pools Lead'}"`,
    `"${b.price || b.quoteAmount || 0}"`,
    `"${(b.notes || '').replace(/"/g, '""')}"`,
  ].join(',')).join('\n');
  const bookingsCsv = bookingsCsvHeader + bookingsCsvRows;

  // 3. Tasks & Chemical Log CSV
  const tasksCsvHeader = 'TaskID,Date,Customer,Technician,Status,pH,FreeChlorine,Alkalinity,CalciumHardness,SaltPpm,WaterClarity,Notes\n';
  const tasksCsvRows = tasks.map(t => {
    const c = t.chemicalReadings || {};
    return [
      `"${t.id}"`,
      `"${t.scheduledDate}"`,
      `"${t.customerName}"`,
      `"${t.technicianName}"`,
      `"${t.status}"`,
      `"${c.ph ?? ''}"`,
      `"${c.freeChlorine ?? ''}"`,
      `"${c.totalAlkalinity ?? ''}"`,
      `"${c.calciumHardness ?? ''}"`,
      `"${c.saltPpm ?? ''}"`,
      `"${c.clarity ?? ''}"`,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
    ].join(',');
  }).join('\n');
  const tasksCsv = tasksCsvHeader + tasksCsvRows;

  // 4. Full JSON Backup
  const fullJsonBackup = JSON.stringify({
    appName: 'Sello Pools',
    exportTimestamp: new Date().toISOString(),
    pools,
    bookings,
    tasks,
  }, null, 2);

  return {
    markdownDocument: markdown,
    htmlDocument,
    bookingsCsv,
    tasksCsv,
    fullJsonBackup,
    totalProjects: pools.length + bookings.length,
  };
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
