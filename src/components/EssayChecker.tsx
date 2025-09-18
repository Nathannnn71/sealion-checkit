import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { CheckCircle, XCircle, ChevronLeft, ChevronRight, Globe, Settings, User, Home, AlertCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FeedbackItem {
  id: string;
  type: 'positive' | 'negative';
  text?: string; // For dynamic feedback from AI analysis
}

interface GrammarIssue {
  type?: string; // e.g., Agreement, Tense, Word Choice
  message?: string; // brief description of the error
  sentence?: string; // sentence or fragment containing the error
  suggestion?: string; // how to fix
}

interface AnalysisResult {
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  grammar?: {
    overallScore?: number; // 0-100
    issues?: GrammarIssue[];
  };
  success: boolean;
}

// Builds a structured meta-prompt to guide the model to evaluate essays in ASEAN languages
function buildEssayPrompt(essayText: string): string {
  return `You are an academic essay evaluation assistant that analyzes essays written in multiple ASEAN languages (such as English, Malay, Indonesian, Filipino, Thai, Vietnamese, Lao, Khmer, Burmese, etc.). Each language may have its own unique grammar, sentence structure, and academic writing style. Your task is to analyze the essay according to the following framework and provide feedback clearly and constructively.

Framework to follow:
1. Introduction
- Does the essay have clear and relevant opening sentences?
- Does it capture attention by (a) stating the importance of the subject, (b) mentioning previous work, or (c) pointing out the absence of work?
- Is there a clearly focused thesis sentence relevant to the title?
- Is there a plan of development that outlines the structure of the essay and signals how the ideas will unfold?

2. Body
- Are the arguments developed in line with the plan of development?
- Does each paragraph have a topic sentence?
- Are there enough supporting details for each point?
- Are illustrations and examples brief and to the point?
- Are transitions smooth and signaled with appropriate discourse markers (e.g., "in addition," "furthermore," "however")?
- Has the writer incorporated sources effectively (summary, paraphrase, short quotations)?
- Are references acknowledged both in the text and at the end?

3. Conclusion
- Does the conclusion restate and round off the main ideas?
- Does it summarize the results/findings?
- Does it provide comments, implications, or suggestions?

4. Grammar and Editing
- Are tenses used correctly?
- Do subjects and verbs agree?
- Are clauses used correctly (e.g., avoiding “although…but” in the same sentence)?
- Is the vocabulary academic, precise, and formal?
- Are nouns, pronouns, adjectives, adverbs, and verbs used appropriately for academic writing?
- Is there a balance of sentence types (short/long, simple/complex)?
- Are spelling, typing, and grammar errors avoided?
- Are references formatted correctly?

Output Requirements:
- Provide structured feedback under each section (Introduction, Body, Conclusion, Grammar & Editing).
- Clearly separate Strengths, Weaknesses, and Suggestions.
- Highlight strengths and weaknesses with short quoted examples from the essay when relevant.
- Provide practical improvement suggestions in a constructive tone.
- If the essay is in a non-English ASEAN language, consider the unique grammar and academic conventions of that language when giving feedback and write your feedback in the same language as the essay whenever possible.

Important: Also include a compact JSON summary for UI consumption, with this exact shape (MANDATORY – never omit any top-level key below):
{
  "strengths": string[],
  "weaknesses": string[],
  "suggestions": string[],
  "positiveFeedback": string[],
  "negativeFeedback": string[],
  "sections": {
    "Introduction": { "strengths": string[], "weaknesses": string[], "suggestions": string[] },
    "Body": { "strengths": string[], "weaknesses": string[], "suggestions": string[] },
    "Conclusion": { "strengths": string[], "weaknesses": string[], "suggestions": string[] },
    "GrammarEditing": { "strengths": string[], "weaknesses": string[], "suggestions": string[] }
  },
  "grammar": {
    "overallScore": number, // REQUIRED: integer 0–100 overall grammar quality
    "issues": [ // REQUIRED: can be empty array if no errors; otherwise include concrete items
      { "type": string, "message": string, "sentence": string, "suggestion": string }
    ]
  },
  "language": string
}
Formatting rules for the JSON summary:
- Do NOT wrap the JSON in code fences (no fenced code blocks).
- Always include the keys exactly as shown above.
- Use a single line if possible. If multiple lines, still keep valid JSON.

Always print the full narrative feedback first, then print a separate line that starts with EXACTLY: JSON_SUMMARY= and then the JSON object on the same line.

Essay to analyze:\n\n${essayText}`;
}

// Primary analysis function: API Gateway/Lambda only
async function analyzeEssaySecurely(essayText: string): Promise<AnalysisResult> {
  try {
    const apiGatewayUrl = import.meta.env.VITE_ANALYSIS_API_URL as string | undefined;
    if (!apiGatewayUrl) {
      throw new Error('VITE_ANALYSIS_API_URL is not set. Please set it to your API Gateway endpoint.');
    }

    console.log('Calling API Gateway endpoint:', apiGatewayUrl);
    const resp = await fetch(apiGatewayUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Lambda expects { message, history }
      body: JSON.stringify({ message: buildEssayPrompt(essayText), history: [] }),
    });

    const data = await resp.json().catch(() => null);
    if (!resp.ok) {
      console.error('API Gateway/Lambda error:', resp.status, resp.statusText, data);
      const errMsg = data?.error || data?.message || `HTTP ${resp.status}: ${resp.statusText}`;
      const details = data?.details ? ` Details: ${data.details}` : '';
      throw new Error(`${errMsg}${details}`);
    }

    const botReply: string | undefined = data?.response;
    if (!botReply) {
      throw new Error('Invalid response from Lambda: missing "response"');
    }

    // Prefer parsing the compact JSON summary if present (after JSON_SUMMARY=)
    // Try to capture JSON summary in various formats: JSON_SUMMARY= {...} or JSON_SUMMARY: {...} with optional code fences
    let summaryJson: any = undefined;
    const summaryMatch = botReply.match(/JSON_SUMMARY\s*[:=]\s*([\s\S]*)/i);
    if (summaryMatch) {
      try {
        let raw = summaryMatch[1].trim();
        // Remove code fences if present
        raw = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '');
        // If the line contains extra narrative after the JSON, try to slice from first { to last }
        const firstBrace = raw.indexOf('{');
        const lastBrace = raw.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          raw = raw.slice(firstBrace, lastBrace + 1);
        }
        const parsed = JSON.parse(raw);
        if (parsed) {
          const strengths = parsed.strengths || parsed.positiveFeedback || [];
          const weaknesses = parsed.weaknesses || parsed.negativeFeedback || [];
          const suggestions = parsed.suggestions || [
            ...(parsed.sections?.Introduction?.suggestions || []),
            ...(parsed.sections?.Body?.suggestions || []),
            ...(parsed.sections?.Conclusion?.suggestions || []),
            ...(parsed.sections?.GrammarEditing?.suggestions || []),
          ];
          const grammar = parsed.grammar || undefined;
          return { strengths, weaknesses, suggestions, grammar, success: true };
        }
      } catch {
        // Fall through
      }
    } else {
      // If entire reply is JSON, still try parsing it for positive/negative arrays
      try {
        // Remove code fences around whole message if any
        let raw = botReply.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '');
        const parsed = JSON.parse(raw);
        if (parsed) {
          const strengths = parsed.strengths || parsed.positiveFeedback || [];
          const weaknesses = parsed.weaknesses || parsed.negativeFeedback || [];
          const suggestions = parsed.suggestions || [
            ...(parsed.sections?.Introduction?.suggestions || []),
            ...(parsed.sections?.Body?.suggestions || []),
            ...(parsed.sections?.Conclusion?.suggestions || []),
            ...(parsed.sections?.GrammarEditing?.suggestions || []),
          ];
          const grammar = parsed.grammar || undefined;
          return { strengths, weaknesses, suggestions, grammar, success: true };
        }
      } catch {
        // Continue to heuristic
      }
    }

    // Heuristic split of plain text into positives/negatives
    const lines = botReply.split(/\r?\n/).map((l: string) => l.trim()).filter(Boolean);
    const positives: string[] = [];
    const negatives: string[] = [];
    for (const line of lines) {
      const l = line.toLowerCase();
      if (l.startsWith('positive') || l.startsWith('+') || l.includes('strength')) {
        positives.push(line.replace(/^\+\s*/, ''));
      } else if (l.startsWith('negative') || l.startsWith('-') || l.includes('improv') || l.includes('weak')) {
        negatives.push(line.replace(/^\-\s*/, ''));
      }
    }
    if (positives.length === 0 && negatives.length === 0) {
      positives.push(botReply);
    }
    return { strengths: positives, weaknesses: negatives, suggestions: [], success: true };

  } catch (error) {
    console.error('Error during analysis:', error);
    throw error;
  }
}

