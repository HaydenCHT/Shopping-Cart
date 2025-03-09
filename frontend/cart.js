class ShoppingCart {
    constructor() {
        this.items = new Map();
        this.loadFromStorage();
        this.updateUI();
        this.bindEvents();
    }

    bindEvents() {
	document.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-list')) {
                const pid = e.target.dataset.pid;
                this.addItem(pid);
            }
    	});

        const cartContainer = document.querySelector('.shopping-list ul');
        cartContainer.addEventListener('click', (e) => {
            const li = e.target.closest('li');
            if (!li) return;
            const pid = li.dataset.pid;

            if (e.target.classList.contains('increment')) {
                const item = this.items.get(pid);
                this.updateQuantity(pid, item.quantity + 1);
            } else if (e.target.classList.contains('decrement')) {
                const item = this.items.get(pid);
                if (item.quantity > 1) {
                    this.updateQuantity(pid, item.quantity - 1);
                }
            } else if (e.target.classList.contains('remove-item')) {
                this.removeItem(pid);
            }
        });

        cartContainer.addEventListener('change', (e) => {
            if (e.target.classList.contains('quantity')) {
                const li = e.target.closest('li');
                const pid = li.dataset.pid;
                const quantity = parseInt(e.target.value, 10);
                if (quantity >= 1) {
                    this.updateQuantity(pid, quantity);
                }
            }
        });
    }

    addItem(pid) {
        if (this.items.has(pid)) {
            const item = this.items.get(pid);
            item.quantity++;
        } else {
            this.items.set(pid, { quantity: 1, price: 0, name: '' });
            this.fetchProductDetails(pid);
        }
        this.updateUI();
        this.saveToStorage();
    }

    updateQuantity(pid, quantity) {
        if (this.items.has(pid)) {
            this.items.get(pid).quantity = quantity;
            this.updateUI();
            this.saveToStorage();
        }
    }

    removeItem(pid) {
        this.items.delete(pid);
        this.updateUI();
        this.saveToStorage();
    }

    updateUI() {
        const container = document.querySelector('.shopping-list ul');
        container.innerHTML = '';
        let total = 0;

        this.items.forEach((item, pid) => {
            const template = document.getElementById('cart-item-template');
            const clone = template.content.cloneNode(true);
            const li = clone.querySelector('li');
            li.dataset.pid = pid;
            li.querySelector('.item-name').textContent = item.name;
            li.querySelector('.quantity').value = item.quantity;
            const subtotal = (item.price * item.quantity).toFixed(2);
            li.querySelector('.item-price').textContent = `$${subtotal}`;
            total += parseFloat(subtotal);
            container.appendChild(clone);
        });

        document.querySelector('.shopping-list h3').textContent = 
            `Shopping List (Total: $${total.toFixed(2)})`;
    }

    saveToStorage() {
        const data = Array.from(this.items.entries()).map(([pid, item]) => ({
            pid,
            quantity: item.quantity,
            price: item.price,
            name: item.name
        }));
        localStorage.setItem('shopping-cart', JSON.stringify(data));
    }

    loadFromStorage() {
        const data = JSON.parse(localStorage.getItem('shopping-cart')) || [];
        data.forEach(item => {
            this.items.set(item.pid, {
                quantity: item.quantity,
                price: item.price,
                name: item.name
            });
        });
    }

    async fetchProductDetails(pid) {
        try {
            const response = await fetch(`http://52.196.248.55:3000/api/product/${pid}`);
            if (!response.ok) throw new Error('Product not found');
            const product = await response.json();
            const item = this.items.get(pid);
            item.name = product.name;
            item.price = product.price;
            this.updateUI();
            this.saveToStorage();
        } catch (error) {
            console.error('Failed to fetch product:', error);
            this.items.delete(pid);
            this.updateUI();
            this.saveToStorage();
            alert('Failed to load product details');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const cart = new ShoppingCart();
});