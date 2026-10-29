import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CalculationResult } from '../types/loan';
import { formatCurrency, getCurrency } from './currencies';

/**
 * Export schedule to CSV
 */
export function exportToCSV(result: CalculationResult): void {
  const {
    input,
    schedule,
    totalPrincipal,
    totalInterest,
    totalCost,
    periodicPayment,
    effectiveInterestRate,
  } = result;
  const currency = getCurrency(input.currencyCode);

  const metaRows = [
    ['LoanMatrix Amortization Schedule'],
    ['Generated On', new Date().toLocaleDateString()],
    ['Loan Title', input.title || 'Loan Calculation'],
    ['Structure', input.structure === 'fixed_addon' ? 'Fixed Add-On Rate' : 'Diminishing Balance'],
    ['Principal', `${currency.symbol} ${input.principal.toLocaleString()}`],
    ['Interest Rate', `${input.interestRate}% (${input.ratePeriod})`],
    ['Effective Interest Rate (EIR / APR)', `${effectiveInterestRate.toFixed(3)}%`],
    ['Term', `${input.termValue} ${input.termUnit}`],
    ['Payment Interval', input.paymentInterval],
    ['Periodic Payment', `${currency.symbol} ${periodicPayment.toFixed(2)}`],
    ['Total Interest', `${currency.symbol} ${totalInterest.toFixed(2)}`],
    ['Total Repayment', `${currency.symbol} ${totalCost.toFixed(2)}`],
    [],
    [
      'Period',
      'Payment Date',
      'Payment',
      'Principal',
      'Interest',
      'Extra Payment',
      'Total Paid',
      'Remaining Balance',
      'Cumulative Principal',
      'Cumulative Interest',
    ],
  ];

  const dataRows = schedule.map((row) => [
    row.period,
    row.date,
    row.payment.toFixed(2),
    row.principal.toFixed(2),
    row.interest.toFixed(2),
    row.extraPayment.toFixed(2),
    row.totalPayment.toFixed(2),
    row.remainingBalance.toFixed(2),
    row.cumulativePrincipal.toFixed(2),
    row.cumulativeInterest.toFixed(2),
  ]);

  const allRows = [...metaRows, ...dataRows];
  const csvContent = allRows
    .map((e) => e.map((val) => `"${String(val ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `${(input.title || 'loan-schedule').toLowerCase().replace(/\s+/g, '-')}-amortization.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export to Excel (Tab-delimited XML / CSV format with full formatting)
 */
export function exportToExcel(result: CalculationResult): void {
  const {
    input,
    schedule,
    totalPrincipal,
    totalInterest,
    totalCost,
    periodicPayment,
    effectiveInterestRate,
  } = result;
  const currency = getCurrency(input.currencyCode);

  let xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Header">
   <Font ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#1E3A8A" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center"/>
  </Style>
  <Style ss:ID="Title">
   <Font ss:Size="14" ss:Bold="1" ss:Color="#0F172A"/>
  </Style>
  <Style ss:ID="Currency">
   <NumberFormat ss:Format="#,##0.00"/>
   <Alignment ss:Horizontal="Right"/>
  </Style>
  <Style ss:ID="Percent">
   <NumberFormat ss:Format="0.000%"/>
   <Alignment ss:Horizontal="Right"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Amortization Schedule">
  <Table>
   <Row><Cell ss:StyleID="Title"><Data ss:Type="String">LoanMatrix - Amortization Schedule</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">Loan Title: ${input.title || 'Loan'}</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">Loan Structure: ${input.structure === 'fixed_addon' ? 'Fixed Add-On Rate' : 'Diminishing Balance'}</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">Principal: ${currency.symbol} ${totalPrincipal.toLocaleString()}</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">Rate: ${input.interestRate}% (${input.ratePeriod}) | EIR: ${effectiveInterestRate.toFixed(3)}%</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">Term: ${input.termValue} ${input.termUnit} | Payment: ${currency.symbol} ${periodicPayment.toFixed(2)}</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">Total Interest: ${currency.symbol} ${totalInterest.toFixed(2)} | Total Cost: ${currency.symbol} ${totalCost.toFixed(2)}</Data></Cell></Row>
   <Row></Row>
   <Row ss:StyleID="Header">
    <Cell><Data ss:Type="String">Period</Data></Cell>
    <Cell><Data ss:Type="String">Payment Date</Data></Cell>
    <Cell><Data ss:Type="String">Payment (${currency.symbol})</Data></Cell>
    <Cell><Data ss:Type="String">Principal (${currency.symbol})</Data></Cell>
    <Cell><Data ss:Type="String">Interest (${currency.symbol})</Data></Cell>
    <Cell><Data ss:Type="String">Extra Payment (${currency.symbol})</Data></Cell>
    <Cell><Data ss:Type="String">Total Paid (${currency.symbol})</Data></Cell>
    <Cell><Data ss:Type="String">Remaining Balance (${currency.symbol})</Data></Cell>
    <Cell><Data ss:Type="String">Cum. Principal (${currency.symbol})</Data></Cell>
    <Cell><Data ss:Type="String">Cum. Interest (${currency.symbol})</Data></Cell>
   </Row>`;

  schedule.forEach((row) => {
    xml += `
   <Row>
    <Cell><Data ss:Type="Number">${row.period}</Data></Cell>
    <Cell><Data ss:Type="String">${row.date}</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">${row.payment.toFixed(2)}</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">${row.principal.toFixed(2)}</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">${row.interest.toFixed(2)}</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">${row.extraPayment.toFixed(2)}</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">${row.totalPayment.toFixed(2)}</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">${row.remainingBalance.toFixed(2)}</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">${row.cumulativePrincipal.toFixed(2)}</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">${row.cumulativeInterest.toFixed(2)}</Data></Cell>
   </Row>`;
  });

  xml += `
  </Table>
 </Worksheet>
</Workbook>`;

  const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `${(input.title || 'loan-schedule').toLowerCase().replace(/\s+/g, '-')}-amortization.xls`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export to PDF
 */
export function exportToPDF(result: CalculationResult): void {
  const {
    input,
    schedule,
    totalPrincipal,
    totalInterest,
    totalCost,
    periodicPayment,
    effectiveInterestRate,
    payoffDate,
  } = result;
  const currency = getCurrency(input.currencyCode);

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Header band
  doc.setFillColor(30, 58, 138); // Deep Navy
  doc.rect(0, 0, 210, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('LoanMatrix Amortization Statement', 14, 13);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Official Repayment Schedule · Generated ${new Date().toLocaleDateString()}`, 14, 21);

  // Summary box
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 34, 182, 38, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(input.title || 'Loan Summary', 18, 41);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);

  const col1X = 18;
  const col2X = 80;
  const col3X = 142;

  // Row 1
  doc.text(
    `Structure: ${input.structure === 'fixed_addon' ? 'Fixed Add-On' : 'Diminishing Balance'}`,
    col1X,
    48
  );
  doc.text(`Principal: ${currency.symbol} ${totalPrincipal.toLocaleString()}`, col2X, 48);
  doc.text(
    `Periodic Payment: ${currency.symbol} ${periodicPayment.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
    col3X,
    48
  );

  // Row 2
  const rateLabel =
    input.structure === 'fixed_addon' && input.ratePeriod === 'monthly'
      ? `Monthly Add-On: ${input.interestRate.toFixed(2)}%`
      : `Interest Rate: ${input.interestRate.toFixed(2)}%`;
  doc.text(rateLabel, col1X, 55);
  doc.text(`Effective Rate (EIR): ${effectiveInterestRate.toFixed(3)}%`, col2X, 55);
  doc.text(
    `Total Interest: ${currency.symbol} ${totalInterest.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
    col3X,
    55
  );

  // Row 3
  doc.text(`Term: ${input.termValue} ${input.termUnit} (${schedule.length} payments)`, col1X, 62);
  doc.text(`Payment Interval: ${input.paymentInterval.replace('_', ' ')}`, col2X, 62);
  doc.text(
    `Total Loan Cost: ${currency.symbol} ${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
    col3X,
    62
  );

  doc.text(`Estimated Payoff Date: ${payoffDate}`, col1X, 68);

  // Table
  const tableData = schedule.map((row) => [
    row.period.toString(),
    row.date,
    `${currency.symbol} ${row.payment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    `${currency.symbol} ${row.principal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    `${currency.symbol} ${row.interest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    row.extraPayment > 0
      ? `${currency.symbol} ${row.extraPayment.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
      : '-',
    `${currency.symbol} ${row.remainingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  ]);

  autoTable(doc, {
    startY: 76,
    head: [['#', 'Date', 'Payment', 'Principal', 'Interest', 'Extra', 'Balance']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 58, 138],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59],
      cellPadding: 1.5,
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { halign: 'center', cellWidth: 24 },
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'right' },
      5: { halign: 'right' },
      6: { halign: 'right' },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    didDrawPage: (data) => {
      // Footer page numbering
      const str = `Page ${doc.getNumberOfPages()} · LoanMatrix`;
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(str, 210 - 14 - doc.getTextWidth(str), 297 - 8);
    },
  });

  doc.save(
    `${(input.title || 'loan-schedule').toLowerCase().replace(/\s+/g, '-')}-amortization.pdf`
  );
}

/**
 * Export side-by-side comparison report to PDF
 */
export function exportComparisonPDF(resultA: CalculationResult, resultB: CalculationResult): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const currencyA = getCurrency(resultA.input.currencyCode);
  const currencyB = getCurrency(resultB.input.currencyCode);

  // Header band
  doc.setFillColor(30, 58, 138); // Deep Navy
  doc.rect(0, 0, 210, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('LoanMatrix Side-by-Side Comparison', 14, 13);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Comparative Financial Analysis · Generated ${new Date().toLocaleDateString()}`, 14, 21);

  // Comparison metrics table
  const interestDiff = resultA.totalInterest - resultB.totalInterest;
  const paymentDiff = resultA.periodicPayment - resultB.periodicPayment;
  const costDiff = resultA.totalCost - resultB.totalCost;

  const comparisonData = [
    [
      'Loan Identifier / Title',
      resultA.input.title || 'Calculation A',
      resultB.input.title || 'Calculation B',
      '-',
    ],
    [
      'Structure',
      resultA.input.structure === 'fixed_addon' ? 'Fixed Add-On (Flat)' : 'Diminishing Balance',
      resultB.input.structure === 'fixed_addon' ? 'Fixed Add-On (Flat)' : 'Diminishing Balance',
      '-',
    ],
    [
      'Principal Amount',
      `${currencyA.symbol} ${resultA.totalPrincipal.toLocaleString()}`,
      `${currencyB.symbol} ${resultB.totalPrincipal.toLocaleString()}`,
      `${currencyA.symbol} ${(resultA.totalPrincipal - resultB.totalPrincipal).toLocaleString()}`,
    ],
    [
      'Stated Interest Rate',
      `${resultA.input.interestRate}% (${resultA.input.ratePeriod})`,
      `${resultB.input.interestRate}% (${resultB.input.ratePeriod})`,
      `${(resultA.input.interestRate - resultB.input.interestRate).toFixed(2)}%`,
    ],
    [
      'Effective Interest Rate (EIR)',
      `${resultA.effectiveInterestRate.toFixed(3)}%`,
      `${resultB.effectiveInterestRate.toFixed(3)}%`,
      `${(resultA.effectiveInterestRate - resultB.effectiveInterestRate).toFixed(3)}%`,
    ],
    [
      'Term Duration',
      `${resultA.input.termValue} ${resultA.input.termUnit}`,
      `${resultB.input.termValue} ${resultB.input.termUnit}`,
      '-',
    ],
    [
      'Payment Interval',
      resultA.input.paymentInterval.replace('_', ' '),
      resultB.input.paymentInterval.replace('_', ' '),
      '-',
    ],
    [
      'Periodic Payment',
      `${currencyA.symbol} ${resultA.periodicPayment.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      `${currencyB.symbol} ${resultB.periodicPayment.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      `${paymentDiff >= 0 ? '+' : ''}${currencyA.symbol} ${paymentDiff.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
    ],
    [
      'Total Interest Expense',
      `${currencyA.symbol} ${resultA.totalInterest.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      `${currencyB.symbol} ${resultB.totalInterest.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      `${interestDiff >= 0 ? '+' : ''}${currencyA.symbol} ${interestDiff.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
    ],
    [
      'Total Loan Cost',
      `${currencyA.symbol} ${resultA.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      `${currencyB.symbol} ${resultB.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      `${costDiff >= 0 ? '+' : ''}${currencyA.symbol} ${costDiff.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
    ],
    [
      'Total Payment Periods',
      resultA.totalPaymentPeriods.toString(),
      resultB.totalPaymentPeriods.toString(),
      `${resultA.totalPaymentPeriods - resultB.totalPaymentPeriods}`,
    ],
    ['Projected Payoff Date', resultA.payoffDate, resultB.payoffDate, '-'],
  ];

  autoTable(doc, {
    startY: 36,
    head: [['Metric / Parameter', 'Calculation A', 'Calculation B', 'Variance (A - B)']],
    body: comparisonData,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 58, 138],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    bodyStyles: {
      fontSize: 8,
      cellPadding: 2,
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { halign: 'right', cellWidth: 46 },
      2: { halign: 'right', cellWidth: 46 },
      3: { halign: 'right', cellWidth: 46 },
    },
  });

  doc.save('loanmatrix-comparison-report.pdf');
}
