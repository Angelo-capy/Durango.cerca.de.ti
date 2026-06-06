const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.getRecommendation = async (userQuery, userLocation, comercios) => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
    Eres un asistente local experto en comercios de Durango, México.
    Tu objetivo es ayudar a los ciudadanos a encontrar lo que necesitan en su ciudad.
    
    Ubicación del usuario: ${JSON.stringify(userLocation)}
    
    Lista de comercios disponibles:
    ${JSON.stringify(comercios)}
    
    Pregunta del usuario: "${userQuery}"
    
    Instrucciones:
    1. Responde de forma amable y local.
    2. Recomienda comercios de la lista que coincidan con la búsqueda.
    3. Si hay varios, prioriza por cercanía o relevancia.
    4. Proporciona detalles útiles (nombre, dirección, qué venden).
    5. Si no hay nada relevante, dilo honestamente sin inventar.
    6. Responde en español.
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
};
