import { jsPDF } from 'jspdf';
import { StructuredBISResponse } from './llm';
import { getEstimatesForStandard } from './estimates';

export function exportComplianceReportPdf(data: StructuredBISResponse, titleOverride?: string) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 20) {
      addFooter();
      doc.addPage();
      y = margin + 6;
      addHeaderStripe();
    }
  };

  const addHeaderStripe = () => {
    doc.setFillColor(10, 17, 40); // Navy #0A1128
    doc.rect(0, 0, pageWidth, 4, 'F');
    doc.setFillColor(201, 148, 58); // Gold #C9943A
    doc.rect(0, 4, pageWidth, 1, 'F');
  };

  const addFooter = () => {
    const pageNum = doc.getNumberOfPages();
    doc.setFont('Helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);

    const disclaimer = 'AI-generated guidance. Verify all standards & requirements with official BIS channels (www.bis.gov.in).';
    doc.text(disclaimer, margin, pageHeight - 10);

    doc.setFont('Helvetica', 'normal');
    doc.text(`Page ${pageNum}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
  };

  addHeaderStripe();
  y = 12;

  // Title Banner Card
  doc.setFillColor(10, 17, 40); // Dark Navy #0A1128
  doc.roundedRect(margin, y, contentWidth, 26, 3, 3, 'F');

  // Gold accent bar inside banner
  doc.setFillColor(201, 148, 58); // Gold #C9943A
  doc.rect(margin + 4, y + 4, 3, 18, 'F');

  doc.setTextColor(201, 148, 58);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('BHARAT — BIS COMPLIANCE ASSISTANT', margin + 11, y + 9);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  const titleText = titleOverride || (data.responseType === 'label_analysis' ? 'Packaging & Label Compliance Audit Report' : 'Technical BIS Compliance Report');
  doc.text(titleText, margin + 11, y + 18);

  y += 32;

  // Metadata Box (Timestamp + Identified Product)
  doc.setFillColor(245, 247, 250);
  doc.setDrawColor(226, 220, 208);
  doc.roundedRect(margin, y, contentWidth, 18, 2, 2, 'FD');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(208, 74, 12); // Accent #D04A0C
  doc.text('PRODUCT / QUERY:', margin + 4, y + 6);

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(27, 42, 74); // Navy #1B2A4A
  const prodName = data.identified_product || 'General BIS Query';
  doc.text(prodName.length > 48 ? prodName.substring(0, 46) + '...' : prodName, margin + 4, y + 12);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  const timeStr = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  doc.text(`Generated: ${timeStr}`, pageWidth - margin - 4, y + 12, { align: 'right' });

  y += 24;

  // 1. Summary
  checkPageBreak(25);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(27, 42, 74);
  doc.text('1. EXECUTIVE SUMMARY', margin, y);
  y += 5;

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(58, 69, 98);
  const summaryLines = doc.splitTextToSize(data.summary || 'No summary available.', contentWidth);
  doc.text(summaryLines, margin, y);
  y += summaryLines.length * 4.5 + 6;

  // 2. Mandatory Certification Route
  if (data.certification_required) {
    checkPageBreak(20);
    doc.setFillColor(253, 240, 235);
    doc.setDrawColor(208, 74, 12);
    doc.roundedRect(margin, y, contentWidth, 14, 2, 2, 'FD');

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(208, 74, 12);
    doc.text('2. MANDATORY CERTIFICATION ROUTE', margin + 4, y + 5);

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(27, 42, 74);
    doc.text(data.certification_required, margin + 4, y + 10.5);

    y += 20;
  }

  // 3. Applicable Standards
  if (data.applicable_standards && data.applicable_standards.length > 0) {
    checkPageBreak(25);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(27, 42, 74);
    doc.text('3. APPLICABLE INDIAN STANDARDS (IS CODES)', margin, y);
    y += 6;

    for (const std of data.applicable_standards) {
      const whyLines = doc.splitTextToSize(std.why || '', contentWidth - 8);
      const boxHeight = 12 + whyLines.length * 4;
      checkPageBreak(boxHeight + 4);

      doc.setFillColor(250, 251, 253);
      doc.setDrawColor(226, 220, 208);
      doc.roundedRect(margin, y, contentWidth, boxHeight, 2, 2, 'FD');

      doc.setFillColor(27, 42, 74);
      doc.roundedRect(margin + 3, y + 3, 28, 5, 1, 1, 'F');
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text(std.code, margin + 5, y + 6.5);

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(27, 42, 74);
      const titleLines = doc.splitTextToSize(std.title, contentWidth - 36);
      doc.text(titleLines[0] || '', margin + 34, y + 6.5);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(whyLines, margin + 4, y + 12);

      y += boxHeight + 4;
    }
    y += 2;
  }

  // 3.5 Estimated Cost & Timeline Summary
  if (data.found_in_context && data.responseType !== 'non_bis_regulated' && (data.applicable_standards && data.applicable_standards.length > 0)) {
    const stdCode = data.applicable_standards[0]?.code || data.identified_product;
    const est = getEstimatesForStandard(stdCode);

    checkPageBreak(30);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(27, 42, 74);
    doc.text('ESTIMATED CERTIFICATION COST & TIMELINE', margin, y);
    y += 6;

    doc.setFillColor(250, 251, 253);
    doc.setDrawColor(201, 148, 58);
    doc.roundedRect(margin, y, contentWidth, 22, 2, 2, 'FD');

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(27, 42, 74);
    doc.text(`Duration: ${est.duration}`, margin + 4, y + 6);
    doc.setTextColor(208, 74, 12);
    doc.text(`Lab Testing: ${est.testingCost}`, margin + 4, y + 11);
    doc.setTextColor(16, 185, 129);
    doc.text(`BIS Fees: ${est.applicationFee}`, margin + 4, y + 16);

    doc.setFont('Helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`${est.sourceNote} | ${est.disclaimer}`, margin + 4, y + 20);

    y += 26;
  }

  // 4. Testing Requirements / Label Checklist / Action Roadmap
  if (data.testing_requirements && data.testing_requirements.length > 0) {
    checkPageBreak(25);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(27, 42, 74);
    doc.text('4. MANDATORY LAB TESTING REQUIREMENTS', margin, y);
    y += 6;

    for (let i = 0; i < data.testing_requirements.length; i++) {
      const req = data.testing_requirements[i];
      const reqLines = doc.splitTextToSize(`${i + 1}. ${req}`, contentWidth - 4);
      checkPageBreak(reqLines.length * 4.5 + 2);
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(58, 69, 98);
      doc.text(reqLines, margin + 2, y);
      y += reqLines.length * 4.5 + 2;
    }
    y += 4;
  }

  if (data.label_checklist && data.label_checklist.length > 0) {
    checkPageBreak(25);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(27, 42, 74);
    doc.text('MANDATORY LABEL & PACKAGING CHECKLIST', margin, y);
    y += 6;

    for (const item of data.label_checklist) {
      const detailLines = doc.splitTextToSize(`${item.item}: ${item.detail}`, contentWidth - 25);
      const rowHeight = Math.max(8, detailLines.length * 4 + 2);
      checkPageBreak(rowHeight + 2);

      const statusColor = item.status === 'pass' ? [16, 185, 129] : item.status === 'fail' ? [208, 74, 12] : [201, 148, 58];
      doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
      doc.roundedRect(margin, y, 18, 5, 1, 1, 'F');
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(255, 255, 255);
      doc.text(item.status.toUpperCase(), margin + 2, y + 3.8);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(58, 69, 98);
      doc.text(detailLines, margin + 22, y + 3.8);

      y += rowHeight + 2;
    }
    y += 4;
  }

  if (data.action_checklist && data.action_checklist.length > 0) {
    checkPageBreak(25);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(27, 42, 74);
    doc.text('ACTION ROADMAP & COMPLIANCE STEPS', margin, y);
    y += 6;

    for (const step of data.action_checklist) {
      const stepText = `Step ${step.step}: ${step.action} - ${step.detail}`;
      const stepLines = doc.splitTextToSize(stepText, contentWidth - 4);
      checkPageBreak(stepLines.length * 4.5 + 2);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(58, 69, 98);
      doc.text(stepLines, margin + 2, y);
      y += stepLines.length * 4.5 + 2;
    }
    y += 4;
  }

  // 5. Sources
  if (data.sources && data.sources.length > 0) {
    checkPageBreak(20);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(27, 42, 74);
    doc.text('CITED OFFICIAL SOURCES & PORTALS', margin, y);
    y += 6;

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(208, 74, 12);
    for (const src of data.sources) {
      checkPageBreak(5);
      doc.text(`• ${src}`, margin + 2, y);
      y += 4.5;
    }
    y += 4;
  }

  addFooter();

  const cleanName = (data.identified_product || 'BIS_Compliance_Report')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .substring(0, 30);
  doc.save(`${cleanName}_Report.pdf`);
}
