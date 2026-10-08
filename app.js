const PHONE = "573159468102";
const MENU_KEY = "kingWingsMenuV1";
const CART_KEY = "kingWingsCartV1";

const categories = [
  { id: "salchipapa", name: "Salchipapa", icon: "🍟", tone: "fries" },
  { id: "alitas", name: "Alitas", icon: "🍗", tone: "wings" },
  { id: "costi-alitas", name: "Costi-alitas", icon: "🥩", tone: "ribs" },
  { id: "bebidas-naturales", name: "Bebidas naturales", icon: "🍓", tone: "natural" },
  { id: "bebidas-con-licor", name: "Bebidas con licor", icon: "🍹", tone: "liquor" },
];

const defaultMenu = [
  { id: "salchi-clasica", category: "salchipapa", name: "Salchipapa clásica", description: "Papas, salchicha, queso y salsas de la casa.", price: 15000, emoji: "🍟" },
  { id: "salchi-mixta", category: "salchipapa", name: "Salchipapa mixta", description: "Pollo, salchicha, papas, queso y salsas.", price: 22000, emoji: "🍟" },
  { id: "salchi-king", category: "salchipapa", name: "Salchipapa KING", description: "La más grande: pollo, tocineta, queso y mucho sabor.", price: 28000, emoji: "🍟" },
  { id: "alitas-6", category: "alitas", name: "6 alitas", description: "Elige tu salsa favorita y acompáñalas con papas.", price: 18000, emoji: "🍗" },
  { id: "alitas-12", category: "alitas", name: "12 alitas", description: "Para compartir, con dos salsas a elección.", price: 32000, emoji: "🍗" },
  { id: "alitas-24", category: "alitas", name: "24 alitas", description: "El combo del parche, con papas y salsas.", price: 58000, emoji: "🍗" },
  { id: "costi-6", category: "costi-alitas", name: "Costi-alitas x6", description: "Costilla carnuda y alitas en salsa BBQ.", price: 23000, emoji: "🥩" },
  { id: "costi-12", category: "costi-alitas", name: "Costi-alitas x12", description: "Para dos: papas, ensalada y dos salsas.", price: 40000, emoji: "🥩" },
  { id: "costi-king", category: "costi-alitas", name: "Combo Costi KING", description: "Nuestra combinación especial para compartir.", price: 65000, emoji: "🥩" },
  { id: "limonada", category: "bebidas-naturales", name: "Limonada natural", description: "Refrescante, preparada al momento.", price: 7000, emoji: "🍓" },
  { id: "maracuya", category: "bebidas-naturales", name: "Jugo de maracuyá", description: "Natural y lleno de sabor tropical.", price: 8000, emoji: "🍓" },
  { id: "frutos-rojos", category: "bebidas-naturales", name: "Frutos rojos", description: "Una mezcla dulce y refrescante.", price: 9000, emoji: "🍓" },
  { id: "michelada", category: "bebidas-con-licor", name: "Michelada", description: "Cerveza preparada con el toque de la casa.", price: 11000, emoji: "🍹" },
  { id: "mojito", category: "bebidas-con-licor", name: "Mojito KING", description: "Hierbabuena, limón y la mejor actitud.", price: 16000, emoji: "🍹" },
  { id: "coctel", category: "bebidas-con-licor", name: "Cóctel tropical", description: "Fresco, frutal y con mucho ritmo.", price: 18000, emoji: "🍹" },
];

let menu = load(MENU_KEY, defaultMenu);
let cart = load(CART_KEY, []);
let editingId = null;

