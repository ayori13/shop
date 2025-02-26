document.addEventListener('DOMContentLoaded', () => {
    const productForm = document.getElementById('product-form');
    const productFormContainer = document.getElementById('product-form-container');
    const addProductBtn = document.getElementById('add-product-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const categoriesContainer = document.getElementById('categories-container');
    const newCategoryInput = document.getElementById('new-category');
    const addCategoryBtn = document.getElementById('add-category-btn');
    const productList = document.createElement('div');
    productList.className = 'product-list';
    document.querySelector('.products-section').appendChild(productList);
  
    let isEditing = false;
  
    loadProducts();
  
    addProductBtn.addEventListener('click', () => {
      isEditing = false;
      productForm.reset();
      document.getElementById('form-title').textContent = 'Добавить новый товар';
      productFormContainer.classList.remove('hidden');
    });
  
    cancelBtn.addEventListener('click', () => {
      productFormContainer.classList.add('hidden');
    });
  
    productForm.addEventListener('submit', async (e) => {
      e.preventDefault();
  
      const productData = {
        name: document.getElementById('product-name').value,
        price: parseFloat(document.getElementById('product-price').value),
        description: document.getElementById('product-description').value,
        categories: Array.from(categoriesContainer.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value)
      };
  
      if (isEditing) {
        const productId = document.getElementById('product-id').value;
        await updateProduct(productId, productData);
      } else {
        await addProduct(productData);
      }
  
      productFormContainer.classList.add('hidden');
      loadProducts();
    });
  
    addCategoryBtn.addEventListener('click', () => {
      const categoryName = newCategoryInput.value.trim();
      if (categoryName) {
        addCategory(categoryName);
        newCategoryInput.value = '';
      }
    });
  
    async function loadProducts() {
      const response = await fetch('/api/products');
      const data = await response.json();
      renderProducts(data.products);
    }
  
    function renderProducts(products) {
      productList.innerHTML = '';
      products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
          <h3>${product.name}</h3>
          <p><strong>Цена:</strong> ${product.price.toFixed(2)} руб.</p>
          <p><strong>Описание:</strong> ${product.description}</p>
          <p><strong>Категории:</strong> ${product.categories.join(', ')}</p>
          <div class="product-actions">
            <button class="btn btn-edit" data-id="${product.id}">Редактировать</button>
            <button class="btn btn-delete" data-id="${product.id}">Удалить</button>
          </div>
        `;
        productList.appendChild(productCard);
      });
  
      document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', () => editProduct(btn.dataset.id));
      });
  
      document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', () => deleteProduct(btn.dataset.id));
      });
    }
  
    async function addProduct(productData) {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      return response.json();
    }
  
    async function editProduct(productId) {
      const response = await fetch(`/api/products/${productId}`);
      const product = await response.json();
  
      document.getElementById('product-id').value = product.id;
      document.getElementById('product-name').value = product.name;
      document.getElementById('product-price').value = product.price;
      document.getElementById('product-description').value = product.description;
  
      categoriesContainer.innerHTML = '';
      const allCategories = await loadCategories();
      allCategories.forEach(category => {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = category;
        checkbox.id = `category-${category}`;
        if (product.categories.includes(category)) {
          checkbox.checked = true;
        }
  
        const label = document.createElement('label');
        label.htmlFor = `category-${category}`;
        label.textContent = category;
  
        categoriesContainer.appendChild(checkbox);
        categoriesContainer.appendChild(label);
      });
  
      isEditing = true;
      document.getElementById('form-title').textContent = 'Редактировать товар';
      productFormContainer.classList.remove('hidden');
    }
  
    async function updateProduct(productId, productData) {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      return response.json();
    }
  
    async function deleteProduct(productId) {
      await fetch(`/api/products/${productId}`, { method: 'DELETE' });
      loadProducts();
    }
  
    async function loadCategories() {
      const response = await fetch('/api/categories');
      const data = await response.json();
      return data.categories;
    }
  
    function addCategory(categoryName) {
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = categoryName;
      checkbox.id = `category-${categoryName}`;
  
      const label = document.createElement('label');
      label.htmlFor = `category-${categoryName}`;
      label.textContent = categoryName;
  
      categoriesContainer.appendChild(checkbox);
      categoriesContainer.appendChild(label);
    }
  });