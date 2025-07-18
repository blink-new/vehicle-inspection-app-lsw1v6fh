import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { InspectionData } from './StorageService';

class PDFReportService {
  private static instance: PDFReportService;

  static getInstance(): PDFReportService {
    if (!PDFReportService.instance) {
      PDFReportService.instance = new PDFReportService();
    }
    return PDFReportService.instance;
  }

  async generateInspectionReport(inspection: InspectionData): Promise<string> {
    try {
      const htmlContent = this.generateHTMLReport(inspection);
      
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
        width: 612,
        height: 792,
      });

      // Move to a permanent location
      const fileName = `inspection_report_${inspection.id}_${Date.now()}.pdf`;
      const permanentUri = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.moveAsync({
        from: uri,
        to: permanentUri,
      });

      return permanentUri;
    } catch (error) {
      console.error('Failed to generate PDF report:', error);
      throw new Error('Failed to generate PDF report');
    }
  }

  async shareReport(pdfUri: string): Promise<void> {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(pdfUri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Share Vehicle Inspection Report',
        });
      } else {
        throw new Error('Sharing is not available on this device');
      }
    } catch (error) {
      console.error('Failed to share report:', error);
      throw new Error('Failed to share report');
    }
  }

  private generateHTMLReport(inspection: InspectionData): string {
    const currentDate = new Date().toLocaleDateString();
    const inspectionDate = new Date(inspection.completedAt).toLocaleDateString();
    
    const statusColor = {
      pass: '#10B981',
      warning: '#F59E0B',
      fail: '#EF4444'
    };

    const statusIcon = {
      pass: '✓',
      warning: '⚠',
      fail: '✗'
    };

    // Generate inspection items HTML
    const inspectionItemsHTML = Object.entries(inspection.inspectionItems)
      .map(([itemName, itemData]) => {
        const defectsHTML = itemData.defects && itemData.defects.length > 0 
          ? `
            <div style="margin-top: 8px;">
              <strong>Defects:</strong>
              ${itemData.defects.map(defect => `
                <div style="margin-left: 16px; margin-top: 4px;">
                  <span style="color: ${defect.severity === 'critical' ? '#EF4444' : defect.severity === 'major' ? '#F59E0B' : '#6B7280'}; font-weight: bold;">
                    ${defect.severity.toUpperCase()}
                  </span>
                  - ${defect.description} (${defect.location})
                </div>
              `).join('')}
            </div>
          ` : '';

        return `
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #E5E7EB;">${itemName}</td>
            <td style="padding: 12px; border-bottom: 1px solid #E5E7EB; text-align: center;">
              <span style="color: ${statusColor[itemData.status]}; font-weight: bold; font-size: 18px;">
                ${statusIcon[itemData.status]}
              </span>
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #E5E7EB;">
              <span style="color: ${statusColor[itemData.status]}; font-weight: bold; text-transform: uppercase;">
                ${itemData.status}
              </span>
              ${itemData.notes ? `<div style="margin-top: 4px; color: #6B7280; font-size: 14px;">${itemData.notes}</div>` : ''}
              ${defectsHTML}
            </td>
          </tr>
        `;
      }).join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Vehicle Inspection Report</title>
          <style>
            body {
              font-family: 'Helvetica', 'Arial', sans-serif;
              margin: 0;
              padding: 20px;
              color: #1F2937;
              line-height: 1.6;
            }
            .header {
              background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);
              color: white;
              padding: 30px;
              margin: -20px -20px 30px -20px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: bold;
            }
            .header p {
              margin: 10px 0 0 0;
              opacity: 0.9;
              font-size: 16px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 30px;
              margin-bottom: 30px;
            }
            .info-section {
              background: #F9FAFB;
              padding: 20px;
              border-radius: 8px;
              border-left: 4px solid #2563EB;
            }
            .info-section h3 {
              margin: 0 0 15px 0;
              color: #2563EB;
              font-size: 18px;
              font-weight: bold;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
              padding-bottom: 8px;
              border-bottom: 1px solid #E5E7EB;
            }
            .info-row:last-child {
              border-bottom: none;
              margin-bottom: 0;
              padding-bottom: 0;
            }
            .info-label {
              font-weight: 600;
              color: #374151;
            }
            .info-value {
              color: #6B7280;
            }
            .summary {
              background: ${statusColor[inspection.overallStatus]}15;
              border: 2px solid ${statusColor[inspection.overallStatus]};
              border-radius: 8px;
              padding: 20px;
              margin-bottom: 30px;
              text-align: center;
            }
            .summary h2 {
              margin: 0 0 10px 0;
              color: ${statusColor[inspection.overallStatus]};
              font-size: 24px;
            }
            .defect-summary {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 15px;
              margin-top: 15px;
            }
            .defect-card {
              background: white;
              padding: 15px;
              border-radius: 6px;
              text-align: center;
              border: 1px solid #E5E7EB;
            }
            .defect-count {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .critical { color: #EF4444; }
            .major { color: #F59E0B; }
            .minor { color: #6B7280; }
            .inspection-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
              background: white;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            .inspection-table th {
              background: #F3F4F6;
              padding: 15px 12px;
              text-align: left;
              font-weight: bold;
              color: #374151;
              border-bottom: 2px solid #E5E7EB;
            }
            .inspection-table td {
              padding: 12px;
              border-bottom: 1px solid #E5E7EB;
              vertical-align: top;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #E5E7EB;
              text-align: center;
              color: #6B7280;
              font-size: 14px;
            }
            .signature-section {
              margin-top: 40px;
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 40px;
            }
            .signature-box {
              border: 1px solid #D1D5DB;
              height: 80px;
              border-radius: 4px;
              position: relative;
            }
            .signature-label {
              position: absolute;
              bottom: -25px;
              left: 0;
              font-size: 14px;
              color: #6B7280;
            }
            @media print {
              body { margin: 0; }
              .header { margin: 0 0 30px 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Vehicle Inspection Report</h1>
            <p>Professional Vehicle Inspection Service</p>
          </div>

          <div class="info-grid">
            <div class="info-section">
              <h3>Vehicle Information</h3>
              <div class="info-row">
                <span class="info-label">VIN:</span>
                <span class="info-value">${inspection.vehicleInfo.vin}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Make:</span>
                <span class="info-value">${inspection.vehicleInfo.make}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Model:</span>
                <span class="info-value">${inspection.vehicleInfo.model}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Year:</span>
                <span class="info-value">${inspection.vehicleInfo.year}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Color:</span>
                <span class="info-value">${inspection.vehicleInfo.color}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Mileage:</span>
                <span class="info-value">${inspection.vehicleInfo.mileage}</span>
              </div>
              <div class="info-row">
                <span class="info-label">License Plate:</span>
                <span class="info-value">${inspection.vehicleInfo.licensePlate}</span>
              </div>
            </div>

            <div class="info-section">
              <h3>Inspector Information</h3>
              <div class="info-row">
                <span class="info-label">Inspector:</span>
                <span class="info-value">${inspection.inspectorInfo.name}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Inspector ID:</span>
                <span class="info-value">${inspection.inspectorInfo.id}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Company:</span>
                <span class="info-value">${inspection.inspectorInfo.company}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Inspection Date:</span>
                <span class="info-value">${inspectionDate}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Report Generated:</span>
                <span class="info-value">${currentDate}</span>
              </div>
              ${inspection.location ? `
              <div class="info-row">
                <span class="info-label">Location:</span>
                <span class="info-value">${inspection.location.address || `${inspection.location.latitude}, ${inspection.location.longitude}`}</span>
              </div>
              ` : ''}
            </div>
          </div>

          <div class="summary">
            <h2>Overall Status: ${inspection.overallStatus.toUpperCase()}</h2>
            <p>Inspection Progress: ${inspection.progress}% Complete</p>
            
            <div class="defect-summary">
              <div class="defect-card">
                <div class="defect-count critical">${inspection.criticalDefects}</div>
                <div>Critical Defects</div>
              </div>
              <div class="defect-card">
                <div class="defect-count major">${inspection.majorDefects}</div>
                <div>Major Defects</div>
              </div>
              <div class="defect-card">
                <div class="defect-count minor">${inspection.minorDefects}</div>
                <div>Minor Defects</div>
              </div>
            </div>
          </div>

          <h3 style="color: #2563EB; margin-bottom: 20px; font-size: 20px;">Detailed Inspection Results</h3>
          
          <table class="inspection-table">
            <thead>
              <tr>
                <th style="width: 40%;">Inspection Item</th>
                <th style="width: 15%; text-align: center;">Status</th>
                <th style="width: 45%;">Details</th>
              </tr>
            </thead>
            <tbody>
              ${inspectionItemsHTML}
            </tbody>
          </table>

          <div class="signature-section">
            <div>
              <div class="signature-box"></div>
              <div class="signature-label">Inspector Signature</div>
            </div>
            <div>
              <div class="signature-box"></div>
              <div class="signature-label">Customer Signature</div>
            </div>
          </div>

          <div class="footer">
            <p><strong>Vehicle Inspection Pro</strong> - Professional Vehicle Inspection Service</p>
            <p>This report was generated on ${currentDate} and contains the complete inspection results for the above vehicle.</p>
            <p>For questions about this report, please contact your inspector or our support team.</p>
          </div>
        </body>
      </html>
    `;
  }

  async generateSummaryReport(inspections: InspectionData[]): Promise<string> {
    try {
      const htmlContent = this.generateSummaryHTML(inspections);
      
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
        width: 612,
        height: 792,
      });

      const fileName = `inspection_summary_${Date.now()}.pdf`;
      const permanentUri = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.moveAsync({
        from: uri,
        to: permanentUri,
      });

      return permanentUri;
    } catch (error) {
      console.error('Failed to generate summary report:', error);
      throw new Error('Failed to generate summary report');
    }
  }

  private generateSummaryHTML(inspections: InspectionData[]): string {
    const currentDate = new Date().toLocaleDateString();
    const totalInspections = inspections.length;
    const passedInspections = inspections.filter(i => i.overallStatus === 'pass').length;
    const warningInspections = inspections.filter(i => i.overallStatus === 'warning').length;
    const failedInspections = inspections.filter(i => i.overallStatus === 'fail').length;
    
    const totalDefects = inspections.reduce((sum, i) => sum + i.totalDefects, 0);
    const totalCritical = inspections.reduce((sum, i) => sum + i.criticalDefects, 0);
    const totalMajor = inspections.reduce((sum, i) => sum + i.majorDefects, 0);
    const totalMinor = inspections.reduce((sum, i) => sum + i.minorDefects, 0);

    const inspectionRows = inspections.map(inspection => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #E5E7EB;">${inspection.vehicleInfo.vin}</td>
        <td style="padding: 8px; border-bottom: 1px solid #E5E7EB;">${inspection.vehicleInfo.make} ${inspection.vehicleInfo.model}</td>
        <td style="padding: 8px; border-bottom: 1px solid #E5E7EB;">${new Date(inspection.completedAt).toLocaleDateString()}</td>
        <td style="padding: 8px; border-bottom: 1px solid #E5E7EB; text-align: center;">
          <span style="color: ${inspection.overallStatus === 'pass' ? '#10B981' : inspection.overallStatus === 'warning' ? '#F59E0B' : '#EF4444'}; font-weight: bold;">
            ${inspection.overallStatus.toUpperCase()}
          </span>
        </td>
        <td style="padding: 8px; border-bottom: 1px solid #E5E7EB; text-align: center;">${inspection.totalDefects}</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Inspection Summary Report</title>
          <style>
            body {
              font-family: 'Helvetica', 'Arial', sans-serif;
              margin: 0;
              padding: 20px;
              color: #1F2937;
              line-height: 1.6;
            }
            .header {
              background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);
              color: white;
              padding: 30px;
              margin: -20px -20px 30px -20px;
              text-align: center;
            }
            .stats-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 20px;
              margin-bottom: 30px;
            }
            .stat-card {
              background: #F9FAFB;
              padding: 20px;
              border-radius: 8px;
              text-align: center;
              border-left: 4px solid #2563EB;
            }
            .stat-number {
              font-size: 32px;
              font-weight: bold;
              color: #2563EB;
              margin-bottom: 5px;
            }
            .summary-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
              background: white;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            .summary-table th {
              background: #F3F4F6;
              padding: 12px 8px;
              text-align: left;
              font-weight: bold;
              color: #374151;
              border-bottom: 2px solid #E5E7EB;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Inspection Summary Report</h1>
            <p>Generated on ${currentDate}</p>
          </div>

          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-number">${totalInspections}</div>
              <div>Total Inspections</div>
            </div>
            <div class="stat-card">
              <div class="stat-number" style="color: #10B981;">${passedInspections}</div>
              <div>Passed</div>
            </div>
            <div class="stat-card">
              <div class="stat-number" style="color: #F59E0B;">${warningInspections}</div>
              <div>Warnings</div>
            </div>
            <div class="stat-card">
              <div class="stat-number" style="color: #EF4444;">${failedInspections}</div>
              <div>Failed</div>
            </div>
          </div>

          <table class="summary-table">
            <thead>
              <tr>
                <th>VIN</th>
                <th>Vehicle</th>
                <th>Date</th>
                <th style="text-align: center;">Status</th>
                <th style="text-align: center;">Defects</th>
              </tr>
            </thead>
            <tbody>
              ${inspectionRows}
            </tbody>
          </table>
        </body>
      </html>
    `;
  }
}

export default PDFReportService;