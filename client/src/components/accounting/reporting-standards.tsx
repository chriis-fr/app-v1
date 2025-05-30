import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, 
  Globe, 
  Settings, 
  Download,
  Upload,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const reportingStandards = [
  {
    id: 'ifrs',
    name: 'IFRS',
    description: 'International Financial Reporting Standards',
    templates: [
      'Balance Sheet',
      'Income Statement',
      'Cash Flow Statement',
      'Statement of Changes in Equity',
      'Notes to Financial Statements'
    ]
  },
  {
    id: 'gaap',
    name: 'GAAP',
    description: 'Generally Accepted Accounting Principles',
    templates: [
      'Balance Sheet',
      'Income Statement',
      'Cash Flow Statement',
      'Statement of Retained Earnings',
      'Notes to Financial Statements'
    ]
  }
];

const countrySpecificStandards = [
  {
    id: 'eu',
    name: 'European Union',
    standards: ['IFRS', 'Local GAAP'],
    taxEngines: ['VAT', 'Corporate Tax']
  },
  {
    id: 'us',
    name: 'United States',
    standards: ['US GAAP'],
    taxEngines: ['Federal Tax', 'State Tax', 'Sales Tax']
  },
  {
    id: 'uk',
    name: 'United Kingdom',
    standards: ['UK GAAP', 'IFRS'],
    taxEngines: ['VAT', 'Corporation Tax']
  },
  {
    id: 'in',
    name: 'India',
    standards: ['Ind AS', 'IFRS'],
    taxEngines: ['GST', 'Income Tax']
  }
];

export function ReportingStandards() {
  const [selectedStandard, setSelectedStandard] = useState('ifrs');
  const [selectedCountry, setSelectedCountry] = useState('eu');
  const [selectedTemplate, setSelectedTemplate] = useState('');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Financial Reporting Standards</CardTitle>
          <CardDescription>
            Configure and manage financial reporting standards and templates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="standards" className="space-y-4">
            <TabsList>
              <TabsTrigger value="standards">Standards</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="tax">Tax Engines</TabsTrigger>
            </TabsList>

            <TabsContent value="standards" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {reportingStandards.map((standard) => (
                  <Card 
                    key={standard.id}
                    className={`cursor-pointer transition-colors ${
                      selectedStandard === standard.id ? 'border-primary' : ''
                    }`}
                    onClick={() => setSelectedStandard(standard.id)}
                  >
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        <CardTitle>{standard.name}</CardTitle>
                      </div>
                      <CardDescription>{standard.description}</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="templates" className="space-y-4">
              <div className="flex items-center gap-4">
                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select Country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countrySpecificStandards.map((country) => (
                      <SelectItem key={country.id} value={country.id}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select Template" />
                  </SelectTrigger>
                  <SelectContent>
                    {reportingStandards
                      .find(s => s.id === selectedStandard)
                      ?.templates.map((template) => (
                        <SelectItem key={template} value={template}>
                          {template}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>

                <Button>
                  <Download className="mr-2 h-4 w-4" />
                  Download Template
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {reportingStandards
                  .find(s => s.id === selectedStandard)
                  ?.templates.map((template) => (
                    <Card key={template}>
                      <CardHeader>
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          <CardTitle>{template}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm">
                            <Upload className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="tax" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {countrySpecificStandards.map((country) => (
                  <Card key={country.id}>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        <CardTitle>{country.name}</CardTitle>
                      </div>
                      <CardDescription>
                        Standards: {country.standards.join(', ')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <h4 className="font-medium">Tax Engines:</h4>
                        <div className="flex flex-wrap gap-2">
                          {country.taxEngines.map((engine) => (
                            <div
                              key={engine}
                              className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs"
                            >
                              <CheckCircle className="h-3 w-3" />
                              {engine}
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 