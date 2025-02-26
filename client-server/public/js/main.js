document.addEventListener('DOMContentLoaded', () => {
    let products = [];
    let categories = [];
    let selectedCategory = null;

    const fetchProducts = async () => {
        try {
            const response = await fetch('/api/products');
            const data = await response.json();
            products = data.products;
            renderProducts(products);
        } catch (error) {
            console.error('Ошибка при получении товаров:', error);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/categories');
            const data = await response.json();
            categories = data.categories;
            renderCategories(categories);
        } catch (error) {
            console.error('Ошибка при получении категорий:', error);
        }
    };

    const fetchProductsByCategory = async (category) => {
        try {
            const response = await fetch(`/api/products/category/${category}`);
            const data = await response.json();
            renderProducts(data.products);
        } catch (error) {
            console.error('Ошибка при фильтрации товаров:', error);
        }
    };

    const renderProducts = (productsToRender) => {
        const catalogElement = document.getElementById('product-catalog');
        catalogElement.innerHTML = '';

        productsToRender.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';

            const productInfo = document.createElement('div');
            productInfo.className = 'product-info';

            const productName = document.createElement('h3');
            productName.className = 'product-name';
            productName.textContent = product.name;

            const productPrice = document.createElement('div');
            productPrice.className = 'product-price';
            productPrice.textContent = `${product.price.toLocaleString()} ₽`;

            const productDescription = document.createElement('p');
            productDescription.className = 'product-description';
            productDescription.textContent = product.description;

            const productCategories = document.createElement('div');
            productCategories.className = 'product-categories';

            product.categories.forEach(category => {
                const categorySpan = document.createElement('span');
                categorySpan.className = 'product-category';
                categorySpan.textContent = category;
                productCategories.appendChild(categorySpan);
            });

            productInfo.appendChild(productName);
            productInfo.appendChild(productPrice);
            productInfo.appendChild(productDescription);
            productInfo.appendChild(productCategories);

            productCard.appendChild(productInfo);
            catalogElement.appendChild(productCard);
        });
    };

    const renderCategories = (categoriesToRender) => {
        const categoriesListElement = document.getElementById('categories-list');
        categoriesListElement.innerHTML = '';

        const allCategoriesItem = document.createElement('li');
        allCategoriesItem.className = 'category-item active';
        allCategoriesItem.textContent = 'Все категории';
        allCategoriesItem.addEventListener('click', () => {
            selectCategory(null);
        });
        categoriesListElement.appendChild(allCategoriesItem);

        categoriesToRender.forEach(category => {
            const categoryItem = document.createElement('li');
            categoryItem.className = 'category-item';
            categoryItem.textContent = category;
            categoryItem.addEventListener('click', () => {
                selectCategory(category);
            });
            categoriesListElement.appendChild(categoryItem);
        });
    };

    const selectCategory = (category) => {
        selectedCategory = category;
        
        const categoryItems = document.querySelectorAll('.category-item');
        categoryItems.forEach(item => {
            if ((item.textContent === 'Все категории' && category === null) || 
                (item.textContent === category)) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        if (category) {
            fetchProductsByCategory(category);
        } else {
            renderProducts(products);
        }
    };

    fetchCategories();
    fetchProducts();
});