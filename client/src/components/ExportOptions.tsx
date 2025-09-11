import { useState } from 'react';
import { Download, FileText, Code, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ExportOptionsProps {
  analysisData?: any;
  repositoryUrl?: string;
}

export default function ExportOptions({ analysisData, repositoryUrl }: ExportOptionsProps) {
  const [exportingType, setExportingType] = useState<string | null>(null);

  // todo: remove mock data when integrating with real API
  const mockData = {
    repository: repositoryUrl || 'https://github.com/example/repo',
    analysis: analysisData || { dora: {}, contributors: [], health: {} },
    timestamp: new Date().toISOString(),
  };

  const handleExport = async (type: 'json' | 'html' | 'csv') => {
    setExportingType(type);
    console.log(`Exporting data as ${type.toUpperCase()}...`);
    
    // Simulate export delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      if (type === 'json') {
        const dataStr = JSON.stringify(mockData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const exportFileDefaultName = 'github-analysis.json';
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
      } else if (type === 'html') {
        // Generate HTML report (simplified version)
        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>GitHub Analysis Report</title>
          <style>
            body { font-family: system-ui; margin: 40px; }
            .metric { padding: 20px; margin: 10px 0; border: 1px solid #ddd; border-radius: 8px; }
          </style>
        </head>
        <body>
          <h1>GitHub Repository Analysis</h1>
          <div class="metric">
            <h2>Repository: ${mockData.repository}</h2>
            <p>Generated: ${new Date().toLocaleString()}</p>
          </div>
        </body>
        </html>
        `;
        
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const linkElement = document.createElement('a');
        linkElement.href = url;
        linkElement.download = 'github-analysis.html';
        linkElement.click();
        URL.revokeObjectURL(url);
      } else if (type === 'csv') {
        const csvContent = `Repository,Analysis Date,DORA Score,Contributors\n${mockData.repository},${new Date().toLocaleDateString()},85,8`;
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const linkElement = document.createElement('a');
        linkElement.href = url;
        linkElement.download = 'github-analysis.csv';
        linkElement.click();
        URL.revokeObjectURL(url);
      }
      
      console.log(`${type.toUpperCase()} export completed successfully`);
    } catch (error) {
      console.error(`Export failed:`, error);
    } finally {
      setExportingType(null);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <Download className="h-6 w-6 text-primary" />
        <h3 className="text-xl font-semibold">Export Analysis</h3>
        <Badge variant="secondary">3 formats available</Badge>
      </div>
      
      <p className="text-muted-foreground mb-6">
        Download your GitHub repository analysis in your preferred format
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button
          variant="outline"
          onClick={() => handleExport('json')}
          disabled={exportingType !== null}
          className="h-auto p-4 flex flex-col items-center gap-2 hover-elevate"
          data-testid="button-export-json"
        >
          {exportingType === 'json' ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <Code className="h-6 w-6" />
          )}
          <div className="text-center">
            <div className="font-semibold">JSON Data</div>
            <div className="text-xs text-muted-foreground">
              Raw analysis data for integration
            </div>
          </div>
        </Button>
        
        <Button
          variant="outline"
          onClick={() => handleExport('html')}
          disabled={exportingType !== null}
          className="h-auto p-4 flex flex-col items-center gap-2 hover-elevate"
          data-testid="button-export-html"
        >
          {exportingType === 'html' ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <FileText className="h-6 w-6" />
          )}
          <div className="text-center">
            <div className="font-semibold">HTML Report</div>
            <div className="text-xs text-muted-foreground">
              Formatted report for sharing
            </div>
          </div>
        </Button>
        
        <Button
          variant="outline"
          onClick={() => handleExport('csv')}
          disabled={exportingType !== null}
          className="h-auto p-4 flex flex-col items-center gap-2 hover-elevate"
          data-testid="button-export-csv"
        >
          {exportingType === 'csv' ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <Download className="h-6 w-6" />
          )}
          <div className="text-center">
            <div className="font-semibold">CSV Data</div>
            <div className="text-xs text-muted-foreground">
              Spreadsheet-compatible format
            </div>
          </div>
        </Button>
      </div>
      
      <div className="mt-4 p-3 rounded-lg bg-muted/50">
        <p className="text-sm text-muted-foreground">
          <strong>Note:</strong> All exports include complete analysis data, contributor statistics, 
          DORA metrics, and repository health assessment.
        </p>
      </div>
    </Card>
  );
}