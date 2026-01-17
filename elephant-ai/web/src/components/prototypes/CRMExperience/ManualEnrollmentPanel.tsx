/**
 * Manual Enrollment Panel
 * 
 * Side panel for testing workflows on specific records without triggering 
 * other HubSpot workflows.
 * 
 * Per PRD Priority #2: "Part of the reason I haven't built a close won workflow 
 * is because to test something, I have to mark a stage as close won. So I'm 
 * triggering 40 other things."
 * 
 * Per design brief: "Test" button, Record selector, Dry run option, Results view
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertTriangle,
  ArrowRight,
  Beaker,
  Building2,
  Briefcase,
  CheckCircle2,
  Loader2,
  Play,
  Search,
  User,
  Zap,
} from 'lucide-react';
import { useState } from 'react';

import type { CRMRecord, CRMRecordType, FieldUpdate, ManualEnrollmentResult } from './types';
import { getConfidenceColor, mockRecords } from './mocks/mockData';

interface ManualEnrollmentPanelProps {
  workflowId: string;
  workflowName: string;
  open: boolean;
  onClose: () => void;
}

type TestMode = 'dry-run' | 'execute';

const RecordTypeIcon = ({ type }: { type: CRMRecordType }) => {
  switch (type) {
    case 'deal':
      return <Briefcase className="size-4" />;
    case 'contact':
      return <User className="size-4" />;
    case 'company':
      return <Building2 className="size-4" />;
    default:
      return null;
  }
};

function RecordSelector({
  selectedRecord,
  onSelect,
}: {
  selectedRecord: CRMRecord | null;
  onSelect: (record: CRMRecord) => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [recordType, setRecordType] = useState<CRMRecordType | 'all'>('all');

  const filteredRecords = mockRecords.filter((record) => {
    if (recordType !== 'all' && record.type !== recordType) return false;
    if (searchQuery) {
      return record.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Search & Filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search HubSpot records..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Record Type Tabs */}
      <Tabs value={recordType} onValueChange={(v) => setRecordType(v as CRMRecordType | 'all')}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="deal">Deals</TabsTrigger>
          <TabsTrigger value="contact">Contacts</TabsTrigger>
          <TabsTrigger value="company">Companies</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Records List */}
      <div className="border rounded-lg divide-y max-h-[300px] overflow-auto">
        {filteredRecords.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Search className="size-8 mx-auto mb-2 opacity-50" />
            <p>No records found</p>
          </div>
        ) : (
          filteredRecords.map((record) => (
            <div
              key={record.id}
              className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors ${
                selectedRecord?.id === record.id ? 'bg-primary/5 border-l-2 border-l-primary' : ''
              }`}
              onClick={() => onSelect(record)}
            >
              <div className="rounded-full bg-muted p-2">
                <RecordTypeIcon type={record.type} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{record.name}</div>
                <div className="text-sm text-muted-foreground capitalize">{record.type}</div>
              </div>
              {selectedRecord?.id === record.id && (
                <CheckCircle2 className="size-5 text-primary shrink-0" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function TestModeSelector({
  mode,
  onModeChange,
}: {
  mode: TestMode;
  onModeChange: (mode: TestMode) => void;
}) {
  return (
    <RadioGroup value={mode} onValueChange={(v) => onModeChange(v as TestMode)} className="grid gap-3">
      <Label
        htmlFor="dry-run"
        className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
          mode === 'dry-run' ? 'bg-blue-50 border-blue-200' : 'hover:bg-muted/50'
        }`}
      >
        <RadioGroupItem value="dry-run" id="dry-run" className="mt-1" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Beaker className="size-4 text-blue-600" />
            <span className="font-medium">Dry Run</span>
            <Badge variant="outline" colorVariant="blue" className="text-xs">Recommended</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Preview what would happen without making actual changes. Safe for testing.
          </p>
        </div>
      </Label>

      <Label
        htmlFor="execute"
        className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
          mode === 'execute' ? 'bg-yellow-50 border-yellow-200' : 'hover:bg-muted/50'
        }`}
      >
        <RadioGroupItem value="execute" id="execute" className="mt-1" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Zap className="size-4 text-yellow-600" />
            <span className="font-medium">Execute</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Actually run the workflow and update HubSpot. Other HubSpot workflows will NOT be triggered.
          </p>
        </div>
      </Label>
    </RadioGroup>
  );
}

function TestResults({ result }: { result: ManualEnrollmentResult }) {
  return (
    <div className="space-y-4">
      {/* Status Banner */}
      <div
        className={`p-4 rounded-lg ${
          result.success
            ? result.isDryRun
              ? 'bg-blue-50 border border-blue-200'
              : 'bg-green-50 border border-green-200'
            : 'bg-rose-50 border border-rose-200'
        }`}
      >
        <div className="flex items-center gap-2">
          {result.success ? (
            result.isDryRun ? (
              <Beaker className="size-5 text-blue-600" />
            ) : (
              <CheckCircle2 className="size-5 text-green-600" />
            )
          ) : (
            <AlertTriangle className="size-5 text-rose-600" />
          )}
          <span className="font-medium">
            {result.success
              ? result.isDryRun
                ? 'Dry Run Complete'
                : 'Workflow Executed Successfully'
              : 'Execution Failed'}
          </span>
        </div>
        {result.isDryRun && result.success && (
          <p className="text-sm text-blue-700 mt-1">
            This is a preview. No changes were made to HubSpot.
          </p>
        )}
        {!result.success && result.errorMessage && (
          <p className="text-sm text-rose-700 mt-1">{result.errorMessage}</p>
        )}
      </div>

      {/* Record Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Target Record</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <RecordTypeIcon type={result.record.type} />
            <span className="font-medium">{result.record.name}</span>
            <Badge variant="outline" className="capitalize text-xs">
              {result.record.type}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Field Updates */}
      {result.fieldUpdates.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">
              {result.isDryRun ? 'Fields That Would Update' : 'Fields Updated'}
            </CardTitle>
            <CardDescription>
              {result.fieldUpdates.length} field{result.fieldUpdates.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {result.fieldUpdates.map((update, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground min-w-[120px]">{update.fieldLabel}</span>
                <span className={!update.previousValue ? 'text-muted-foreground italic' : ''}>
                  {update.previousValue || 'Empty'}
                </span>
                <ArrowRight className="size-3 text-muted-foreground" />
                <span className="font-medium text-green-700">{update.newValue}</span>
                <Badge
                  variant="outline"
                  colorVariant={getConfidenceColor(update.confidenceLevel)}
                  className="ml-auto text-xs"
                >
                  {update.confidence}%
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Timing */}
      <div className="text-sm text-muted-foreground text-center">
        Completed in {result.duration}ms
      </div>
    </div>
  );
}

export function ManualEnrollmentPanel({
  workflowId,
  workflowName,
  open,
  onClose,
}: ManualEnrollmentPanelProps) {
  const [step, setStep] = useState<'select' | 'configure' | 'running' | 'results'>('select');
  const [selectedRecord, setSelectedRecord] = useState<CRMRecord | null>(null);
  const [testMode, setTestMode] = useState<TestMode>('dry-run');
  const [result, setResult] = useState<ManualEnrollmentResult | null>(null);

  const handleReset = () => {
    setStep('select');
    setSelectedRecord(null);
    setTestMode('dry-run');
    setResult(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleRunTest = async () => {
    if (!selectedRecord) return;

    setStep('running');

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock result
    const mockResult: ManualEnrollmentResult = {
      success: true,
      isDryRun: testMode === 'dry-run',
      record: selectedRecord,
      fieldUpdates: [
        {
          fieldName: 'deal_stage',
          fieldLabel: 'Deal Stage',
          previousValue: 'Discovery',
          newValue: 'Proposal',
          confidence: 89,
          confidenceLevel: 'high',
          source: 'ai',
        },
        {
          fieldName: 'next_steps',
          fieldLabel: 'Next Steps',
          previousValue: null,
          newValue: 'Send proposal by Friday',
          confidence: 92,
          confidenceLevel: 'high',
          source: 'ai',
        },
        {
          fieldName: 'budget',
          fieldLabel: 'Budget',
          previousValue: 'TBD',
          newValue: '$75,000',
          confidence: 67,
          confidenceLevel: 'medium',
          source: 'ai',
        },
      ],
      duration: 1847,
    };

    setResult(mockResult);
    setStep('results');
  };

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <SheetContent className="w-full sm:max-w-lg lg:max-w-xl overflow-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-blue-100 p-2">
              <Beaker className="size-5 text-blue-600" />
            </div>
            <div>
              <SheetTitle>Test Workflow</SheetTitle>
              <SheetDescription className="text-sm">{workflowName}</SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6">
          {/* Important Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
            <div className="flex items-start gap-2">
              <AlertTriangle className="size-4 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <span className="font-medium text-blue-900">Isolated testing</span>
                <p className="text-blue-700 mt-0.5">
                  This test will NOT trigger other HubSpot workflows, even if the record would
                  normally meet their enrollment criteria.
                </p>
              </div>
            </div>
          </div>

          {step === 'select' && (
            <>
              <div>
                <h3 className="text-sm font-medium mb-3">1. Select a HubSpot record</h3>
                <RecordSelector selectedRecord={selectedRecord} onSelect={setSelectedRecord} />
              </div>

              <Button
                className="w-full"
                disabled={!selectedRecord}
                onClick={() => setStep('configure')}
              >
                Continue
                <ArrowRight className="size-4 ml-1" />
              </Button>
            </>
          )}

          {step === 'configure' && (
            <>
              {/* Selected Record Summary */}
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="text-xs text-muted-foreground mb-1">Selected record</div>
                <div className="flex items-center gap-2">
                  <RecordTypeIcon type={selectedRecord!.type} />
                  <span className="font-medium">{selectedRecord?.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto text-xs"
                    onClick={() => setStep('select')}
                  >
                    Change
                  </Button>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-medium mb-3">2. Choose test mode</h3>
                <TestModeSelector mode={testMode} onModeChange={setTestMode} />
              </div>

              <Button className="w-full" onClick={handleRunTest}>
                <Play className="size-4 mr-1" />
                {testMode === 'dry-run' ? 'Run Preview' : 'Execute Workflow'}
              </Button>
            </>
          )}

          {step === 'running' && (
            <div className="py-12 text-center">
              <Loader2 className="size-12 mx-auto mb-4 text-primary animate-spin" />
              <div className="font-medium">
                {testMode === 'dry-run' ? 'Running preview...' : 'Executing workflow...'}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Analyzing meeting context and preparing updates
              </p>
            </div>
          )}

          {step === 'results' && result && (
            <>
              <TestResults result={result} />
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={handleReset}>
                  Test Another Record
                </Button>
                {result.isDryRun && result.success && (
                  <Button
                    className="flex-1"
                    onClick={() => {
                      setTestMode('execute');
                      handleRunTest();
                    }}
                  >
                    <Zap className="size-4 mr-1" />
                    Execute for Real
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
