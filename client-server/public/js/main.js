document.addEventListener('DOMContentLoaded', () => {
    let products = [];
    let categories = [];
    let selectedCategory = null;

    // Генерация уникального userId для клиента
    const userId = Math.random().toString(36).substring(7);

    // Подключение к WebSocket с параметрами
    const ws = new WebSocket(`ws://localhost:8081?userType=Customer&userId=${userId}`);

    ws.onopen = () => {
        console.log('WebSocket соединение установлено');
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        switch(data.type) {
            case 'history':
                // Обработка истории сообщений
                data.data.forEach(message => {
                    appendMessage(message);
                });
                break;
            case 'message':
                // Обработка нового сообщения
                appendMessage(data.data);
                break;
        }
    };

    ws.onerror = (error) => {
        console.error('WebSocket Error:', error);
    };

    ws.onclose = (event) => {
        console.log('WebSocket соединение закрыто', event);
    };

    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');

    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const messageText = chatInput.value.trim();
        if (messageText) {
            // Отправка сообщения с новой структурой
            ws.send(JSON.stringify({
                user: 'Customer',
                message: messageText
            }));
            chatInput.value = '';
        }
    });

    const appendMessage = (message) => {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        
        // Форматирование сообщения с учетом новой структуры
        const displayName = message.userType || message.user || 'Аноним';
        const displayMessage = message.message || message.text;
        
        messageElement.textContent = `${displayName}: ${displayMessage}`;
        chatMessages.appendChild(messageElement);
        
        // Автоматическая прокрутка вниз
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    const fetchGraphQL = async (query, variables = {}) => {
        try {
            const response = await fetch('/graphql', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    query,
                    variables
                })
            });
    
            const result = await response.json();
    
            if (result.errors) {
                console.error('GraphQL Errors:', result.errors);
                return null;
            }
    
            return result.data;
        } catch (error) {
            console.error('Ошибка GraphQL:', error);
            return null;
        }
    };
    
    const fetchProducts = async () => {
        const query = `
            query {
                getAllProducts {
                    id
                    name
                    price
                    description
                    categories
                }
            }
        `;
        const data = await fetchGraphQL(query);
        
        if (data && data.getAllProducts) {
            products = data.getAllProducts;
            renderProducts(products);
        } else {
            console.error('Не удалось загрузить продукты');
        }
    };
    
    const fetchProductsByCategory = async (category) => {
        const query = `
            query GetProductsByCategory($category: String!) {
                getProductsByCategory(category: $category) {
                    id
                    name
                    price
                    description
                    categories
                }
            }
        `;
        const variables = { category };
        const data = await fetchGraphQL(query, variables);
        
        if (data && data.getProductsByCategory) {
            renderProducts(data.getProductsByCategory);
        } else {
            console.error('Не удалось загрузить продукты категории');
        }
    };

    const renderProducts = (productsToRender) => {
        const catalogElement = document.getElementById('product-catalog');
        catalogElement.innerHTML = '';
    
        if (productsToRender.length === 0) {
            const noProductsMessage = document.createElement('div');
            noProductsMessage.textContent = 'Товары не найдены';
            noProductsMessage.style.textAlign = 'center';
            noProductsMessage.style.width = '100%';
            catalogElement.appendChild(noProductsMessage);
            return;
        }
    
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
            productDescription.textContent = product.description || 'Описание отсутствует';
            productDescription.style.fontSize = '0.9em';
            productDescription.style.color = '#666';
            productDescription.style.marginTop = '10px';
    
            productInfo.appendChild(productName);
            productInfo.appendChild(productPrice);
            productInfo.appendChild(productDescription);
    
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