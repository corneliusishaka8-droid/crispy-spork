// js/script.js

document.addEventListener('DOMContentLoaded', () => {
    // ────────────────────────────────────────────────
    //  MOBILE MENU (works on every page)
    // ────────────────────────────────────────────────
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.nav');

    if (menuToggle && nav) {
        menuToggle.addEventListener('click', () => {
            nav.classList.toggle('active');
        });

        // Close menu when clicking a link (mobile)
        document.querySelectorAll('.nav-list a').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    nav.classList.remove('active');
                }
            });
        });
    }

    // ────────────────────────────────────────────────
    //  PAGE-SPECIFIC INITIALIZATION
    // ────────────────────────────────────────────────
    if (document.getElementById('home-page'))      initDashboard();
    if (document.getElementById('expenses-page'))  initExpenses();
    if (document.getElementById('budget-page'))    initBudget();
    if (document.getElementById('invoices-page'))  initInvoices();
    if (document.getElementById('contact-page'))   initContact();
});

// ────────────────────────────────────────────────
//  DASHBOARD – Home page stats
// ────────────────────────────────────────────────
function initDashboard() {
    const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
    const budgets  = JSON.parse(localStorage.getItem('budgets')  || '{}');

    // Total spent
    const totalSpent = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
    document.getElementById('total-spent').textContent = `₦${totalSpent.toLocaleString()}`;

    // Transaction count
    document.getElementById('expenses-count').textContent = expenses.length;

    // Budget usage %
    let totalBudget = 0;
    let totalUsed   = 0;

    Object.keys(budgets).forEach(cat => {
        const budget = Number(budgets[cat]);
        totalBudget += budget;

        const spentInCat = expenses
            .filter(e => e.category === cat)
            .reduce((sum, e) => sum + Number(e.amount), 0);

        totalUsed += spentInCat;
    });

    const percent = totalBudget > 0 ? Math.min(100, Math.round((totalUsed / totalBudget) * 100)) : 0;
    document.getElementById('budget-used').textContent = `${percent}% of budget used`;
}

// ────────────────────────────────────────────────
//  EXPENSES page
// ────────────────────────────────────────────────
function initExpenses() {
    const form       = document.getElementById('expense-form');
    const tableBody  = document.getElementById('expense-list');
    const totalEl    = document.getElementById('total-expenses');

    let expenses = JSON.parse(localStorage.getItem('expenses') || '[]');

    function renderExpenses() {
        tableBody.innerHTML = '';
        let total = 0;

        expenses.forEach((exp, index) => {
            total += Number(exp.amount);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${exp.date || '—'}</td>
                <td>${exp.category}</td>
                <td>${exp.description}</td>
                <td>₦${Number(exp.amount).toLocaleString()}</td>
                <td><button class="delete-btn" data-index="${index}">Delete</button></td>
            `;
            tableBody.appendChild(row);
        });

        totalEl.textContent = `₦${total.toLocaleString()}`;
    }

    // Add expense
    if (form) {
        form.addEventListener('submit', e => {
            e.preventDefault();

            const newExpense = {
                date:        document.getElementById('date').value,
                category:    document.getElementById('category').value,
                description: document.getElementById('description').value.trim(),
                amount:      document.getElementById('amount').value
            };

            expenses.push(newExpense);
            localStorage.setItem('expenses', JSON.stringify(expenses));
            renderExpenses();
            form.reset();
        });
    }

    // Delete expense
    if (tableBody) {
        tableBody.addEventListener('click', e => {
            if (e.target.classList.contains('delete-btn')) {
                const index = parseInt(e.target.dataset.index);
                expenses.splice(index, 1);
                localStorage.setItem('expenses', JSON.stringify(expenses));
                renderExpenses();
            }
        });
    }

    renderExpenses();
}

// ────────────────────────────────────────────────
//  BUDGET page
// ────────────────────────────────────────────────
function initBudget() {
    const form         = document.getElementById('budget-form');
    const list         = document.getElementById('budget-list');
    const overallBar   = document.getElementById('overall-progress');
    const overallText  = document.getElementById('overall-text');

    let budgets = JSON.parse(localStorage.getItem('budgets') || '{}');
    const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');

    function renderBudgets() {
        list.innerHTML = '';

        let totalBudget = 0;
        let totalUsed   = 0;

        Object.entries(budgets).forEach(([category, amount]) => {
            const spent = expenses
                .filter(e => e.category === category)
                .reduce((sum, e) => sum + Number(e.amount), 0);

            const percent = amount > 0 ? Math.min(100, Math.round((spent / amount) * 100)) : 0;
            totalBudget += Number(amount);
            totalUsed   += spent;

            const card = document.createElement('div');
            card.style.cssText = `
                background: white; padding: 1.2rem; border-radius: 10px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            `;
            card.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <strong>${category}</strong>
                    <span>₦${Number(amount).toLocaleString()}</span>
                </div>
                <div style="margin:0.8rem 0; background:#e2e8f0; height:10px; border-radius:5px; overflow:hidden;">
                    <div style="height:100%; background:#3b82f6; width:${percent}%; transition:width 0.4s;"></div>
                </div>
                <div style="font-size:0.9rem; color:#64748b;">
                    Spent: ₦${spent.toLocaleString()} (${percent}%)
                </div>
            `;
            list.appendChild(card);
        });

        const overallPercent = totalBudget > 0 ? Math.round((totalUsed / totalBudget) * 100) : 0;
        overallBar.style.width = `${overallPercent}%`;
        overallText.textContent = `${overallPercent}% of total budget used (${totalUsed.toLocaleString()} / ${totalBudget.toLocaleString()})`;
    }

    if (form) {
        form.addEventListener('submit', e => {
            e.preventDefault();
            const category = document.getElementById('budget-category').value;
            const amount   = document.getElementById('budget-amount').value;

            if (category && amount) {
                budgets[category] = Number(amount);
                localStorage.setItem('budgets', JSON.stringify(budgets));
                renderBudgets();
                form.reset();
            }
        });
    }

    renderBudgets();
}

