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
 * Lazily export to PDF (loads the jsPDF chunk on demand).
 */
export async function exportToPDF(result: CalculationResult): Promise<void> {
  const pdf = await import('./pdfExport');
  pdf.exportToPDF(result);
}

/**
 * Lazily export side-by-side comparison report to PDF (loads jsPDF chunk on demand).
 */
export async function exportComparisonPDF(
  resultA: CalculationResult,
  resultB: CalculationResult
): Promise<void> {
  const pdf = await import('./pdfExport');
  pdf.exportComparisonPDF(resultA, resultB);
}