const $ = (selector) => document.querySelector(selector);
const money = (value) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);
const save = (key, value) => localStorage.setItem(key, JSON.stringify(value));
function load(key, fallback) {
  try { const stored = localStorage.getItem(key); return stored ? JSON.parse(stored) : structuredClone(fallback); }
  catch { return structuredClone(fallback); }
}
function escapeHTML(value) { return String(value).replace(/[&<>'"]/g, (char) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "'":"&#39;", '"':"&quot;" }[char])); }
function categoryById(id) { return categories.find((category) => category.id === id); }

function renderMenu() {
  const target = $("#menu-content");
  target.innerHTML = categories.map((category) => {
    const products = menu.filter((product) => product.category === category.id);
    return `<section class="menu-group" id="${category.id}" aria-labelledby="heading-${category.id}">
      <div class="menu-group-header"><span class="category-icon">${category.icon}</span><div><h3 id="heading-${category.id}">${category.name}</h3><span>${products.length ? `${products.length} opciones para elegir` : "Próximamente"}</span></div></div>
      <div class="product-grid">${products.map((product) => productCard(product, category.tone)).join("") || '<p class="empty-category">Pronto tendremos novedades en esta categoría.</p>'}</div>
    </section>`;
  }).join("");
}
function productCard(product, tone) {
  return `<article class="product-card">
    <div class="food-art tone-${tone}" aria-hidden="true"><span>${escapeHTML(product.emoji)}</span></div>
    <div class="product-body"><h4>${escapeHTML(product.name)}</h4><p>${escapeHTML(product.description)}</p><div class="product-bottom"><span class="price">${money(product.price)}</span><button class="add-button" type="button" data-add="${product.id}" aria-label="Agregar ${escapeHTML(product.name)}">+</button></div></div>
  </article>`;
}
function addToCart(id) {
  const item = cart.find((entry) => entry.id === id);
  if (item) item.quantity += 1;
  else cart.push({ id, quantity: 1 });
  save(CART_KEY, cart); renderCart(); showToast("Producto agregado al pedido");
}
function cartDetails() { return cart.map((entry) => ({ ...entry, product: menu.find((product) => product.id === entry.id) })).filter((entry) => entry.product); }
function renderCart() {
  const details = cartDetails();
  if (details.length !== cart.length) { cart = details.map(({ id, quantity }) => ({ id, quantity })); save(CART_KEY, cart); }
  const count = details.reduce((sum, entry) => sum + entry.quantity, 0);
  const total = details.reduce((sum, entry) => sum + entry.product.price * entry.quantity, 0);
  $("#cart-count").textContent = count;
  $("#cart-items").innerHTML = details.map(({ product, quantity }) => `<div class="cart-item">
    <div class="cart-item-icon">${escapeHTML(product.emoji)}</div><div><h3>${escapeHTML(product.name)}</h3><p>${money(product.price)}</p></div><button class="remove-button" type="button" data-remove="${product.id}">Eliminar</button>
    <div class="cart-controls"><div class="quantity-control"><button type="button" data-change="${product.id}" data-amount="-1" aria-label="Quitar una unidad">−</button><strong>${quantity}</strong><button type="button" data-change="${product.id}" data-amount="1" aria-label="Agregar una unidad">+</button></div><strong>${money(product.price * quantity)}</strong></div>
  </div>`).join("");
  $("#cart-total").textContent = money(total);
  $("#cart-empty").hidden = details.length > 0;
  $("#cart-footer").hidden = details.length === 0;
}
function changeQuantity(id, amount) {
  const item = cart.find((entry) => entry.id === id); if (!item) return;
  item.quantity += amount; if (item.quantity < 1) cart = cart.filter((entry) => entry.id !== id);
  save(CART_KEY, cart); renderCart();
}
function removeFromCart(id) { cart = cart.filter((entry) => entry.id !== id); save(CART_KEY, cart); renderCart(); showToast("Producto eliminado"); }
function showToast(message) { const toast = $("#toast"); toast.textContent = message; toast.classList.add("show"); clearTimeout(showToast.timeout); showToast.timeout = setTimeout(() => toast.classList.remove("show"), 2400); }
function openCart() { $("#cart-panel").classList.add("is-open"); $("#cart-panel").setAttribute("aria-hidden", "false"); $("#overlay").classList.add("is-visible"); }
function closeCart() { $("#cart-panel").classList.remove("is-open"); $("#cart-panel").setAttribute("aria-hidden", "true"); $("#overlay").classList.remove("is-visible"); }
function fillCategories() { $("#product-category").innerHTML = categories.map((category) => `<option value="${category.id}">${category.name}</option>`).join(""); }
function renderAdminTable() {
  $("#admin-products").innerHTML = menu.map((product) => `<tr><td>${escapeHTML(product.emoji)} ${escapeHTML(product.name)}</td><td>${escapeHTML(categoryById(product.category)?.name || "Sin categoría")}</td><td>${money(product.price)}</td><td><button class="table-action" data-edit="${product.id}" type="button">Editar</button><button class="table-action delete" data-delete="${product.id}" type="button">Eliminar</button></td></tr>`).join("");
}
function resetProductForm() { editingId = null; $("#product-form").reset(); $("#product-id").value = ""; $("#save-product").textContent = "Agregar producto"; $("#cancel-edit").hidden = true; }
function editProduct(id) {
  const product = menu.find((item) => item.id === id); if (!product) return;
  editingId = id; $("#product-id").value = id; $("#product-name").value = product.name; $("#product-category").value = product.category; $("#product-price").value = product.price; $("#product-description").value = product.description; $("#product-emoji").value = product.emoji; $("#save-product").textContent = "Guardar cambios"; $("#cancel-edit").hidden = false; $("#product-name").focus();
}
function saveProduct(event) {
  event.preventDefault();
  const product = { id: editingId || `custom-${Date.now()}`, name: $("#product-name").value.trim(), category: $("#product-category").value, price: Number($("#product-price").value), description: $("#product-description").value.trim(), emoji: $("#product-emoji").value };
  if (!product.name || !product.description || Number.isNaN(product.price) || product.price < 0) return;
  const isEditing = Boolean(editingId);
  if (isEditing) menu = menu.map((item) => item.id === editingId ? product : item); else menu.push(product);
  save(MENU_KEY, menu); renderMenu(); renderAdminTable(); resetProductForm(); showToast(isEditing ? "Producto actualizado" : "Producto agregado");
}
function deleteProduct(id) {
  const product = menu.find((entry) => entry.id === id); if (!product || !confirm(`¿Eliminar “${product.name}” del menú?`)) return;
  menu = menu.filter((entry) => entry.id !== id); cart = cart.filter((entry) => entry.id !== id); save(MENU_KEY, menu); save(CART_KEY, cart); renderMenu(); renderCart(); renderAdminTable(); if (editingId === id) resetProductForm(); showToast("Producto eliminado del menú");
}
function checkout(event) {
  event.preventDefault();
  const details = cartDetails(); if (!details.length) { $("#checkout-dialog").close(); openCart(); return; }
  const name = $("#customer-name").value.trim(); const address = $("#customer-address").value.trim(); const notes = $("#customer-notes").value.trim();
  const lines = details.map(({ product, quantity }) => `• ${quantity} x ${product.name} — ${money(product.price * quantity)}`);
  const total = details.reduce((sum, entry) => sum + entry.product.price * entry.quantity, 0);
  const message = ["¡Hola, KING WINGS! 👑🍗", "Quiero hacer este pedido:", "", ...lines, "", `*Total estimado: ${money(total)}*`, "", `*Nombre:* ${name}`, `*Dirección o mesa:* ${address}`, notes ? `*Notas:* ${notes}` : "", "", "Quedo atento/a a la confirmación. ¡Gracias!"].filter(Boolean).join("\n");
  window.open(`https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`, "_blank", "noopener");
  $("#checkout-dialog").close(); closeCart();
}

$("#menu-content").addEventListener("click", (event) => { const button = event.target.closest("[data-add]"); if (button) addToCart(button.dataset.add); });
$("#cart-items").addEventListener("click", (event) => { const change = event.target.closest("[data-change]"); const remove = event.target.closest("[data-remove]"); if (change) changeQuantity(change.dataset.change, Number(change.dataset.amount)); if (remove) removeFromCart(remove.dataset.remove); });
$("#open-cart").addEventListener("click", openCart); $("#close-cart").addEventListener("click", closeCart); $("#overlay").addEventListener("click", closeCart);
$("#start-checkout").addEventListener("click", () => { if (cart.length) $("#checkout-dialog").showModal(); }); $("#checkout-form").addEventListener("submit", checkout);
document.querySelectorAll(".dialog-close").forEach((button) => button.addEventListener("click", () => button.closest("dialog").close()));
$(".admin-trigger").addEventListener("click", () => { $("#admin-dialog").showModal(); });
$("#admin-login-form").addEventListener("submit", (event) => { event.preventDefault(); if ($("#admin-password").value === "KING2026") { $("#admin-login").hidden = true; $("#admin-content").hidden = false; renderAdminTable(); } else { showToast("Clave incorrecta. Prueba de nuevo."); } });
$("#product-form").addEventListener("submit", saveProduct); $("#cancel-edit").addEventListener("click", resetProductForm);
$("#admin-products").addEventListener("click", (event) => { const edit = event.target.closest("[data-edit]"); const del = event.target.closest("[data-delete]"); if (edit) editProduct(edit.dataset.edit); if (del) deleteProduct(del.dataset.delete); });
$("#reset-menu").addEventListener("click", () => { if (!confirm("¿Restaurar el menú original? Se eliminarán los cambios de este navegador.")) return; menu = structuredClone(defaultMenu); cart = []; save(MENU_KEY, menu); save(CART_KEY, cart); renderMenu(); renderCart(); renderAdminTable(); resetProductForm(); showToast("Menú original restaurado"); });
$("#year").textContent = new Date().getFullYear(); fillCategories(); renderMenu(); renderCart();
