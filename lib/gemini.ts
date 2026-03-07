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
    prompt: `<|begin_of_text|><|start_header_id|>user<|end_header_id|>\n${prompt}\n<|eot_id|><|start_header_id|>assistant<|end_header_id|>`,
    max_gen_len: maxTokens,
    temperature: temperature,
    top_p: 0.9
  });

  const command = new InvokeModelCommand({
    modelId: "meta.llama3-70b-instruct-v1:0",
    contentType: "application/json",
    accept: "application/json",
    body,
  });

  const response = await client.send(command);

  const decoded = JSON.parse(
    new TextDecoder().decode(response.body)
  );

  return {
    text: decoded.generation,
  };
}