// ────────────────────────────────────────────────
//  INVOICES page
// ────────────────────────────────────────────────
function initInvoices() {
    const form       = document.getElementById('invoice-form');
    const itemsCont  = document.getElementById('invoice-items-container');
    const addBtn     = document.getElementById('add-item-btn');
    const preview    = document.getElementById('invoice-preview');
    const previewCont= document.getElementById('preview-content');
    const printBtn   = document.getElementById('print-btn');

    let itemCount = 0;

    function addItemRow() {
        itemCount++;
        const div = document.createElement('div');
        div.className = 'form-row';
        div.innerHTML = `
            <div style="flex:2;">
                <label>Description</label>
                <input type="text" class="item-desc" placeholder="e.g. Website Design & Development" required>
            </div>
            <div>
                <label>Quantity</label>
                <input type="number" class="item-qty" min="1" value="1" required>
            </div>
            <div>
                <label>Unit Price (₦)</label>
                <input type="number" class="item-price" min="100" step="100" required>
            </div>
            <div style="align-self:end;">
                <button type="button" class="remove-item-btn" style="background:#ef4444; color:white; border:none; padding:0.6rem 1rem; border-radius:6px; cursor:pointer;">Remove</button>
            </div>
        `;
        itemsCont.appendChild(div);

        div.querySelector('.remove-item-btn').addEventListener('click', () => {
            div.remove();
        });
    }

    if (addBtn) addBtn.addEventListener('click', addItemRow);

    // Add one empty row by default
    if (itemsCont) addItemRow();

    if (form) {
        form.addEventListener('submit', e => {
            e.preventDefault();

            const client   = document.getElementById('client-name').value.trim();
            const invNum   = document.getElementById('invoice-number').value.trim();
            const issue    = document.getElementById('issue-date').value;
            const due      = document.getElementById('due-date').value;
            const notes    = document.getElementById('notes').value.trim();

            let subtotal = 0;
            let itemsHTML = '';

            document.querySelectorAll('#invoice-items-container .form-row').forEach(row => {
                const desc  = row.querySelector('.item-desc').value.trim();
                const qty   = Number(row.querySelector('.item-qty').value);
                const price = Number(row.querySelector('.item-price').value);
                const total = qty * price;
                subtotal += total;

                itemsHTML += `
                    <tr>
                        <td>${desc}</td>
                        <td style="text-align:center;">${qty}</td>
                        <td style="text-align:right;">₦${price.toLocaleString()}</td>
                        <td style="text-align:right;">₦${total.toLocaleString()}</td>
                    </tr>
                `;
            });

            const vatRate = 0.075;
            const vat = subtotal * vatRate;
            const total = subtotal + vat;

            const html = `
                <div style="font-family:Arial,sans-serif; max-width:800px; margin:auto;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2rem;">
                        <div>
                            <h2 style="margin:0; color:#1e40af;">Ishaka Finance Hub</h2>
                            <p style="margin:0.3rem 0 0; color:#64748b;">Professional Invoicing • Lagos, Nigeria</p>
                        </div>
                        <div style="text-align:right;">
                            <h3 style="margin:0;">INVOICE</h3>
                            <p style="margin:0.3rem 0 0;">${invNum}</p>
                        </div>
                    </div>

                    <div style="display:flex; justify-content:space-between; margin-bottom:2rem;">
                        <div>
                            <strong>Bill To:</strong><br>
                            ${client}<br>
                        </div>
                        <div style="text-align:right;">
                            <strong>Issue Date:</strong> ${issue}<br>
                            <strong>Due Date:</strong> ${due}
                        </div>
                    </div>

                    <table style="width:100%; border-collapse:collapse; margin-bottom:2rem;">
                        <thead>
                            <tr style="background:#f1f5f9;">
                                <th style="padding:0.8rem; text-align:left;">Description</th>
                                <th style="padding:0.8rem;">Qty</th>
                                <th style="padding:0.8rem; text-align:right;">Unit Price</th>
                                <th style="padding:0.8rem; text-align:right;">Total</th>
                            </tr>
                        </thead>
                        <tbody>${itemsHTML}</tbody>
                    </table>

                    <div style="text-align:right; margin-bottom:1.5rem;">
                        <div>Subtotal: ₦${subtotal.toLocaleString()}</div>
                        <div>VAT (7.5%): ₦${vat.toLocaleString()}</div>
                        <div style="font-size:1.3rem; font-weight:bold; margin-top:0.8rem;">
                            Total: ₦${total.toLocaleString()}
                        </div>
                    </div>

                    ${notes ? `<div style="margin-top:2rem;"><strong>Notes:</strong><br>${notes.replace(/\n/g, '<br>')}</div>` : ''}
                </div>
            `;

            previewCont.innerHTML = html;
            preview.style.display = 'block';

            // Scroll to preview
            preview.scrollIntoView({ behavior: 'smooth' });
        });
    }

    if (printBtn) {
        printBtn.addEventListener('click', () => {
            const printContent = document.getElementById('preview-content').innerHTML;
            const win = window.open('', '', 'height=700,width=800');
            win.document.write(`
                <html>
                <head><title>Invoice</title></head>
                <body onload="window.print(); window.close();">
                    ${printContent}
                </body>
                </html>
            `);
            win.document.close();
        });
    }
}

// ────────────────────────────────────────────────
//  CONTACT page – simple simulation
// ────────────────────────────────────────────────
function initContact() {
    const form = document.getElementById('contact-form');
    const result = document.getElementById('form-result') || document.getElementById('contact-result');

    if (form && result) {
        form.addEventListener('submit', e => {
            e.preventDefault();

            const name = document.getElementById('contact-name')?.value.trim() || '';

            result.style.background = '#dcfce7';
            result.style.color = '#166534';
            result.style.border = '1px solid #86efac';
            result.textContent = `Thank you${name ? ' ' + name : ''}! Your message has been received. We'll get back to you soon.`;

            form.reset();

            setTimeout(() => {
                result.textContent = '';
                result.style.background = '';
                result.style.border = '';
            }, 8000);
        });
    }
}