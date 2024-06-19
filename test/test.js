const { GoogleGenerativeAI } = require("@google/generative-ai");

// Access your API key as an environment variable.
const genAI = new GoogleGenerativeAI("AIzaSyB62pmxP_NUEHMNAziX7qC_gHgc763q_Ho");

async function run() {
  // Choose a model that's appropriate for your use case.
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = "Write a story about a magic backpack.";

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();
  console.log(text);
}

run();