const EssayChecker = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [essay, setEssay] = useState(`The history of our nation is fraught with battles over people's rights, and the right to vote is foremost among them. The right to vote is linked to many other significant rights and principles, such of that of equality and justice. It should not be denied to eligible citizens, including those who have infringed on the rights of others.

Prisoners should be allowed the right to vote, as this right is crucial to our classification as a democracy. The primary argument denying prisoners this right is based on a gross generalization, and denies their standing as citizens of the state.

The right to vote defines our nation as a democracy and should be afforded to all citizens. The denial of this right for prisoners in general, denies their citizenship, even to those felons who are incarcerated because of minor crimes or crimes that have inviolable wrong action by society as a whole to society themselves but not because it is a punishment against the right to vote that may concern on the might to equal justice. We should deny only the rights that in our objective justice system is necessary to ensure a just and functional democracy. If we restrict a citizen the right to vote he or her voice heard should be them to any other, what other infringements can we justify?

The primary argument against allowing prisoners the right to vote, which often infringes on the right of another, his or her own rights, is based on a gross generalization. This argument fails to take into account the significant number of prisoners who are incarcerated because of minor crimes or crimes that stem civil moral prohibitions, wrong action to feed but not because it is a punishment against the tenets of moral and just government. You would argue that a mansions insolently achieve the violence toward social patterns.`);

  const [strengths, setStrengths] = useState<string[]>([]);
  const [weaknesses, setWeaknesses] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [grammarSummary, setGrammarSummary] = useState<{ overallScore?: number; issues?: GrammarIssue[] }>({});

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  // Load uploaded essay if available
  useEffect(() => {
    const stored = sessionStorage.getItem('uploadedEssay');
    if (stored) {
      setEssay(stored);
      // Optionally clear so it doesn't override subsequent manual edits when navigating back
      sessionStorage.removeItem('uploadedEssay');
    }
  }, []);

  // SECURE: Analysis function that calls Supabase Edge Function
  const handleAnalyze = async () => {
    if (!essay.trim()) {
      toast.error('Please enter an essay to analyze');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    
    try {
      console.log('Starting essay analysis...');
      
  // Call Lambda through API Gateway
  const analysisResult = await analyzeEssaySecurely(essay);
      
      console.log('Analysis result received:', analysisResult);
      
      // Update UI with strengths, weaknesses, suggestions, and grammar
      setStrengths(analysisResult.strengths || []);
      setWeaknesses(analysisResult.weaknesses || []);
      setSuggestions(analysisResult.suggestions || []);
      setGrammarSummary(analysisResult.grammar || {});
      setHasAnalyzed(true);
      toast.success('Essay analysis completed successfully!');
      
    } catch (error) {
      console.error('Analysis failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      toast.error('Analysis failed. Please check the error details and try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Back button uses stored assignment id for correct route
  const handleBackToAssignment = () => {
    const assignmentId = sessionStorage.getItem('currentAssignmentId');
    if (assignmentId) {
      navigate(`/assignment/${assignmentId}`);
    } else {
      navigate('/dashboard');
    }
  };

  const positiveFeedback = strengths;
  const negativeFeedback = weaknesses;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Home 
              className="w-6 h-6 cursor-pointer hover:text-accent transition-colors" 
              onClick={() => navigate('/dashboard')} 
              aria-label="Go to Dashboard" 
            />
            <h1 className="text-xl font-semibold">Checkit ✓</h1>
          </div>
          <div className="flex items-center gap-4">
            <Globe className="w-5 h-5" />
            <Settings className="w-5 h-5" />
            <span className="text-sm">dinoTeacher</span>
            <User className="w-5 h-5" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Essay Input Section */}
        <div className="flex-1 p-6 border-r border-border flex flex-col">
          {/* Back button */}
          <button 
            onClick={handleBackToAssignment}
            className="mb-4 flex items-center gap-2 bg-transparent border-none p-2 -ml-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer group"
          >
            <ChevronLeft className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="text-sm text-muted-foreground group-hover:text-primary transition-colors">
              {t('checker.back')}
            </span>
          </button>
          
          {/* Error Display */}
          {error && (
            <Alert className="mb-4 border-destructive bg-destructive/10">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <AlertDescription className="text-destructive">
                <strong>Analysis Error:</strong> {error}
                <br />
                <span className="text-sm text-muted-foreground mt-1 block">
                  Check your Lambda logs in Amazon CloudWatch for details.
                </span>
              </AlertDescription>
            </Alert>
          )}
          
          <div className="mb-4">
            <Textarea
              value={essay}
              onChange={(e) => setEssay(e.target.value)}
              className="min-h-[400px] resize-none text-sm leading-relaxed"
              placeholder="Paste your essay here for analysis..."
            />
          </div>
          
          <div className="flex justify-center mt-auto pt-4">
            <Button 
              onClick={handleAnalyze}
              disabled={isAnalyzing || !essay.trim()}
              className="px-8"
            >
              {isAnalyzing ? `${t('checker.analyze')}...` : t('checker.analyze')}
            </Button>
          </div>

          {/* Analysis Status */}
          {isAnalyzing && (
            <div className="mt-4 text-center text-sm text-muted-foreground">
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
                Analyzing essay with AI model...
              </div>
            </div>
          )}
        </div>

        {/* Feedback Section */}
        <div className="w-96 p-6 overflow-y-auto">
          {!hasAnalyzed && !isAnalyzing && !error && (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <div className="text-muted-foreground mb-2">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Click "Analyze Essay" to get AI-powered feedback using your custom Bedrock model.
                </p>
              </div>
            </div>
          )}

          {/* Strengths */}
          {positiveFeedback.length > 0 && (
            <Card className="p-4 mb-6">
              <h2 className="text-lg font-semibold text-success mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Strengths
              </h2>
              <div className="space-y-3">
                {positiveFeedback.map((text, idx) => (
                  <div key={`strength_${idx}`} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-card-foreground leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Weaknesses */}
          {negativeFeedback.length > 0 && (
            <Card className="p-4">
              <h2 className="text-lg font-semibold text-destructive mb-4 flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                Weaknesses
              </h2>
              <div className="space-y-3">
                {negativeFeedback.map((text, idx) => (
                  <div key={`weakness_${idx}`} className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-card-foreground leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <Card className="p-4 mt-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Suggestions
              </h2>
              <div className="space-y-3">
                {suggestions.map((text, idx) => (
                  <div key={`suggestion_${idx}`} className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-card-foreground leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Grammar */}
          {(grammarSummary.overallScore !== undefined || (grammarSummary.issues && grammarSummary.issues.length > 0)) && (
            <Card className="p-4 mt-6">
              <h2 className="text-lg font-semibold mb-2">Grammar</h2>
              {grammarSummary.overallScore !== undefined && (
                <p className="text-sm text-muted-foreground mb-4">Overall Grammar Score: <span className="font-medium text-foreground">{grammarSummary.overallScore}</span>/100</p>
              )}
              {grammarSummary.issues && grammarSummary.issues.length > 0 && (
                <div className="space-y-3">
                  {grammarSummary.issues.map((issue, idx) => (
                    <div key={`grammar_${idx}`} className="text-sm">
                      <div className="font-medium">{issue.type || 'Issue'}: {issue.message}</div>
                      {issue.sentence && (
                        <div className="mt-1 text-muted-foreground">Sentence: “{issue.sentence}”</div>
                      )}
                      {issue.suggestion && (
                        <div className="mt-1">Suggestion: {issue.suggestion}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="border-t border-border p-4 bg-card">
        <div className="flex justify-between items-center max-w-md mx-auto">
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-muted-foreground">{t('checker.student.placeholder')}</span>
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EssayChecker;
