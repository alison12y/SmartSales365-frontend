// 🧪 Script de Test - Vinculación de Promociones a Productos
// Copiar y pegar en la consola del navegador (F12)

async function testVinculacionPromociones() {
  console.log("🚀 Iniciando tests de vinculación de promociones...\n");

  const token = localStorage.getItem("access");
  if (!token) {
    console.error("❌ No hay token de autenticación");
    return;
  }

  const BASE_URL = "http://localhost:8000/api/marketing";
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  try {
    // Test 1: Obtener promociones
    console.log("📋 TEST 1: Obtener promociones");
    const resPromos = await fetch(`${BASE_URL}/promociones/`, { headers });
    const promos = await resPromos.json();
    console.log("✅ Promociones:", promos.results?.length || 0);
    if (!promos.results?.length) {
      console.warn("⚠️ No hay promociones. Crea una primero.");
      return;
    }
    const promo = promos.results[0];
    console.log(`   Usando: "${promo.titulo}" (ID: ${promo.id})`);

    // Test 2: Obtener productos
    console.log("\n📦 TEST 2: Obtener productos");
    const resProds = await fetch("http://localhost:8000/api/catalog/productos/?page_size=100", { headers });
    const prods = await resProds.json();
    console.log("✅ Productos disponibles:", prods.results?.length || 0);
    if (!prods.results?.length) {
      console.warn("⚠️ No hay productos");
      return;
    }
    const product = prods.results[0];
    console.log(`   Usando: "${product.nombre}" (ID: ${product.id})`);

    // Test 3: Crear vinculación
    console.log("\n🔗 TEST 3: Crear vinculación producto-promoción");
    const body = {
      producto: product.id,
      promocion: promo.id,
    };
    console.log("📤 Enviando:", JSON.stringify(body, null, 2));
    const resVinculo = await fetch(`${BASE_URL}/producto-promocion/`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    const vinculo = await resVinculo.json();
    if (resVinculo.ok) {
      console.log("✅ Vinculación creada:", vinculo.id);
    } else {
      console.error("❌ Error:", vinculo);
      return;
    }

    // Test 4: Obtener promociones del producto
    console.log("\n🔍 TEST 4: Obtener promociones del producto");
    const resPromosProd = await fetch(
      `${BASE_URL}/producto-promocion/?producto=${product.id}`,
      { headers }
    );
    const promosProd = await resPromosProd.json();
    console.log("✅ Promociones del producto:", promosProd.results?.length);
    if (promosProd.results?.length > 0) {
      const pp = promosProd.results[0];
      console.log(`   - ${pp.promocion_titulo}`);
      console.log(`   - Descuento: ${pp.descuento_porcentaje || pp.descuento_fijo}${pp.descuento_porcentaje ? '%' : ' Bs.'}`);
    }

    // Test 5: Eliminar vinculación
    console.log("\n🗑️  TEST 5: Eliminar vinculación");
    const resDelete = await fetch(`${BASE_URL}/producto-promocion/${vinculo.id}/`, {
      method: "DELETE",
      headers,
    });
    if (resDelete.ok) {
      console.log("✅ Vinculación eliminada");
    } else {
      console.error("❌ Error al eliminar");
    }

    console.log("\n✨ TODOS LOS TESTS COMPLETADOS EXITOSAMENTE\n");
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// Ejecutar
testVinculacionPromociones();

// Alternativa: Para solo ver promociones y productos
async function verPromocionesYProductos() {
  const token = localStorage.getItem("access");
  const headers = { Authorization: `Bearer ${token}` };

  const promos = await fetch("http://localhost:8000/api/marketing/promociones/", { headers }).then(r => r.json());
  const prods = await fetch("http://localhost:8000/api/catalog/productos/?page_size=5", { headers }).then(r => r.json());

  console.log("📢 PROMOCIONES:");
  promos.results?.forEach(p => console.log(`  - ${p.titulo} (${p.descuento_porcentaje || p.descuento_fijo})`));

  console.log("\n📦 PRODUCTOS:");
  prods.results?.forEach(p => console.log(`  - ${p.nombre} (Bs. ${p.precio})`));
}

// Ejecutar con: verPromocionesYProductos()
