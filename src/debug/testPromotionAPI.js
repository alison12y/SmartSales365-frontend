// src/debug/testPromotionAPI.js
// 🧪 Script para probar la API de promociones

/**
 * ✅ Cómo usar este archivo:
 * 
 * 1. En la consola del navegador (F12), copia y pega cada función
 * 2. Ejecuta: testPromocionesAPI()
 * 3. Ve los resultados en console.log
 */

// Función para obtener headers con token
const getAuthHeaders = () => {
  const token = localStorage.getItem("access") || localStorage.getItem("token");
  console.log("🔐 Token encontrado:", token ? "✅ Sí" : "❌ No");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Función para obtener BASE_URL
const getBASE_URL = () => {
  const baseUrl = `${import.meta.env.VITE_API_URL}/marketing/`;
  console.log("📍 BASE_URL:", baseUrl);
  return baseUrl;
};

// Test 1: Verificar conexión
async function testConexion() {
  console.log("\n🧪 TEST 1: Verificar Conexión\n");
  try {
    const response = await fetch(`${getBASE_URL()}promociones/`, {
      method: "GET",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
    });

    console.log("Status:", response.status);
    console.log("OK:", response.ok);

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Respuesta:", data);
    } else {
      const error = await response.json();
      console.log("❌ Error:", error);
    }
  } catch (error) {
    console.error("❌ Error de conexión:", error);
  }
}

// Test 2: Crear promoción de prueba
async function testCrearPromocion() {
  console.log("\n🧪 TEST 2: Crear Promoción\n");

  const datosPromocion = {
    titulo: "Promoción Test " + new Date().getTime(),
    descripcion: "Esta es una promoción de prueba",
    descuento_porcentaje: 15,
    fecha_inicio: "2025-11-15",
    fecha_fin: "2025-11-30",
    estado: "activa",
  };

  console.log("📤 Datos a enviar:", datosPromocion);

  try {
    const response = await fetch(`${getBASE_URL()}promociones/`, {
      method: "POST",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(datosPromocion),
    });

    console.log("Status:", response.status);

    const data = await response.json();

    if (response.ok) {
      console.log("✅ Promoción creada:", data);
      return data.id;
    } else {
      console.log("❌ Error en respuesta:", data);
    }
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// Test 3: Verificar campos requeridos
async function testCamposRequeridos() {
  console.log("\n🧪 TEST 3: Probar sin Titulo (debe fallar)\n");

  const datosIncompletos = {
    // titulo: "Falta el título", ← SIN TÍTULO
    descripcion: "Test",
    descuento_porcentaje: 15,
    fecha_inicio: "2025-11-15",
    fecha_fin: "2025-11-30",
    estado: "activa",
  };

  console.log("📤 Datos incompletos:", datosIncompletos);

  try {
    const response = await fetch(`${getBASE_URL()}promociones/`, {
      method: "POST",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(datosIncompletos),
    });

    console.log("Status:", response.status);

    const data = await response.json();
    console.log("Respuesta:", data);

    if (!response.ok) {
      console.log("✅ Error esperado (título requerido):", data);
    }
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// Test 4: Probar con descuento fijo en lugar de porcentaje
async function testDescuentoFijo() {
  console.log("\n🧪 TEST 4: Crear Promoción con Descuento Fijo\n");

  const datosPromocion = {
    titulo: "Promo Fijo Test " + new Date().getTime(),
    descripcion: "Descuento de cantidad fija",
    descuento_fijo: 50, // En lugar de porcentaje
    fecha_inicio: "2025-11-15",
    fecha_fin: "2025-11-30",
    estado: "activa",
  };

  console.log("📤 Datos a enviar:", datosPromocion);

  try {
    const response = await fetch(`${getBASE_URL()}promociones/`, {
      method: "POST",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(datosPromocion),
    });

    console.log("Status:", response.status);

    const data = await response.json();

    if (response.ok) {
      console.log("✅ Promoción con descuento fijo creada:", data);
    } else {
      console.log("❌ Error:", data);
    }
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// Test 5: Verificar token
function testToken() {
  console.log("\n🧪 TEST 5: Verificar Token\n");

  const access = localStorage.getItem("access");
  const token = localStorage.getItem("token");

  console.log("localStorage.access:", access ? "✅ Existe" : "❌ No existe");
  console.log("localStorage.token:", token ? "✅ Existe" : "❌ No existe");

  if (access) {
    console.log("Token access (primeros 50 chars):", access.substring(0, 50) + "...");
  }

  if (token) {
    console.log("Token (primeros 50 chars):", token.substring(0, 50) + "...");
  }
}

// Función principal que ejecuta todos los tests
async function testPromocionesAPI() {
  console.log("\n" + "=".repeat(60));
  console.log("🚀 INICIANDO TESTS DE API DE PROMOCIONES");
  console.log("=".repeat(60));

  testToken();
  await testConexion();
  await testCrearPromocion();
  await testCamposRequeridos();
  await testDescuentoFijo();

  console.log("\n" + "=".repeat(60));
  console.log("✅ TESTS COMPLETADOS");
  console.log("=".repeat(60) + "\n");
}

// Copiar y pegar esto en la consola del navegador para ejecutar:
// testPromocionesAPI()

export {
  testPromocionesAPI,
  testConexion,
  testCrearPromocion,
  testCamposRequeridos,
  testDescuentoFijo,
  testToken,
};
