import { Participant, ScanLog } from '../types';

/**
 * Utility to convert an array of objects to CSV and trigger a real browser download.
 */
export function downloadCsv(filename: string, headers: string[], rows: (string | number | boolean)[][]) {
  const escapeCell = (val: string | number | boolean | null | undefined): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvContent = [
    headers.map(escapeCell).join(','),
    ...rows.map((row) => row.map(escapeCell).join(',')),
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportAttendanceReport(participants: Participant[]) {
  const headers = [
    'Participant ID',
    'Name',
    'Department',
    'Category',
    'Semester',
    'Phone',
    'Email',
    'QR Status',
    'Current State',
    'Entry Count',
    'Exit Count',
    'Registered At',
  ];

  const rows = participants.map((p) => [
    p.participantId,
    p.name,
    p.department,
    p.category,
    p.semester || 'N/A',
    p.phone,
    p.email || '',
    p.qrStatus,
    p.state,
    p.entryCount,
    p.exitCount,
    new Date(p.registeredAt).toLocaleString(),
  ]);

  const dateStr = new Date().toISOString().split('T')[0];
  downloadCsv(`VenuPass-Attendance-Report-${dateStr}.csv`, headers, rows);
}

export function exportScanLogsReport(logs: ScanLog[]) {
  const headers = [
    'Log ID',
    'Timestamp',
    'Participant ID',
    'Name',
    'Department',
    'Gate',
    'Direction',
    'Result',
    'Reason',
    'Suspicious Flag',
  ];

  const rows = logs.map((l) => [
    l.id,
    new Date(l.timestamp).toLocaleString(),
    l.participantId,
    l.participantName,
    l.department,
    l.gate,
    l.direction,
    l.result,
    l.reason || 'N/A',
    l.suspicious ? 'YES' : 'NO',
  ]);

  const dateStr = new Date().toISOString().split('T')[0];
  downloadCsv(`VenuPass-ScanLogs-Report-${dateStr}.csv`, headers, rows);
}

export function exportEmergencyHeadcountReport(insideParticipants: Participant[]) {
  const headers = [
    'Participant ID',
    'Name',
    'Department',
    'Category',
    'Semester',
    'Phone',
    'Status Inside',
    'Last Gate Entry',
  ];

  const rows = insideParticipants.map((p) => {
    const lastIn = p.history.find((h) => h.direction === 'IN' && h.allowed);
    return [
      p.participantId,
      p.name,
      p.department,
      p.category,
      p.semester || 'N/A',
      p.phone,
      'VERIFIED INSIDE',
      lastIn ? `${lastIn.gate} (${new Date(lastIn.timestamp).toLocaleTimeString()})` : 'N/A',
    ];
  });

  const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
  downloadCsv(`VenuPass-Emergency-Headcount-${dateStr}.csv`, headers, rows);
}

export interface PassTicketMetadata {
  name?: string;
  department?: string;
  category?: string;
  eventName?: string;
  venue?: string;
  date?: string;
}

/**
 * Converts the rendered SVG QR element into a true high-res PNG and triggers download.
 * Generates VenuPass-{participantId}.png as an official, beautifully formatted digital event pass ticket.
 */
export function downloadQrSvgAsPng(
  elementOrId: string,
  participantId: string,
  meta?: PassTicketMetadata
) {
  let target = document.getElementById(elementOrId);
  let svgElement: SVGElement | null = null;

  if (target) {
    if (target.tagName.toLowerCase() === 'svg') {
      svgElement = target as unknown as SVGElement;
    } else {
      svgElement = target.querySelector('svg');
    }
  }

  if (!svgElement) {
    // Search by query selector across the DOM
    svgElement =
      document.querySelector(`#${elementOrId} svg`) ||
      document.querySelector(`svg#${elementOrId}`) ||
      document.querySelector(`[id*="${participantId}"] svg`) ||
      document.querySelector('svg');
  }

  if (!svgElement) {
    console.error(`SVG element #${elementOrId} not found in DOM`);
    return;
  }

  // Clone SVG to safely attach xmlns and explicit pixel dimensions
  const clonedSvg = svgElement.cloneNode(true) as SVGElement;
  clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  
  const qrPixelSize = 320;
  clonedSvg.setAttribute('width', `${qrPixelSize}`);
  clonedSvg.setAttribute('height', `${qrPixelSize}`);

  const svgData = new XMLSerializer().serializeToString(clonedSvg);
  const qrImg = new Image();
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const qrUrl = URL.createObjectURL(svgBlob);

  // Attempt to load university logo
  const logoImg = new Image();
  logoImg.src = '/silver_oak_logo.png';

  let hasExported = false;
  const renderAndExport = () => {
    if (hasExported) return;
    hasExported = true;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High-resolution ticket dimensions: 480px width, 680px height
    const width = 480;
    const height = 680;
    canvas.width = width;
    canvas.height = height;

    // 1. Clean white background with subtle border
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#DDDCD6';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, width - 2, height - 2);

    // 2. Header: Silver Oak University Logo
    let headerY = 24;
    if (logoImg.complete && logoImg.naturalWidth > 0) {
      const logoAspect = logoImg.naturalWidth / logoImg.naturalHeight;
      const targetLogoHeight = 38;
      const targetLogoWidth = targetLogoHeight * logoAspect;
      ctx.drawImage(
        logoImg,
        (width - targetLogoWidth) / 2,
        headerY,
        targetLogoWidth,
        targetLogoHeight
      );
      headerY += targetLogoHeight + 14;
    } else {
      ctx.font = 'bold 16px "Space Grotesk", sans-serif';
      ctx.fillStyle = '#8B1E1E';
      ctx.textAlign = 'center';
      ctx.fillText('SILVER OAK UNIVERSITY', width / 2, headerY + 16);
      headerY += 28;
    }

    // Divider line
    ctx.strokeStyle = '#EAE8E1';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(24, headerY);
    ctx.lineTo(width - 24, headerY);
    ctx.stroke();
    headerY += 16;

    // 3. Event Details
    const eventTitle = meta?.eventName || 'National Tech & Innovation Summit 2026';
    ctx.font = 'bold 14px "Space Grotesk", Inter, sans-serif';
    ctx.fillStyle = '#161616';
    ctx.textAlign = 'center';
    ctx.fillText(eventTitle, width / 2, headerY);
    headerY += 18;

    const eventSub = `${meta?.date || '2026-09-12'} • ${meta?.venue || 'Innovation Dome & Convention Arena'}`;
    ctx.font = '11px Inter, sans-serif';
    ctx.fillStyle = '#6F6F6A';
    ctx.fillText(eventSub, width / 2, headerY);
    headerY += 20;

    // 4. Ticket Perforation Line
    ctx.strokeStyle = '#DDDCD6';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(24, headerY);
    ctx.lineTo(width - 24, headerY);
    ctx.stroke();
    ctx.setLineDash([]);
    headerY += 22;

    // 5. Participant Info Block
    if (meta?.name) {
      ctx.font = 'bold 18px Inter, sans-serif';
      ctx.fillStyle = '#161616';
      ctx.fillText(meta.name, width / 2, headerY);
      headerY += 20;
    }

    // Participant ID & Department
    const idText = `PASS ID: ${participantId}`;
    ctx.font = 'bold 13px monospace';
    ctx.fillStyle = '#E86A00';
    ctx.fillText(idText, width / 2, headerY);
    headerY += 18;

    if (meta?.department) {
      ctx.font = '12px Inter, sans-serif';
      ctx.fillStyle = '#6F6F6A';
      ctx.fillText(meta.department, width / 2, headerY);
      headerY += 20;
    } else {
      headerY += 6;
    }

    // 6. QR Code in Center with Crisp Quiet Zone
    const qrDrawSize = 220;
    const qrX = (width - qrDrawSize) / 2;
    const qrY = headerY;

    // Quiet zone box
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(qrX - 10, qrY - 10, qrDrawSize + 20, qrDrawSize + 20);
    ctx.strokeStyle = '#DDDCD6';
    ctx.lineWidth = 1;
    ctx.strokeRect(qrX - 10, qrY - 10, qrDrawSize + 20, qrDrawSize + 20);

    // Draw QR code image
    ctx.drawImage(qrImg, qrX, qrY, qrDrawSize, qrDrawSize);

    // 7. Security Footer
    const footerY = qrY + qrDrawSize + 36;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillStyle = '#161616';
    ctx.fillText('OFFICIAL EVENT ACCESS PASS • VENUPASS', width / 2, footerY);

    ctx.font = '10px Inter, sans-serif';
    ctx.fillStyle = '#8A8F95';
    ctx.fillText('Present this pass at gate entrance & exit points for digital scan verification', width / 2, footerY + 16);

    URL.revokeObjectURL(qrUrl);

    try {
      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `VenuPass-${participantId}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (err) {
      console.error('Canvas export error:', err);
    }
  };

  qrImg.onload = () => {
    if (logoImg.complete) {
      renderAndExport();
    } else {
      logoImg.onload = () => renderAndExport();
      logoImg.onerror = () => renderAndExport();
      setTimeout(renderAndExport, 200);
    }
  };

  qrImg.onerror = (err) => {
    console.warn('Direct Image raster failed, falling back to SVG blob download:', err);
    URL.revokeObjectURL(qrUrl);
    const fallbackBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const fallbackUrl = URL.createObjectURL(fallbackBlob);
    const link = document.createElement('a');
    link.href = fallbackUrl;
    link.download = `VenuPass-${participantId}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(fallbackUrl);
  };

  qrImg.src = qrUrl;
}
