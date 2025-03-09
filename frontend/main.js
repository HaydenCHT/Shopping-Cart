document.addEventListener('DOMContentLoaded', () => {
    fetch('http://52.196.248.55:3000/api/categories')
        .then(response => response.json())
        .then(categories => {
            const categoryList = document.getElementById('category-list');
            categories.forEach(category => {
                const li = document.createElement('li');
                li.innerHTML = `<a href="#" data-catid="${category.catid}">${category.name}</a>`;
                categoryList.appendChild(li);
            });

            const firstCategory = categories[0]?.catid || 1;
            loadProducts(firstCategory, categories);
        })
        .catch(error => console.error('Error fetching categories:', error));

    document.getElementById('category-list').addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
            e.preventDefault();
            const catid = e.target.dataset.catid;
            loadProducts(catid);
        }
    });
});

function loadProducts(catid, categories = null) {
    fetch(`http://52.196.248.55:3000/api/products?catid=${catid}`)
        .then(response => response.json())
        .then(products => {
            const container = document.getElementById('product-container');
            container.innerHTML = '';
            products.forEach(product => {
                const div = document.createElement('div');
                div.className = 'product';
                div.innerHTML = `
                    <a href="/product.html?pid=${product.pid}">
                        <img src="/images/${product.pid}-thumb.jpg" alt="${product.name}">
                        <h2>${product.name}</h2>
                    </a>
                    <p>$${product.price}</p>
                    <button class="add-to-list" data-pid="${product.pid}">Add to Cart</button>
                `;
                container.appendChild(div);
            });

            const breadcrumb = document.getElementById('breadcrumb');
            fetch('http://52.196.248.55:3000/api/categories')
                .then(response => response.json())
                .then(cats => {
                    const category = cats.find(c => c.catid == catid);
                    breadcrumb.innerHTML = `
                        <a href="/index.html">Home</a>
                        <span>></span>
                        <a href="#" data-catid="${catid}">${category.name}</a>
                    `;
                });
        })
        .catch(error => console.error('Error fetching products:', error));
}