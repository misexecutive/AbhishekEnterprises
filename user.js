// Replace with your deployed Apps Script Web App URL
const API_URL = 'https://script.google.com/macros/s/AKfycbxHdg1auYBlj94-kRPslawLBWZWT8zyzSvpP-CQ6ig3hwJ006r0SehE1cRqzHvGVRnoTw/exec';

let ITEMS = [];
let CART = [];

// DOM refs
const itemsStatus = document.getElementById('itemsStatus');
const itemsGrid = document.getElementById('itemsGrid');
const cartCount = document.getElementById('cartCount');
const cartDrawer = document.getElementById('cartDrawer');
const openCartBtn = document.getElementById('openCartBtn');
const closeCartBtn = document.getElementById('closeCartBtn');
const cartItemsContainer = document.getElementById('cartItemsContainer');
const requestForm = document.getElementById('requestForm');
const requestStatus = document.getElementById('requestStatus');

// Image modal
const imageModal = document.getElementById('imageModal');
const closeImageModal = document.getElementById('closeImageModal');
const modalMainImage = document.getElementById('modalMainImage');
const modalThumbs = document.getElementById('modalThumbs');

document.addEventListener('DOMContentLoaded', () => {
  loadItems();

  openCartBtn.addEventListener('click', () => {
    cartDrawer.classList.add('open');
    renderCart();
  });

  closeCartBtn.addEventListener('click', () => {
    cartDrawer.classList.remove('open');
  });

  requestForm.addEventListener('submit', submitRequest);

  closeImageModal.addEventListener('click', () => {
    imageModal.classList.remove('open');
  });

  imageModal.addEventListener('click', (e) => {
    if (e.target === imageModal) {
      imageModal.classList.remove('open');
    }
  });
});

function loadItems() {
  itemsStatus.textContent = 'Loading items...';

  fetch(API_URL + '?action=getItems')
    .then((res) => res.json())
    .then((data) => {
      if (!data.success) {
        itemsStatus.textContent = '❌ ' + (data.message || 'Unable to load items');
        return;
      }

      ITEMS = data.items || [];
      if (!ITEMS.length) {
        itemsStatus.textContent = 'No items available yet. Please check again later.';
        return;
      }

      itemsStatus.textContent = '';
      renderItems();
    })
    .catch((err) => {
      console.error(err);
      itemsStatus.textContent = '❌ Error: ' + err.message;
    });
}

function renderItems() {
  itemsGrid.innerHTML = '';

  ITEMS.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'item-card';

    const imgWrapper = document.createElement('div');
    imgWrapper.className = 'item-image-wrapper';

    const img = document.createElement('img');
    img.className = 'item-image';

    const firstImage = (item.images && item.images.length) ? item.images[0] : '';
    img.src = firstImage || 'https://via.placeholder.com/400x300?text=No+Image';

    imgWrapper.appendChild(img);

    if (item.images && item.images.length > 1) {
      const indicator = document.createElement('div');
      indicator.className = 'item-multi-indicator';
      indicator.textContent = item.images.length + ' photos';
      imgWrapper.appendChild(indicator);
    }

    imgWrapper.addEventListener('click', () => {
      openImageModal(item);
    });

    const body = document.createElement('div');
    body.className = 'item-body';

    const nameEl = document.createElement('div');
    nameEl.className = 'item-name';
    nameEl.textContent = item.name || 'Unnamed item';

    const descEl = document.createElement('div');
    descEl.className = 'item-desc';
    descEl.textContent =
      item.description || 'No description provided.';

    const actions = document.createElement('div');
    actions.className = 'item-actions';

    const addBtn = document.createElement('button');
    addBtn.className = 'btn';
    addBtn.style.padding = '6px 10px';
    addBtn.style.fontSize = '0.8rem';
    addBtn.textContent = 'Add to Cart';

    addBtn.addEventListener('click', () => {
      addToCart(item.id);
    });

    const viewBtn = document.createElement('button');
    viewBtn.className = 'btn btn-outline';
    viewBtn.style.padding = '6px 10px';
    viewBtn.style.fontSize = '0.8rem';
    viewBtn.textContent = 'View Photos';

    viewBtn.addEventListener('click', () => {
      openImageModal(item);
    });

    actions.appendChild(viewBtn);
    actions.appendChild(addBtn);

    body.appendChild(nameEl);
    body.appendChild(descEl);
    body.appendChild(actions);

    card.appendChild(imgWrapper);
    card.appendChild(body);

    itemsGrid.appendChild(card);
  });
}

function addToCart(itemId) {
  if (!CART.includes(itemId)) {
    CART.push(itemId);
    updateCartCount();
  }
}

function removeFromCart(itemId) {
  CART = CART.filter((id) => id !== itemId);
  updateCartCount();
  renderCart();
}

function updateCartCount() {
  cartCount.textContent = CART.length;
}

function renderCart() {
  cartItemsContainer.innerHTML = '';

  if (!CART.length) {
    const empty = document.createElement('div');
    empty.className = 'cart-empty';
    empty.textContent = 'No items in cart. Add some samples from the catalogue.';
    cartItemsContainer.appendChild(empty);
    return;
  }

  CART.forEach((id) => {
    const item = ITEMS.find((i) => String(i.id) === String(id));
    const row = document.createElement('div');
    row.className = 'cart-item-row';

    const name = document.createElement('div');
    name.className = 'cart-item-name';
    name.textContent = item ? item.name : 'Item #' + id;

    const btn = document.createElement('button');
    btn.className = 'btn btn-outline';
    btn.style.padding = '4px 10px';
    btn.style.fontSize = '0.75rem';
    btn.textContent = 'Remove';
    btn.addEventListener('click', () => removeFromCart(id));

    row.appendChild(name);
    row.appendChild(btn);

    cartItemsContainer.appendChild(row);
  });
}

// Submit sample request

function submitRequest(e) {
  e.preventDefault();
  requestStatus.textContent = '';

  if (!CART.length) {
    requestStatus.textContent = '❌ Please add at least one item to cart.';
    return;
  }

  const name = document.getElementById('custName').value.trim();
  const mobile = document.getElementById('custMobile').value.trim();
  const address = document.getElementById('custAddress').value.trim();

  if (!name || !mobile || !address) {
    requestStatus.textContent = '❌ Please fill all required fields.';
    return;
  }

  requestStatus.textContent = 'Submitting your request...';

  fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      action: 'submitRequest',
      name,
      mobile,
      address,
      items: CART
    })
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        requestStatus.textContent = '✅ Request submitted. We will dispatch your samples soon.';
        CART = [];
        updateCartCount();
        renderCart();
        requestForm.reset();
      } else {
        requestStatus.textContent = '❌ ' + (data.message || 'Failed to submit request.');
      }
    })
    .catch((err) => {
      console.error(err);
      requestStatus.textContent = '❌ Error: ' + err.message;
    });
}

// Image modal

function openImageModal(item) {
  const images = item.images || [];
  if (!images.length) return;

  modalMainImage.src = images[0];
  modalThumbs.innerHTML = '';

  images.forEach((url, index) => {
    const thumb = document.createElement('div');
    thumb.className = 'image-modal-thumb' + (index === 0 ? ' active' : '');
    const img = document.createElement('img');
    img.src = url;
    thumb.appendChild(img);

    thumb.addEventListener('click', () => {
      modalMainImage.src = url;
      document
        .querySelectorAll('.image-modal-thumb')
        .forEach((el) => el.classList.remove('active'));
      thumb.classList.add('active');
    });

    modalThumbs.appendChild(thumb);
  });

  imageModal.classList.add('open');
}
