<?php
// Desactivar despliegue de errores visibles para no revelar info técnica
header('Content-Type: application/json');

// 1. TU API KEY OCULTA EN EL SERVIDOR (Nadie puede verla desde el navegador)
const API_KEY = atob("Z3NrX2lyYWgwZHNscGlwZW5NSaFBHVUVrV0dkeWIzRllMNWRlTnJ4VVVvWmdrdjBVaGZzUXhFTVA=");
$apiUrl = 'https://api.groq.com/openai/v1/chat/completions';

// 2. Leer los datos enviados desde JavaScript (main.js)
$inputJSON = file_get_contents('php://input');
$inputData = json_decode($inputJSON, true);

if (!isset($inputData['userMessage'])) {
    echo json_encode(['error' => 'No se recibió ningún mensaje']);
    exit;
}

$userMessage = $inputData['userMessage'];
$contextoSeguro = isset($inputData['contexto']) ? $inputData['contexto'] : '';

// 3. Crear la estructura para enviar a Groq
$payload = [
    'model' => 'llama-3.3-70b-versatile',
    'messages' => [
        [
            'role' => 'system',
            'content' => "Eres BICAR-EDU, un asistente virtual hiper-especializado y cerrado exclusivamente al Cantón Babahoyo, provincia de Los Ríos, Ecuador.\n\n[REGLAS CRÍTICAS DE COMPORTAMIENTO]\n1. ÁMBITO GEOGRÁFICO ABSOLUTO: Tu único universo de conocimiento es Babahoyo. Si te preguntan algo ajeno, niégate amablemente diciendo: \"Solo respondo sobre el cantón Babahoyo y su patrimonio. ¿En qué te puedo ayudar sobre nuestra ciudad?\".\n2. PROHIBICION DE MARCAS: No menciones proyectos ni la frase \"Voces de Babahoyo\". Eres simplemente BICAR-EDU.\n\n[REGLAS ESTRICTAS DE FORMATO Y CONCISIÓN]\n1. BREVEDAD OBLIGATORIA: Respuestas de MÁXIMO 2 a 3 oraciones cortas (menos de 50 palabras en total).\n2. SIN RODEOS NI INTROS REPETITIVAS: PROHIBIDO decir \"¡Bienvenido! Estoy aquí para ayudarte...\", \"Babahoyo es una ciudad con una rica historia...\", o frases cliché de relleno. Responde directo a la pregunta del usuario.\n3. FORMATO MARKDOWN: Usa negritas (**texto**) para resaltar los términos clave de Babahoyo.\n4. TONO: Local, amigable, directo y educativo.\n\n[FUENTE DE INFORMACIÓN PRIORITARIA]\nContexto del PDF:\n" . $contextoSeguro
        ],
        [
            'role' => 'user',
            'content' => $userMessage
        ]
    ]
];

// 4. Petición cURL hacia Groq (Servidor a Servidor)
$ch = curl_init($apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $apiKey
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// 5. Retornar la respuesta al JavaScript
http_response_code($httpCode);
echo $response;
?>