import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

type GenerateTextArgs = {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
};

const client = new BedrockRuntimeClient({
  region: "ap-south-1",
});

export async function generateTextWithGemini(args: GenerateTextArgs) {
  const { prompt, maxTokens = 1024, temperature = 0.7 } = args;

  const body = JSON.stringify({
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: maxTokens,
    temperature,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const command = new InvokeModelCommand({
    modelId: "anthropic.claude-3-sonnet-20240229-v1:0",
    contentType: "application/json",
    accept: "application/json",
    body,
  });

  const response = await client.send(command);

  const decoded = JSON.parse(
    new TextDecoder().decode(response.body)
  );

  return {
    text: decoded.content[0].text,
  };
}