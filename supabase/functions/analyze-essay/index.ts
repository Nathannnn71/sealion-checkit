import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { BedrockRuntimeClient, InvokeModelCommand, ConverseCommand } from "npm:@aws-sdk/client-bedrock-runtime@3.888.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { essay } = await req.json();

    if (!essay || typeof essay !== 'string' || essay.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Essay text is required and cannot be empty' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Initialize Bedrock client
    const region = Deno.env.get('AWS_REGION') || 'us-east-1';
    const accessKeyId = Deno.env.get('AWS_ACCESS_KEY_ID');
    const secretAccessKey = Deno.env.get('AWS_SECRET_ACCESS_KEY');
    const modelId = Deno.env.get('BEDROCK_MODEL_ID') || "arn:aws:bedrock:us-east-1:116163866269:imported-model/d48xlm95eq5l";

    if (!accessKeyId || !secretAccessKey) {
      return new Response(JSON.stringify({ error: 'Server missing AWS credentials', success: false }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const bedrockClient = new BedrockRuntimeClient({
      region,
      credentials: { accessKeyId, secretAccessKey },
    });

    // Prepare the prompt for essay analysis
    const analysisPrompt = `Please analyze the following essay and provide detailed feedback. Return your response in the following JSON format:

{
  "positiveFeedback": [
    "List specific positive aspects of the essay",
    "Such as strong arguments, good structure, clear writing",
    "Each item should be a complete sentence describing what was done well"
  ],
  "negativeFeedback": [
    "List specific areas for improvement",
    "Such as unclear arguments, weak evidence, grammatical issues",
    "Each item should be a complete sentence describing what needs work"
  ]
}

Essay to analyze:
"""
${essay}
"""

Focus on:
- Argument strength and logical flow
- Evidence and supporting details
- Writing clarity and organization
- Grammar and style
- Thesis development and conclusion

Provide constructive, specific feedback that helps the student improve their writing.`;

    // Try Converse first (for newer models); fallback to InvokeModel with Llama-style body
    let modelText = "";
    try {
      const conv = await bedrockClient.send(new ConverseCommand({
        modelId,
        messages: [{ role: "user", content: [{ text: analysisPrompt }] }],
        inferenceConfig: { temperature: 0.3, maxTokens: 800, topP: 0.9 },
      }));
      const content = conv.output?.message?.content?.[0];
      if (content && "text" in content && content.text) modelText = content.text;
    } catch (e) {
      // Fallback for models not supporting Converse
      const body = JSON.stringify({ prompt: analysisPrompt, temperature: 0.3, top_p: 0.9, max_gen_len: 800 });
      const resp = await bedrockClient.send(new InvokeModelCommand({
        modelId,
        contentType: "application/json",
        accept: "application/json",
        body: new TextEncoder().encode(body),
      }));
      const decoded = new TextDecoder().decode(resp.body);
      try {
        const parsed = JSON.parse(decoded);
        modelText = parsed.output_text ?? parsed.generated_text ?? decoded;
      } catch {
        modelText = decoded;
      }
    }

    let analysisResult;
    try {
      const jsonMatch = modelText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Error parsing analysis result:', parseError);
      const lines = modelText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      analysisResult = {
        positiveFeedback: lines.slice(0, 4),
        negativeFeedback: lines.slice(4, 8)
      };
    }

    // Validate the structure
    if (!analysisResult.positiveFeedback || !analysisResult.negativeFeedback) {
      throw new Error('Invalid analysis result structure');
    }

    console.log('Essay analysis completed successfully');

    return new Response(
      JSON.stringify({
        positiveFeedback: analysisResult.positiveFeedback,
        negativeFeedback: analysisResult.negativeFeedback,
        success: true
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in analyze-essay function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to analyze essay. Please check your AWS configuration and try again.',
        details: error instanceof Error ? error.message : String(error),
        success: false
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
