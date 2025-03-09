document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const pid = urlParams.get('pid');

    if (!pid) {
        document.body.innerHTML = '<h1>Product not specified</h1>';
        return;
    }

    fetch(`http://52.196.248.55:3000/api/product/${pid}`)
        .then(response => response.json())
        .then(product => {
            document.getElementById('product-image').src = `/images/${product.pid}.jpg`;
            document.getElementById('product-name').textContent = product.name;
            document.getElementById('product-price').textContent = `$${product.price}`;
            document.getElementById('product-description').textContent = product.description;
            document.getElementById('add-to-cart-btn').dataset.pid = product.pid;

            fetch('http://52.196.248.55:3000/api/categories')
                .then(response => response.json())
                .then(categories => {
                    const category = categories.find(c => c.catid == product.catid);
                    document.getElementById('breadcrumb').innerHTML = `
                        <a href="/index.html">Home</a>
                        <span>></span>
                        <a href="/index.html?catid=${product.catid}">${category.name}</a>
                        <span>></span>
                        <a href="#">${product.name}</a>
                    `;
                });
        })
        .catch(error => {
            console.error('Error fetching product:', error);
            document.body.innerHTML = '<h1>Product not found</h1>';
        });

    fetch('http://52.196.248.55:3000/api/categories')
        .then(response => response.json())
        .then(categories => {
            const categoryList = document.getElementById('category-list');
            categories.forEach(category => {
                const li = document.createElement('li');
                li.innerHTML = `<a href="/index.html?catid=${category.catid}">${category.name}</a>`;
                categoryList.appendChild(li);
            });
        })
        .catch(error => console.error('Error fetching categories:', error));
});