/**
 * Rep Workspace Onboarding Experience
 * 
 * Addresses jury feedback:
 * - "What's the learning curve?" (15 mentions)
 * - "Need clearer onboarding guidance" (15 mentions)
 * - Skeptic pass rate of only 5%
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CheckSquare2Icon,
  CalendarIcon,
  BuildingIcon,
  BotIcon,
  SparklesIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  XIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  highlight: string;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'action-items',
    title: 'Action Items',
    description: 'Tasks automatically extracted from your recorded meetings. Never forget a follow-up.',
    icon: CheckSquare2Icon,
    highlight: 'top-left',
  },
  {
    id: 'meetings',
    title: 'Recent Meetings',
    description: 'Quick access to meeting summaries, key insights, and recordings.',
    icon: CalendarIcon,
    highlight: 'top-right',
  },
  {
    id: 'accounts',
    title: 'My Accounts',
    description: 'Health scores and deal info pulled from your CRM. See which accounts need attention.',
    icon: BuildingIcon,
    highlight: 'bottom-left',
  },
  {
    id: 'agent-activity',
    title: 'Agent Activity',
    description: 'Everything AI does on your behalf is logged here. Full transparency, no surprises.',
    icon: BotIcon,
    highlight: 'bottom-right',
  },
];

interface OnboardingExperienceProps {
  userName?: string;
  connectedSources?: {
    calendar?: boolean;
    crm?: boolean;
    crmName?: string;
    meetingCount?: number;
    accountCount?: number;
  };
  onComplete?: () => void;
  onSkip?: () => void;
}

export function OnboardingWelcome({
  userName = 'there',
  onStartTour,
  onSkip,
}: {
  userName?: string;
  onStartTour?: () => void;
  onSkip?: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        <CardContent className="pt-8 pb-6 px-8 text-center">
          <div className="size-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <SparklesIcon className="size-8 text-white" />
          </div>
          
          <h2 className="text-2xl font-semibold text-slate-900 mb-2">
            Welcome to Your Workspace, {userName}! 👋
          </h2>
          
          <p className="text-slate-600 mb-6">
            Your personal command center for managing deals and staying on top of customer conversations.
          </p>

          <div className="space-y-3 text-left mb-8">
            <div className="flex items-start gap-3">
              <div className="size-6 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
                <CheckSquare2Icon className="size-3.5 text-indigo-600" />
              </div>
              <div>
                <span className="font-medium text-slate-900">Action items</span>
                <span className="text-slate-600"> from your meetings</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="size-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                <CalendarIcon className="size-3.5 text-blue-600" />
              </div>
              <div>
                <span className="font-medium text-slate-900">Meeting insights</span>
                <span className="text-slate-600"> at your fingertips</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="size-6 rounded-full bg-violet-100 flex items-center justify-center shrink-0 mt-0.5">
                <BuildingIcon className="size-3.5 text-violet-600" />
              </div>
              <div>
                <span className="font-medium text-slate-900">Account health</span>
                <span className="text-slate-600"> at a glance</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="size-6 rounded-full bg-cyan-100 flex items-center justify-center shrink-0 mt-0.5">
                <BotIcon className="size-3.5 text-cyan-600" />
              </div>
              <div>
                <span className="font-medium text-slate-900">Full transparency</span>
                <span className="text-slate-600"> into AI actions</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Button
              onClick={onStartTour}
              className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700"
            >
              Take a Quick Tour
              <ChevronRightIcon className="ml-2 size-4" />
            </Button>
            <button
              onClick={onSkip}
              className="w-full text-sm text-slate-500 hover:text-slate-700 py-2"
            >
              Skip for now
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function OnboardingTourStep({
  step,
  currentIndex,
  totalSteps,
  onNext,
  onPrevious,
  onSkip,
}: {
  step: OnboardingStep;
  currentIndex: number;
  totalSteps: number;
  onNext?: () => void;
  onPrevious?: () => void;
  onSkip?: () => void;
}) {
  const Icon = step.icon;
  const isLast = currentIndex === totalSteps - 1;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop with spotlight effect */}
      <div className="absolute inset-0 bg-black/60" />
      
      {/* Tour card */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-md px-4">
        <Card className="shadow-2xl border-2 border-indigo-200 animate-in slide-in-from-bottom-4 duration-300">
          <CardContent className="pt-6 pb-4 px-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="size-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0">
                <Icon className="size-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-lg">{step.title}</h3>
                <p className="text-slate-600 text-sm mt-1">{step.description}</p>
              </div>
            </div>

            {/* Progress dots */}
            <div className="flex items-center justify-center gap-1.5 mb-4">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'size-2 rounded-full transition-colors',
                    i === currentIndex ? 'bg-indigo-600' : 'bg-slate-200'
                  )}
                />
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={onSkip}
                className="text-sm text-slate-500 hover:text-slate-700"
              >
                Skip tour
              </button>
              <div className="flex gap-2">
                {currentIndex > 0 && (
                  <Button variant="outline" size="sm" onClick={onPrevious}>
                    Back
                  </Button>
                )}
                <Button size="sm" onClick={onNext}>
                  {isLast ? 'Finish' : 'Next'}
                  <ChevronRightIcon className="ml-1 size-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function OnboardingComplete({
  connectedSources,
  onGetStarted,
}: {
  connectedSources?: OnboardingExperienceProps['connectedSources'];
  onGetStarted?: () => void;
}) {
  const calendar = connectedSources?.calendar ?? true;
  const crm = connectedSources?.crm ?? true;
  const crmName = connectedSources?.crmName ?? 'Salesforce';
  const meetingCount = connectedSources?.meetingCount ?? 12;
  const accountCount = connectedSources?.accountCount ?? 47;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        <CardContent className="pt-8 pb-6 px-8 text-center">
          <div className="size-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircleIcon className="size-8 text-emerald-600" />
          </div>
          
          <h2 className="text-2xl font-semibold text-slate-900 mb-2">
            You're All Set! ✅
          </h2>
          
          <p className="text-slate-600 mb-6">
            Your workspace will populate as you have meetings and connect your tools.
          </p>

          <div className="bg-slate-50 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm font-medium text-slate-700 mb-3">Connected:</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {calendar ? (
                    <CheckCircleIcon className="size-4 text-emerald-500" />
                  ) : (
                    <XIcon className="size-4 text-slate-300" />
                  )}
                  <span className={cn('text-sm', calendar ? 'text-slate-700' : 'text-slate-400')}>
                    Calendar
                  </span>
                </div>
                {calendar && (
                  <Badge variant="secondary" className="text-xs">
                    {meetingCount} upcoming
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {crm ? (
                    <CheckCircleIcon className="size-4 text-emerald-500" />
                  ) : (
                    <XIcon className="size-4 text-slate-300" />
                  )}
                  <span className={cn('text-sm', crm ? 'text-slate-700' : 'text-slate-400')}>
                    {crmName}
                  </span>
                </div>
                {crm && (
                  <Badge variant="secondary" className="text-xs">
                    {accountCount} accounts
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="bg-indigo-50 rounded-xl p-4 mb-6 text-left">
            <div className="flex items-start gap-3">
              <SparklesIcon className="size-5 text-indigo-600 shrink-0 mt-0.5" />
              <p className="text-sm text-indigo-700">
                <strong>Tip:</strong> Ask Elephant anything about your deals using the chat below.
              </p>
            </div>
          </div>

          <Button
            onClick={onGetStarted}
            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700"
          >
            Go to My Workspace
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export function OnboardingExperience({
  userName = 'there',
  connectedSources,
  onComplete,
  onSkip,
}: OnboardingExperienceProps) {
  const [stage, setStage] = useState<'welcome' | 'tour' | 'complete'>('welcome');
  const [tourStep, setTourStep] = useState(0);

  const handleStartTour = () => setStage('tour');
  
  const handleNextStep = () => {
    if (tourStep < onboardingSteps.length - 1) {
      setTourStep(tourStep + 1);
    } else {
      setStage('complete');
    }
  };

  const handlePreviousStep = () => {
    if (tourStep > 0) {
      setTourStep(tourStep - 1);
    }
  };

  const handleSkip = () => {
    onSkip?.();
    onComplete?.();
  };

  const handleComplete = () => {
    onComplete?.();
  };

  if (stage === 'welcome') {
    return (
      <OnboardingWelcome
        userName={userName}
        onStartTour={handleStartTour}
        onSkip={handleSkip}
      />
    );
  }

  if (stage === 'tour') {
    return (
      <OnboardingTourStep
        step={onboardingSteps[tourStep]}
        currentIndex={tourStep}
        totalSteps={onboardingSteps.length}
        onNext={handleNextStep}
        onPrevious={handlePreviousStep}
        onSkip={handleSkip}
      />
    );
  }

  return (
    <OnboardingComplete
      connectedSources={connectedSources}
      onGetStarted={handleComplete}
    />
  );
}
