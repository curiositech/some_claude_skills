#!/usr/bin/env node
/**
 * SSE Stream Tester
 *
 * Test Server-Sent Events endpoints locally without UI.
 *
 * Usage: npx tsx stream_tester.ts <endpoint> [prompt]
 *
 * Examples:
 *   npx tsx stream_tester.ts http://localhost:3000/api/chat "Hello AI"
 *   npx tsx stream_tester.ts https://api.example.com/stream
 *
 * Dependencies: npm install node-fetch
 */

interface StreamTestOptions {
  endpoint: string;
  prompt?: string;
  method?: 'GET' | 'POST';
  headers?: Record<string, string>;
  timeout?: number;
}

async function testSSEStream(options: StreamTestOptions) {
  const {
    endpoint,
    prompt = 'Tell me a short story',
    method = 'POST',
    headers = {},
    timeout = 30000
  } = options;

  console.log(`\n🧪 Testing SSE endpoint: ${endpoint}\n`);
  console.log(`📝 Prompt: "${prompt}"\n`);
  console.log('─'.repeat(60));

  const startTime = Date.now();
  let tokenCount = 0;
  let fullResponse = '';
  let lastEventTime = startTime;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const fetchOptions: RequestInit = {
      method,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (method === 'POST') {
      fetchOptions.body = JSON.stringify({ prompt });
    }

    const response = await fetch(endpoint, fetchOptions);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error('Response body is null');
    }

    console.log(`✅ Connected (${response.status} ${response.statusText})\n`);

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        console.log('\n\n✅ Stream completed');
        break;
      }

      const now = Date.now();
      const chunkLatency = now - lastEventTime;
      lastEventTime = now;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(line => line.trim());

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const dataStr = line.slice(6);

          // Handle [DONE] signal (OpenAI format)
          if (dataStr === '[DONE]') {
            console.log('\n\n✅ Received [DONE] signal');
            break;
          }

          try {
            const data = JSON.parse(dataStr);

            // Handle different response formats
            let content = null;

            if (data.content) {
              // Generic format
              content = data.content;
            } else if (data.choices?.[0]?.delta?.content) {
              // OpenAI format
              content = data.choices[0].delta.content;
            } else if (data.delta?.text) {
              // Anthropic format
              content = data.delta.text;
            }

            if (content) {
              process.stdout.write(content);
              fullResponse += content;
              tokenCount++;

              // Log latency for slow chunks
              if (chunkLatency > 500) {
                console.log(`\n⚠️  High latency: ${chunkLatency}ms\n`);
              }
            }

            if (data.done) {
              console.log('\n\n✅ Received done:true signal');
              break;
            }
          } catch (parseError) {
            console.error(`\n❌ Failed to parse SSE data: ${dataStr}`);
          }
        } else if (line.startsWith('event: ')) {
          const eventType = line.slice(7);
          console.log(`\n📡 Event: ${eventType}\n`);
        } else if (line.startsWith(':')) {
          // Comment, ignore
        } else if (line.trim()) {
          console.log(`\n⚠️  Unexpected line: ${line}\n`);
        }
      }
    }

    clearTimeout(timeoutId);

    // Print summary
    const duration = Date.now() - startTime;
    console.log('\n' + '─'.repeat(60));
    console.log('\n📊 Stream Statistics:\n');
    console.log(`  Duration: ${duration}ms`);
    console.log(`  Tokens received: ${tokenCount}`);
    console.log(`  Average latency: ${Math.round(duration / tokenCount)}ms/token`);
    console.log(`  Total characters: ${fullResponse.length}`);
    console.log(`  Words: ${fullResponse.split(/\s+/).length}`);

  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error('\n❌ Request timed out');
    } else {
      console.error('\n❌ Error:', error.message);
    }
    process.exit(1);
  }
}

// CLI entry point
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: npx tsx stream_tester.ts <endpoint> [prompt]');
    console.log('\nExamples:');
    console.log('  npx tsx stream_tester.ts http://localhost:3000/api/chat');
    console.log('  npx tsx stream_tester.ts https://api.example.com/stream "Hello"');
    process.exit(1);
  }

  const endpoint = args[0];
  const prompt = args[1];

  testSSEStream({ endpoint, prompt }).catch(console.error);
}

export { testSSEStream };
