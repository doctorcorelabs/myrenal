/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

// Note: We are NOT using the openai SDK directly here as it's less straightforward
// to handle streaming responses within the Worker environment compared to using fetch directly.
// The SDK might be better suited for non-streaming or Node.js environments.

export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;
	//
	// Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
	// MY_SERVICE: Fetcher;
	//
	// Example binding to a Queue. Learn more at https://developers.cloudflare.com/queues/javascript-apis/
	// MY_QUEUE: Queue;

	// Secret binding for the DeepSeek API Key
	DEEPSEEK_API_KEY: string;
}

// Define message structure (compatible with DeepSeek API)
interface Message {
	role: 'system' | 'user' | 'assistant';
	content: string;
	// name?: string; // Optional name field if needed
}

// Define the expected request body structure
interface RequestBody {
	messages: Message[]; // Expect an array of messages
	model: 'deepseek-chat' | 'deepseek-reasoner'; // Enforce specific model names
	// Add other parameters like temperature, max_tokens etc. if needed
}

// Define the expected DeepSeek non-streaming response structure
interface DeepSeekResponse {
	choices?: Array<{
		message?: {
			content?: string;
		};
	}>;
	// Add other potential fields if known (e.g., usage)
	usage?: {
		prompt_tokens: number;
		completion_tokens: number;
		total_tokens: number;
	};
	error?: {
		message: string;
		type: string;
		param: string | null;
		code: string | null;
	};
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		// Handle CORS preflight requests (OPTIONS)
		if (request.method === 'OPTIONS') {
			return handleOptions(request);
		}

		// Only allow POST requests
		if (request.method !== 'POST') {
			return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
		}

		// Check for API Key
		if (!env.DEEPSEEK_API_KEY) {
			console.error('DEEPSEEK_API_KEY secret not set.');
			return new Response('API Key not configured', { status: 500, headers: corsHeaders });
		}

		try {
			const body: RequestBody = await request.json();

			// Basic validation
			if (!body.messages || body.messages.length === 0 || !body.model) {
				return new Response('Missing messages array or model in request body', { status: 400, headers: corsHeaders });
			}
			if (body.model !== 'deepseek-chat' && body.model !== 'deepseek-reasoner') {
				return new Response('Invalid model specified', { status: 400, headers: corsHeaders });
			}
			// Ensure messages have valid roles and content
			if (!body.messages.every(msg => ['system', 'user', 'assistant'].includes(msg.role) && typeof msg.content === 'string')) {
				return new Response('Invalid message structure in messages array', { status: 400, headers: corsHeaders });
			}


			// Add more specific formatting instructions to the system message
			let finalMessages = body.messages;
			const systemMessageIndex = finalMessages.findIndex(msg => msg.role === 'system');
			// More detailed instructions for Markdown formatting
			const formattingInstruction = `

**Formatting Instructions:**
- Use standard Markdown syntax ONLY.
- **Headings:** Use '### Heading Text' (with a space after ###). Do NOT use '###Heading Text'.
- **Bold Text:** Use '**bold text**' (with asterisks on both sides). Do NOT use '**text' or 'text**'.
- **Tables:** Use standard Markdown table format:
  | Header 1 | Header 2 |
  | -------- | -------- |
  | Cell 1   | Cell 2   |
  | Cell 3   | Cell 4   |
- **Lists:** Use standard Markdown lists (* item or 1. item).`;

			let baseSystemContent = "You are a helpful medical assistant.";
			if (systemMessageIndex !== -1) {
				// Append to existing system message, removing default if it's there
				baseSystemContent = finalMessages[systemMessageIndex].content.replace("You are a helpful medical assistant.", "").trim();
				finalMessages[systemMessageIndex].content = (baseSystemContent ? baseSystemContent : "You are a helpful medical assistant.") + formattingInstruction;
			} else {
				// Prepend a new system message
				finalMessages.unshift({ role: 'system', content: baseSystemContent + formattingInstruction });
			}

			const deepseekPayload = {
				model: body.model,
				messages: finalMessages, // Pass the modified message history
				stream: false, // Disable streaming again
				// Add other DeepSeek parameters here if needed (temperature, max_tokens, etc.)
			};

			const deepseekResponse = await fetch('https://api.deepseek.com/chat/completions', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${env.DEEPSEEK_API_KEY}`,
				},
				body: JSON.stringify(deepseekPayload),
			});

			if (!deepseekResponse.ok) {
				const errorText = await deepseekResponse.text();
				console.error(`DeepSeek API Error (${deepseekResponse.status}): ${errorText}`);
				return new Response(`DeepSeek API Error: ${errorText}`, { status: deepseekResponse.status, headers: corsHeaders });
			}

			// Check if the response body is null (shouldn't happen with streaming if successful)
            if (deepseekResponse.body === null) {
                return new Response('DeepSeek API returned an empty stream body.', { status: 500, headers: corsHeaders });
            }

			// Create a new ReadableStream to forward the response from DeepSeek
            // Revert to standard JSON response handling
            const responseData: DeepSeekResponse = await deepseekResponse.json();

            // Extract the content from the response
            const content = responseData?.choices?.[0]?.message?.content || '';

            // Return the content as a JSON response to the frontend
            return new Response(JSON.stringify({ responseText: content }), {
                headers: {
                    ...corsHeaders, // Include CORS headers
                    'Content-Type': 'application/json',
                },
            });

		} catch (error) {
			console.error('Error processing request:', error);
			const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
			return new Response(`Internal Server Error: ${errorMessage}`, { status: 500, headers: corsHeaders });
		}
	},
};

// CORS Headers - Adjust origin as needed for security in production
const corsHeaders = {
	'Access-Control-Allow-Origin': '*', // Allow all origins for now, restrict in production
	'Access-Control-Allow-Methods': 'POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type, Authorization', // Allow Content-Type and potentially Authorization if needed later
};

function handleOptions(request: Request) {
	// Make sure the necessary headers are present
	// for this to be a valid preflight request
	if (
		request.headers.get('Origin') !== null &&
		request.headers.get('Access-Control-Request-Method') !== null &&
		request.headers.get('Access-Control-Request-Headers') !== null
	) {
		// Handle CORS preflight requests.
		return new Response(null, {
			headers: corsHeaders,
		});
	} else {
		// Handle standard OPTIONS request.
		return new Response(null, {
			headers: {
				Allow: 'POST, OPTIONS',
			},
		});
	}
}
