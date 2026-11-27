document.addEventListener("DOMContentLoaded", () => {
  const WHATSAPP_NUMBER = "22664682596";
  const IMAGE_BASE = "";
  const FALLBACK_IMG = `${IMAGE_BASE}logos.webp`;
  const BRAND_NAME = "Phénix Pneu";
  const CART_STORAGE_KEY = "phenix_pneu_cart_v1";
  const CLEAR_CART_AFTER_WHATSAPP = true;
  const TOGGLEABLE_SECTIONS = ["about", "collect", "command", "avis"];

  const mainForm = document.querySelector(".order-form");
  const mainWaBtn = document.querySelector(".whatsapp-btn");

  const modal = document.getElementById("productModal");
  const modalImg = document.getElementById("modalProductImg");
  const modalMeta = document.getElementById("modalProductMeta");
  const modalTitle = document.getElementById("modalProductTitle");
  const modalPrice = document.getElementById("modalProductPrice");
  const modalDesc = document.getElementById("modalProductDesc");
  const modalQty = document.getElementById("modalProductQty");
  const modalNote = document.getElementById("modalProductNote");
  const modalAddCartBtn = document.getElementById("modalAddCartBtn");
  const modalFormBtn = document.getElementById("modalFormBtn");
  const modalWaBtn = document.getElementById("modalWaBtn");

  const modalZoomOverlay = document.getElementById("modalImageZoom");
  const modalZoomImg = document.getElementById("modalImageZoomImg");
  const closeModalZoomBtn = document.getElementById("closeModalZoom");

  const cartOpenBtn = document.getElementById("cart-open-btn");
  const cartDrawer = document.getElementById("cart-drawer");
  const cartBackdrop = document.getElementById("cart-backdrop");
  const cartCloseBtn = document.getElementById("cart-close-btn");
  const cartItemsEl = document.getElementById("cart-items");
  const cartTotalEl = document.getElementById("cart-total");
  const cartBadgeEl = document.getElementById("cart-badge");
  const cartFormBtn = document.getElementById("cart-form-btn");
  const cartWaBtn = document.getElementById("cart-wa-btn");
  const cartClearBtn = document.getElementById("cart-clear-btn");

  function cleanText(val, fallback = "-") {
    const str = String(val ?? "").trim();
    return str.length ? str : fallback;
  }

  function resolveImageUrl(imgPath) {
    try {
      return new URL(imgPath || FALLBACK_IMG, window.location.href).href;
    } catch (_) {
      return imgPath || FALLBACK_IMG;
    }
  }

  function openWhatsAppWithText(rawMessage) {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(rawMessage)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function activateCommandSection() {
    if (typeof window.phenixShowSection === "function") {
      window.phenixShowSection("command");
      return;
    }

    TOGGLEABLE_SECTIONS.forEach((id) => {
      const sec = document.getElementById(id);
      if (!sec) return;
      if (id === "command") {
        sec.classList.remove("hidden");
        sec.classList.add("active");
      } else {
        sec.classList.remove("active");
        sec.classList.add("hidden");
      }
    });
  }

  // 🔹 Synchronisation pause / reprise avec slidy.js
  let slidyPausedByCatalog = false;

  function notifySlidyOpen() {
    if (slidyPausedByCatalog) return;
    slidyPausedByCatalog = true;
    document.dispatchEvent(new CustomEvent("catalog:modal-open"));
  }

  function notifySlidyCloseIfIdle() {
    const isZoomOpen = modalZoomOverlay && !modalZoomOverlay.classList.contains("hidden");
    const isModalOpen = modal && !modal.classList.contains("hidden");
    const isCartOpen = cartDrawer && !cartDrawer.classList.contains("hidden");
    if (isZoomOpen || isModalOpen || isCartOpen) return;
    if (!slidyPausedByCatalog) return;
    slidyPausedByCatalog = false;
    document.dispatchEvent(new CustomEvent("catalog:modal-close"));
  }

  // 🔹 Panier persistant
  let cart = [];
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) cart = parsed;
    }
  } catch (_) {
    cart = [];
  }

  function saveCart() {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (_) {}
  }

  function clearCart() {
    cart = [];
    saveCart();
    renderCart();
  }

  function getCartCount() {
    return cart.reduce((sum, item) => sum + Number(item.qty || 1), 0);
  }

  function formatCartSummary() {
    if (!cart.length) return "";
    return cart
      .map((item, idx) => {
        const notePart = item.note ? ` [${item.note}]` : "";
        return [
          `${idx + 1}. ${item.name}${notePart} — Qté : ${item.qty} (${item.priceLabel})`,
          `   Photo : ${resolveImageUrl(item.img)}`
        ].join("\n");
      })
      .join("\n");
  }

  function openCart() {
    if (!cartDrawer) return;
    cartDrawer.classList.remove("hidden");
    notifySlidyOpen();
  }

  function closeCart() {
    if (!cartDrawer) return;
    cartDrawer.classList.add("hidden");
    notifySlidyCloseIfIdle();
  }

  function addToCart(item, qty = 1, note = "", openAfter = false) {
    const cleanQty = Math.max(1, parseInt(qty, 10) || 1);
    const cleanNote = String(note || "").trim();
    const existing = cart.find(
      (entry) => entry.name === item.name && (entry.note || "") === cleanNote
    );

    if (existing) {
      existing.qty += cleanQty;
    } else {
      cart.push({
        name: item.name,
        category: item.category || "fauteuil",
        priceLabel: item.priceLabel || "Sur devis",
        img: item.img || FALLBACK_IMG,
        qty: cleanQty,
        note: cleanNote
      });
    }

    saveCart();
    renderCart();
    if (openAfter) openCart();
  }

  function updateCartQty(index, delta) {
    if (!cart[index]) return;
    const nextQty = cart[index].qty + delta;
    if (nextQty <= 0) cart.splice(index, 1);
    else cart[index].qty = nextQty;
    saveCart();
    renderCart();
  }

  function removeCartItem(index) {
    if (!cart[index]) return;
    cart.splice(index, 1);
    saveCart();
    renderCart();
  }

  function renderCart() {
    if (cartBadgeEl) cartBadgeEl.textContent = String(getCartCount());
    if (cartTotalEl) cartTotalEl.textContent = "Sur devis";
    if (!cartItemsEl) return;

    if (!cart.length) {
      cartItemsEl.innerHTML = `<p class="cart-empty">Votre panier est vide pour le moment.</p>`;
      return;
    }

    cartItemsEl.innerHTML = "";
    cart.forEach((item, index) => {
      const row = document.createElement("div");
      row.className = "cart-item";
      row.innerHTML = `
        <img src="${item.img}" alt="${item.name}" title="Cliquer pour agrandir">
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <p class="cart-item-meta">${item.priceLabel}${item.note ? ` • ${item.note}` : ""}</p>
          <div class="cart-qty-controls">
            <button type="button" class="qty-minus" aria-label="Diminuer la quantité">−</button>
            <span>${item.qty}</span>
            <button type="button" class="qty-plus" aria-label="Augmenter la quantité">+</button>
            <button type="button" class="cart-remove-btn" aria-label="Supprimer l'article">Supprimer</button>
          </div>
        </div>
      `;

      const img = row.querySelector("img");
      img?.addEventListener("error", () => {
        img.src = FALLBACK_IMG;
      });
      img?.addEventListener("click", (e) => {
        e.stopPropagation();
        openModalImageZoom(resolveImageUrl(item.img), item.name);
      });

      row.querySelector(".qty-minus").addEventListener("click", () => updateCartQty(index, -1));
      row.querySelector(".qty-plus").addEventListener("click", () => updateCartQty(index, 1));
      row.querySelector(".cart-remove-btn").addEventListener("click", () => removeCartItem(index));

      cartItemsEl.appendChild(row);
    });
  }

  cartOpenBtn?.addEventListener("click", openCart);
  cartCloseBtn?.addEventListener("click", closeCart);
  cartBackdrop?.addEventListener("click", closeCart);
  cartClearBtn?.addEventListener("click", clearCart);

  cartFormBtn?.addEventListener("click", () => {
    if (!cart.length || !mainForm) return;
    const qtyInput = mainForm.querySelector("#quantity");
    const detailsInput = mainForm.querySelector("#details");
    if (qtyInput) qtyInput.value = String(getCartCount());
    if (detailsInput) detailsInput.value = formatCartSummary();
    closeCart();
    activateCommandSection();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  cartWaBtn?.addEventListener("click", () => {
    if (!cart.length) return;
    const msg =
      `Bonjour *${BRAND_NAME}* (Ouagadougou), voici ma commande groupée :\n\n` +
      `${formatCartSummary()}`;
    openWhatsAppWithText(msg);
    if (CLEAR_CART_AFTER_WHATSAPP) clearCart();
  });

  // 🔹 Zoom plein écran (#modalImageZoom)
  function openModalImageZoom(src, altText = "") {
    if (!modalZoomOverlay || !modalZoomImg || !src) return;
    modalZoomImg.src = src;
    modalZoomImg.alt = altText || "Aperçu agrandi";
    modalZoomOverlay.classList.remove("hidden");
    modalZoomOverlay.setAttribute("aria-hidden", "false");
    notifySlidyOpen();
  }

  function closeModalImageZoom() {
    if (!modalZoomOverlay || !modalZoomImg) return;
    modalZoomOverlay.classList.add("hidden");
    modalZoomOverlay.setAttribute("aria-hidden", "true");
    modalZoomImg.src = "";
    notifySlidyCloseIfIdle();
  }

  modalImg?.addEventListener("click", (e) => {
    e.stopPropagation();
    openModalImageZoom(modalImg.currentSrc || modalImg.src, modalImg.alt);
  });

  closeModalZoomBtn?.addEventListener("click", closeModalImageZoom);

  modalZoomOverlay?.addEventListener("click", (e) => {
    if (e.target === modalZoomOverlay) {
      closeModalImageZoom();
    }
  });

  // 🔹 Extraction des données (carte catalogue OU slide du carrousel)
  let currentProduct = null;

  function detectCategoryFromText(text) {
    const lower = String(text || "").toLowerCase();
    if (lower.includes("chaise")) return "chaise";
    if (lower.includes("ensemble")) return "ensemble";
    if (lower.includes("etagere") || lower.includes("étagère")) return "etageres";
    if (lower.includes("pouf")) return "pouf";
    if (lower.includes("table")) return "table";
    if (lower.includes("niche")) return "niche";
    if (lower.includes("miroir")) return "miroir";
    if (lower.includes("jouet") || lower.includes("balançoire")) return "jouet";
    return "fauteuil";
  }

  function extractCardData(card) {
    const title = card.querySelector("h3")?.textContent?.trim() || "Création Phénix Pneu";
    const priceLabel = card.querySelector(".price")?.textContent?.trim() || "Sur devis";
    const imgEl = card.querySelector("img");
    const imgSrc = imgEl?.getAttribute("src") || FALLBACK_IMG;
    const category = card.dataset.productValue || card.dataset.category || detectCategoryFromText(title);
    const desc =
      card.dataset.desc ||
      "Création artisanale en pneu recyclé — choisissez votre quantité, ajoutez au panier ou commandez directement.";
    return { name: title, priceLabel, img: imgSrc, category, desc };
  }

  function extractSlideData(imgEl) {
    const imgSrc = imgEl?.getAttribute("src") || FALLBACK_IMG;
    const title = imgEl?.alt?.trim() || "Modèle phare Phénix Pneu";
    const priceLabel = imgEl?.dataset?.price?.trim() || "Sur devis";
    const category =
      imgEl?.dataset?.productValue ||
      detectCategoryFromText(`${title} ${imgSrc}`);
    const desc =
      imgEl?.dataset?.desc ||
      "Modèle phare fabriqué à la main à Ouagadougou — ajoutez au panier ou commandez via formulaire ou WhatsApp.";
    return { name: title, priceLabel, img: imgSrc, category, desc };
  }

  function fillFormFromProduct(product, qty = 1, note = "") {
    if (!mainForm) return;
    const selectEl = mainForm.querySelector("#product");
    const qtyEl = mainForm.querySelector("#quantity");
    const detailsEl = mainForm.querySelector("#details");

    if (selectEl) {
      const opt = Array.from(selectEl.options).find(
        (o) => o.value.toLowerCase() === product.category.toLowerCase()
      );
      if (opt) selectEl.value = opt.value;
    }
    if (qtyEl) qtyEl.value = String(qty);
    if (detailsEl) {
      const line =
        `Article : ${product.name} (Qté : ${qty}, ${product.priceLabel})\n` +
        `Photo : ${resolveImageUrl(product.img)}` +
        (note ? `\nInfos : ${note}` : "");
      detailsEl.value = detailsEl.value ? `${detailsEl.value}\n${line}` : line;
    }

    activateCommandSection();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function sendProductToWhatsApp(product, qty = 1, note = "") {
    const msg = [
      `Bonjour *${BRAND_NAME}*, je souhaite commander :`,
      `• *Produit :* ${product.name}`,
      `• *Quantité :* ${qty}`,
      `• *Prix :* ${product.priceLabel}`,
      `• *Photo :* ${resolveImageUrl(product.img)}`,
      note ? `• *Détails :* ${note}` : null
    ]
      .filter(Boolean)
      .join("\n");
    openWhatsAppWithText(msg);
  }

  function openProductModalWithData(productData) {
    if (!modal || !productData) return;
    currentProduct = productData;

    if (modalImg) {
      modalImg.src = currentProduct.img;
      modalImg.alt = currentProduct.name;
      modalImg.onerror = () => {
        modalImg.src = FALLBACK_IMG;
      };
    }
    if (modalMeta) modalMeta.textContent = `${BRAND_NAME} • ${currentProduct.category}`;
    if (modalTitle) modalTitle.textContent = currentProduct.name;
    if (modalPrice) modalPrice.textContent = currentProduct.priceLabel;
    if (modalDesc) modalDesc.textContent = currentProduct.desc;
    if (modalQty) modalQty.value = 1;
    if (modalNote) modalNote.value = "";

    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
    notifySlidyOpen();
  }

  function closeProductModal() {
    if (!modal) return;
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
    currentProduct = null;
    notifySlidyCloseIfIdle();
  }

  // Cartes du catalogue (.product-card)
  document.querySelectorAll(".product-card").forEach((card) => {
    const cardData = extractCardData(card);

    card.addEventListener("click", () => openProductModalWithData(cardData));

    card.querySelector(".btn-add-cart")?.addEventListener("click", (e) => {
      e.stopPropagation();
      addToCart(cardData, 1, "", true);
    });

    card.querySelector(".btn-form-order")?.addEventListener("click", (e) => {
      e.stopPropagation();
      fillFormFromProduct(cardData, 1, "");
    });

    card.querySelector(".btn-wa-order")?.addEventListener("click", (e) => {
      e.stopPropagation();
      sendProductToWhatsApp(cardData, 1, "");
    });
  });

  // Images défilantes du carrousel (.slidy .slide img) -> ouvre la carte modale avec les 3 options
  document.querySelectorAll(".slidy .slide img").forEach((slideImg) => {
    slideImg.addEventListener("click", (e) => {
      e.stopPropagation();
      const slideData = extractSlideData(slideImg);
      openProductModalWithData(slideData);
    });
  });

  modal?.querySelectorAll("[data-close-modal]").forEach((el) => {
    el.addEventListener("click", closeProductModal);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (modalZoomOverlay && !modalZoomOverlay.classList.contains("hidden")) {
        closeModalImageZoom();
      } else if (modal && !modal.classList.contains("hidden")) {
        closeProductModal();
      } else if (cartDrawer && !cartDrawer.classList.contains("hidden")) {
        closeCart();
      }
    }
  });

  modalAddCartBtn?.addEventListener("click", () => {
    if (!currentProduct) return;
    const qty = Math.max(1, parseInt(modalQty?.value, 10) || 1);
    const note = modalNote?.value?.trim() || "";
    const copy = { ...currentProduct };
    closeProductModal();
    addToCart(copy, qty, note, true);
  });

  modalFormBtn?.addEventListener("click", () => {
    if (!currentProduct) return;
    const qty = Math.max(1, parseInt(modalQty?.value, 10) || 1);
    const note = modalNote?.value?.trim() || "";
    const copy = { ...currentProduct };
    closeProductModal();
    fillFormFromProduct(copy, qty, note);
  });

  modalWaBtn?.addEventListener("click", () => {
    if (!currentProduct) return;
    const qty = Math.max(1, parseInt(modalQty?.value, 10) || 1);
    const note = modalNote?.value?.trim() || "";
    sendProductToWhatsApp(currentProduct, qty, note);
  });

  // 🔹 Bouton WhatsApp du formulaire principal (.whatsapp-btn)
  if (mainWaBtn && mainForm) {
    mainWaBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const values = Object.fromEntries(new FormData(mainForm));
      const hadCart = cart.length > 0;
      const lines = [
        `Bonjour *${BRAND_NAME}*, voici ma commande :`,
        "",
        `• *Nom :* ${cleanText(values.name)}`,
        `• *Prénom(s) :* ${cleanText(values.nickname)}`,
        `• *Téléphone :* ${cleanText(values.phone)}`,
        `• *Email :* ${cleanText(values.email)}`,
        `• *Produit :* ${cleanText(values.product)}`,
        `• *Quantité :* ${cleanText(values.quantity, hadCart ? String(getCartCount()) : "1")}`,
        `• *Détails :* ${cleanText(values.details)}`
      ];

      if (hadCart) {
        lines.push("", "--- *Articles dans le panier* ---", formatCartSummary());
      }

      openWhatsAppWithText(lines.join("\n"));
      if (hadCart && CLEAR_CART_AFTER_WHATSAPP) clearCart();
    });
  }

  renderCart();
});