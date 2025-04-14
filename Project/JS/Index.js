// 1. Khai báo biến toàn cục
let monthlyCategories = [];
let transactions = [];
let monthlyReports = [];
let remainingBalance = 0;
let userId = 1;
let currentEditIndex = -1;
let currentPage = 1;
let itemsPerPage = 5;

// 2. Chức năng đăng xuất
function exit() {
    let selectElement = document.getElementById("select");
    if (selectElement.value === "logout") {
        document.getElementById("confirmModal").style.display = "flex";
    }
}

function confirmLogout() {
    localStorage.removeItem("isLoggedIn");
    window.location.href = "login.html";
}

function closeModal() {
    document.getElementById("confirmModal").style.display = "none";
    document.getElementById("select").value = "";
}

// 3. Tải dữ liệu khi trang được tải
window.onload = function() {
    let savedMonthlyCategories = localStorage.getItem("monthlyCategories");
    let savedTransactions = localStorage.getItem("transactions");
    let savedMonthlyReports = localStorage.getItem("monthlyReports");

    if (savedMonthlyCategories) {
        monthlyCategories = JSON.parse(savedMonthlyCategories);
    }
    if (savedTransactions) {
        transactions = JSON.parse(savedTransactions);
    }
    if (savedMonthlyReports) {
        monthlyReports = JSON.parse(savedMonthlyReports);
    }

    checkAndUpdateBalance();
    loadCategories();
    loadCategoryOptions();
    displayTransactions();
    displayStatistics();

    document.querySelector(".month").addEventListener("change", function() {
        checkAndUpdateBalance();
        loadCategories();
        loadCategoryOptions();
        displayTransactions();
    });
};

// 4. Lưu ngân sách mới
document.getElementById("saveButton").onclick = function() {
    let moneyInput = document.querySelector(".money").value;
    let monthInput = document.querySelector(".month").value;

    if (!moneyInput) {
        alert("Vui lòng nhập số tiền.");
        return;
    }

    let budgetValue = parseInt(moneyInput);
    if (isNaN(budgetValue) || budgetValue <= 0) {
        alert("Vui lòng nhập số tiền hợp lệ.");
        return;
    }

    let existingMonthIndex = monthlyCategories.findIndex(entry => entry.month === monthInput);
    if (existingMonthIndex !== -1) {
        monthlyCategories[existingMonthIndex].amount = budgetValue;
    } else {
        let newId = (monthlyCategories.length + 1).toString();
        let budgetEntry = {
            id: newId,
            month: monthInput,
            categories: [],
            amount: budgetValue
        };
        monthlyCategories.push(budgetEntry);
    }

    localStorage.setItem("monthlyCategories", JSON.stringify(monthlyCategories));
    document.querySelector(".money").value = "";
    checkAndUpdateBalance();
    loadCategories();
    loadCategoryOptions();
    displayStatistics();
};

// 5. Quản lý danh mục
function loadCategories() {
    let monthInput = document.querySelector(".month").value;
    let table = document.getElementById("categoryTable");
    table.innerHTML = "";

    let monthEntry = monthlyCategories.find(entry => entry.month === monthInput);
    let categoriesToShow = monthEntry ? monthEntry.categories : [];

    categoriesToShow.forEach((category, i) => {
        let row = document.createElement("tr");
        let cell1 = document.createElement("td");
        cell1.textContent = `${category.name} - Giới hạn: ${category.budget.toLocaleString('vi-VN')} VND`;
        row.appendChild(cell1);

        let cell2 = document.createElement("td");
        let editButton = document.createElement("button");
        editButton.textContent = "Sửa";
        editButton.className = "edit-button";
        editButton.onclick = () => openEditForm(i);
        cell2.appendChild(editButton);
        row.appendChild(cell2);

        let cell3 = document.createElement("td");
        let deleteButton = document.createElement("button");
        deleteButton.textContent = "Xóa";
        deleteButton.className = "delete-button";
        deleteButton.onclick = () => deleteCategory(i);
        cell3.appendChild(deleteButton);
        row.appendChild(cell3);

        table.appendChild(row);
    });

    loadCategoryOptions();
}

function loadCategoryOptions() {
    let monthInput = document.querySelector(".month").value;
    let monthEntry = monthlyCategories.find(entry => entry.month === monthInput);
    let selectElement = document.getElementById("categorySelect");
    selectElement.innerHTML = '<option value="">Tiền chi tiêu</option>';

    if (monthEntry && monthEntry.categories.length > 0) {
        monthEntry.categories.forEach(category => {
            let option = document.createElement("option");
            option.value = category.name;
            option.textContent = category.name;
            selectElement.appendChild(option);
        });
    }
}

function getCategoryLimit(categoryName) {
    let monthInput = document.querySelector(".month").value;
    let monthEntry = monthlyCategories.find(entry => entry.month === monthInput);
    if (monthEntry) {
        let category = monthEntry.categories.find(cat => cat.name === categoryName);
        return category ? category.budget : 0;
    }
    return 0;
}

function addCategory() {
    let nameInput = document.getElementById("categoryName");
    let limitInput = document.getElementById("categoryLimit");
    let name = nameInput.value.trim();
    let limit = limitInput.value.trim();
    let monthInput = document.querySelector(".month").value;

    if (!name || !limit) {
        alert("Vui lòng nhập đầy đủ thông tin");
        return;
    }

    if (!monthInput) {
        alert("Vui lòng chọn tháng trước khi thêm danh mục");
        return;
    }

    let limitValue = parseInt(limit);
    if (isNaN(limitValue) || limitValue <= 0) {
        alert("Vui lòng nhập số tiền hợp lệ");
        return;
    }

    let monthEntry = monthlyCategories.find(entry => entry.month === monthInput);
    if (!monthEntry) {
        alert("Tháng này chưa được thiết lập ngân sách. Vui lòng thiết lập trước.");
        return;
    }

    // Kiểm tra số tiền còn lại của tháng
    if (limitValue > monthEntry.amount) {
        alert(`Số tiền giới hạn (${limitValue.toLocaleString('vi-VN')} VND) vượt quá số tiền còn lại của tháng (${monthEntry.amount.toLocaleString('vi-VN')} VND). Vui lòng nhập lại.`);
        return;
    }

    if (monthEntry.categories.some(cat => cat.name.toLowerCase() === name.toLowerCase())) {
        alert(`Danh mục "${name}" đã tồn tại trong tháng này. Vui lòng chọn tên khác.`);
        return;
    }

    let newCategory = {
        id: monthEntry.categories.length + 1,
        name: name,
        budget: limitValue
    };
    monthEntry.categories.push(newCategory);

    localStorage.setItem("monthlyCategories", JSON.stringify(monthlyCategories));
    loadCategories();
    nameInput.value = "";
    limitInput.value = "";
}
function openEditForm(index) {
    let monthInput = document.querySelector(".month").value;
    let monthEntry = monthlyCategories.find(entry => entry.month === monthInput);
    if (!monthEntry) {
        alert("Tháng này chưa được thiết lập ngân sách. Vui lòng thiết lập trước.");
        return;
    }

    currentEditIndex = index;
    document.getElementById("editCategoryName").value = monthEntry.categories[index].name;
    document.getElementById("editCategoryLimit").value = monthEntry.categories[index].budget;
    document.getElementById("editForm").style.display = "block";
}

function saveEditCategory() {
    let newName = document.getElementById("editCategoryName").value;
    let newLimit = document.getElementById("editCategoryLimit").value;
    let monthInput = document.querySelector(".month").value;

    if (!newName || !newLimit) {
        alert("Vui lòng nhập đầy đủ thông tin");
        return;
    }

    let limitValue = parseInt(newLimit);
    if (isNaN(limitValue) || limitValue <= 0) {
        alert("Vui lòng nhập số tiền hợp lệ");
        return;
    }

    let monthEntry = monthlyCategories.find(entry => entry.month === monthInput);
    if (!monthEntry) return;

    // Kiểm tra số tiền còn lại của tháng
    if (limitValue > monthEntry.amount) {
        alert(`Số tiền giới hạn (${limitValue.toLocaleString('vi-VN')} VND) vượt quá số tiền còn lại của tháng (${monthEntry.amount.toLocaleString('vi-VN')} VND). Vui lòng nhập lại.`);
        return;
    }

    let oldName = monthEntry.categories[currentEditIndex].name;
    monthEntry.categories[currentEditIndex].name = newName;
    monthEntry.categories[currentEditIndex].budget = limitValue;

    localStorage.setItem("monthlyCategories", JSON.stringify(monthlyCategories));
    loadCategories();
    document.getElementById("editForm").style.display = "none";
    alert(`Danh mục "${oldName}" đã được cập nhật thành "${newName}"!`);
}
function cancelEditCategory() {
    document.getElementById("editForm").style.display = "none";
}

function deleteCategory(index) {
    let monthInput = document.querySelector(".month").value;
    let monthEntry = monthlyCategories.find(entry => entry.month === monthInput);
    if (!monthEntry) return;

    let category = monthEntry.categories[index];
    let confirmation = confirm(`Bạn có chắc muốn xóa danh mục "${category.name}" với giới hạn ${category.budget.toLocaleString('vi-VN')} VND không?`);
    
    if (!confirmation) {
        return;
    }

    let relatedTransactions = transactions.filter(t => t.categoryId === category.id && 
        monthlyCategories.find(entry => entry.id === t.monthCategoryId.toString())?.month === monthInput);
    
    if (relatedTransactions.length > 0) {
        let deleteAll = confirm(`Danh mục "${category.name}" có ${relatedTransactions.length} giao dịch liên quan. Bạn có muốn xóa cả các giao dịch này không?`);
        
        if (deleteAll) {
            relatedTransactions.forEach(transaction => {
                let transactionIndex = transactions.findIndex(t => t.id === transaction.id);
                if (transactionIndex !== -1) {
                    transactions.splice(transactionIndex, 1);
                }
                
                let reportIndex = monthlyReports.findIndex(report => report.userId === userId && report.month === monthInput);
                if (reportIndex !== -1) {
                    let detailIndex = monthlyReports[reportIndex].details.findIndex(detail => detail.categoryId === transaction.categoryId);
                    if (detailIndex !== -1) {
                        monthlyReports[reportIndex].totalAmount -= transaction.amount;
                        monthlyReports[reportIndex].details[detailIndex].amount -= transaction.amount;
                        if (monthlyReports[reportIndex].details[detailIndex].amount <= 0) {
                            monthlyReports[reportIndex].details.splice(detailIndex, 1);
                        }
                        if (monthlyReports[reportIndex].totalAmount <= 0) {
                            monthlyReports.splice(reportIndex, 1);
                        }
                    }
                }
            });
            localStorage.setItem("transactions", JSON.stringify(transactions));
            localStorage.setItem("monthlyReports", JSON.stringify(monthlyReports));
        } else {
            return;
        }
    }

    monthEntry.categories.splice(index, 1);
    monthEntry.categories = monthEntry.categories.map((cat, idx) => ({
        id: idx + 1,
        name: cat.name,
        budget: cat.budget
    }));

    localStorage.setItem("monthlyCategories", JSON.stringify(monthlyCategories));
    loadCategories();
    checkAndUpdateBalance();
    displayTransactions();
    displayStatistics();
    alert(`Danh mục "${category.name}" đã được xóa thành công!`);
}

// 6. Quản lý giao dịch
function addTransaction() {
    let categoryInput = document.getElementById("categorySelect").value.trim();
    let amount = document.getElementById("transactionAmount").value;
    let note = document.getElementById("transactionNote").value;
    let monthInput = document.querySelector(".month").value;

    if (!categoryInput || !amount || !note) {
        alert("Vui lòng nhập đầy đủ thông tin");
        return;
    }

    if (!monthInput) {
        alert("Vui lòng chọn tháng trước khi thêm giao dịch");
        return;
    }

    let amountValue = parseInt(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
        alert("Vui lòng nhập số tiền hợp lệ.");
        return;
    }

    let monthEntry = monthlyCategories.find(entry => entry.month === monthInput);
    if (!monthEntry) {
        alert("Tháng này chưa được thiết lập ngân sách. Vui lòng thiết lập trước.");
        return;
    }

    let category = monthEntry.categories.find(cat => cat.name.toLowerCase() === categoryInput.toLowerCase());
    if (!category) {
        alert("Danh mục tiền chi tiêu không tồn tại. Vui lòng nhập lại !");
        return;
    }

    let transaction = {
        id: transactions.length + 1,
        date: new Date().toISOString().split('T')[0],
        amount: amountValue,
        description: note,
        categoryId: category.id,
        monthCategoryId: parseInt(monthEntry.id)
    };
    transactions.push(transaction);
    localStorage.setItem("transactions", JSON.stringify(transactions));

    updateMonthlyReports(monthInput, category.id, amountValue);
    checkCategoryLimit(category.id, amountValue);
    checkAndUpdateBalance();

    displayTransactions();
    displayStatistics();
    document.getElementById("categorySelect").value = "";
    document.getElementById("transactionAmount").value = "";
    document.getElementById("transactionNote").value = "";
}

function updateMonthlyReports(month, categoryId, amount) {
    let reportIndex = monthlyReports.findIndex(report => report.userId === userId && report.month === month);
    
    if (reportIndex === -1) {
        monthlyReports.push({
            userId: userId,
            month: month,
            totalAmount: amount,
            details: [{ categoryId: categoryId, amount: amount }]
        });
    } else {
        monthlyReports[reportIndex].totalAmount += amount;
        let detailIndex = monthlyReports[reportIndex].details.findIndex(detail => detail.categoryId === categoryId);
        
        if (detailIndex === -1) {
            monthlyReports[reportIndex].details.push({ categoryId: categoryId, amount: amount });
        } else {
            monthlyReports[reportIndex].details[detailIndex].amount += amount;
        }
    }
    
    localStorage.setItem("monthlyReports", JSON.stringify(monthlyReports));
}

function checkCategoryLimit(categoryId, amount) {
    let monthInput = document.querySelector(".month").value;
    let monthEntry = monthlyCategories.find(entry => entry.month === monthInput);
    if (!monthEntry) return;

    let matchedCategory = monthEntry.categories.find(cat => cat.id === categoryId);
    if (matchedCategory) {
        let totalSpent = transactions
            .filter(t => t.categoryId === categoryId && 
                monthlyCategories.find(entry => entry.id === t.monthCategoryId.toString())?.month === monthInput)
            .reduce((sum, t) => sum + t.amount, 0);
        
        let notificationElement = document.getElementById("notification");
        if (totalSpent > matchedCategory.budget) {
            notificationElement.innerHTML = `
                <p style="color: red"> Danh mục "${matchedCategory.name}" đã vượt giới hạn: 
                ${totalSpent.toLocaleString('vi-VN')} / ${matchedCategory.budget.toLocaleString('vi-VN')} VND</p>`;
        } else {
            notificationElement.innerHTML = "";
        }
    }
}

function checkAndUpdateBalance() {
    let monthInput = document.querySelector(".month").value;
    let monthEntry = monthlyCategories.find(entry => entry.month === monthInput);
    let budget = monthEntry ? monthEntry.amount : 0;

    let totalSpent = transactions
        .filter(t => {
            let transactionMonth = monthlyCategories.find(entry => entry.id === t.monthCategoryId.toString());
            return transactionMonth && transactionMonth.month === monthInput;
        })
        .reduce((sum, t) => sum + t.amount, 0);

    remainingBalance = budget - totalSpent;

    let changeElement = document.querySelector(".change");
    let notificationElement = document.getElementById("notification");

    if (remainingBalance < 0) {
        changeElement.textContent = `${remainingBalance.toLocaleString('vi-VN')} VND`;
        changeElement.style.color = "red";
        notificationElement.innerHTML = `<p style="color: red">Cảnh báo: Tổng chi tiêu vượt quá ngân sách: ${Math.abs(remainingBalance).toLocaleString('vi-VN')} VND</p>`;
    } else {
        changeElement.textContent = `${remainingBalance.toLocaleString('vi-VN')} VND`;
        changeElement.style.color = "green";
        notificationElement.innerHTML = `<p>Số dư còn lại: ${remainingBalance.toLocaleString('vi-VN')} VND</p>`;
    }
}

function displayTransactions(filteredTransactions = transactions) {
    let monthInput = document.querySelector(".month").value;
    let table = document.getElementById("transactionTable");
    table.innerHTML = "";

    let start = (currentPage - 1) * itemsPerPage;
    let end = start + itemsPerPage;

    let monthFilteredTransactions = filteredTransactions.filter(t => {
        let transactionMonth = monthlyCategories.find(entry => entry.id === t.monthCategoryId.toString());
        return transactionMonth && transactionMonth.month === monthInput;
    });

    let paginatedTransactions = monthFilteredTransactions.slice(start, end);
    let monthEntry = monthlyCategories.find(entry => entry.month === monthInput);
    let categories = monthEntry ? monthEntry.categories : [];

    paginatedTransactions.forEach((transaction, i) => {
        let globalIndex = start + i;
        let categoryName = categories.find(cat => cat.id === transaction.categoryId)?.name || "Không xác định";
        let row = document.createElement("tr");
        row.className = "lichsu";
        row.innerHTML = `<td>${categoryName} - ${transaction.description}: ${transaction.amount.toLocaleString('vi-VN')} VND </td>
                        <td><p onclick="deleteTransaction(${globalIndex})">Xóa</p></td>`;
        table.appendChild(row);
    });

    if (monthEntry) {
        monthEntry.categories.forEach(category => {
            checkCategoryLimit(category.id, 0);
        });
    }

    updatePagination(monthFilteredTransactions);
}

function updatePagination(filteredTransactions) {
    let totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    let pagination = document.getElementById("pagination");
    pagination.innerHTML = "";

    let prevButton = document.createElement("button");
    prevButton.textContent = "Previous";
    prevButton.className = "nav-button";
    prevButton.onclick = previousPage;
    prevButton.disabled = currentPage === 1;
    pagination.appendChild(prevButton);

    for (let i = 1; i <= totalPages; i++) {
        let pageButton = document.createElement("button");
        pageButton.textContent = i;
        pageButton.onclick = () => goToPage(i);
        if (i === currentPage) pageButton.className = "active";
        pagination.appendChild(pageButton);
    }

    let nextButton = document.createElement("button");
    nextButton.textContent = "Next";
    nextButton.className = "nav-button";
    nextButton.onclick = nextPage;
    nextButton.disabled = currentPage === totalPages;
    pagination.appendChild(nextButton);
}

function goToPage(page) {
    currentPage = page;
    displayTransactions();
}

function deleteTransaction(index) {
    let monthInput = document.querySelector(".month").value;
    let monthFilteredTransactions = transactions.filter(t => {
        let transactionMonth = monthlyCategories.find(entry => entry.id === t.monthCategoryId.toString());
        return transactionMonth && transactionMonth.month === monthInput;
    });

    let globalIndex = (currentPage - 1) * itemsPerPage + index;
    let transaction = monthFilteredTransactions[index];
    
    let confirmation = confirm(`Bạn có chắc muốn xóa giao dịch "${transaction.description}" với số tiền ${transaction.amount.toLocaleString('vi-VN')} VND không?`);
    
    if (!confirmation) {
        return;
    }

    let transactionIndex = transactions.findIndex(t => t.id === transaction.id);

    transactions.splice(transactionIndex, 1);
    localStorage.setItem("transactions", JSON.stringify(transactions));

    let reportIndex = monthlyReports.findIndex(report => report.userId === userId && report.month === monthInput);
    if (reportIndex !== -1) {
        let detailIndex = monthlyReports[reportIndex].details.findIndex(detail => detail.categoryId === transaction.categoryId);
        if (detailIndex !== -1) {
            monthlyReports[reportIndex].details[detailIndex].amount -= transaction.amount;
            monthlyReports[reportIndex].totalAmount -= transaction.amount;

            if (monthlyReports[reportIndex].details[detailIndex].amount <= 0) {
                monthlyReports[reportIndex].details.splice(detailIndex, 1);
            }

            if (monthlyReports[reportIndex].totalAmount <= 0) {
                monthlyReports.splice(reportIndex, 1);
            }
        }
    }
    localStorage.setItem("monthlyReports", JSON.stringify(monthlyReports));

    checkAndUpdateBalance();
    displayTransactions();
    displayStatistics();
    alert("Giao dịch đã được xóa thành công!");
}

function searchTransactions() {
    let searchTerm = document.getElementById("searchInput").value.toLowerCase().trim();
    let filteredTransactions = transactions.filter(t => t.description.toLowerCase().includes(searchTerm));

    if (filteredTransactions.length === 0) {
        document.getElementById("transactionTable").innerHTML = "<tr><td colspan='2'>Không tìm thấy giao dịch nào.</td></tr>";
        document.getElementById("pagination").innerHTML = "";
    } else {
        currentPage = 1;
        displayTransactions(filteredTransactions);
    }
}

function showSortModal() {
    document.getElementById("sortModal").style.display = "block";
}

function hideSortModal() {
    document.getElementById("sortModal").style.display = "none";
}

function sortTransactions(sortType) {
    if (!sortType) return;

    transactions.sort((a, b) => {
        if (sortType === "tăng") {
            return a.amount - b.amount;
        } else if (sortType === "giảm") {
            return b.amount - a.amount;
        }
        return 0;
    });

    currentPage = 1;
    displayTransactions();
    hideSortModal();
    alert(`Đã sắp xếp ${sortType} dần theo số tiền!`);
}

function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        displayTransactions();
    }
}

function nextPage() {
    if (currentPage < Math.ceil(transactions.length / itemsPerPage)) {
        currentPage++;
        displayTransactions();
    }
}

// 7. Thống kê chi tiêu các tháng
function displayStatistics(filteredReports = monthlyReports) {
    let table = document.getElementById("statisticsTable");
    table.innerHTML = `
        <tr>
            <td>Tháng</td>
            <td>Chi tiêu</td>
            <td>Ngân sách</td>
            <td>Trạng thái</td>
        </tr>
    `;

    monthlyCategories.forEach(monthEntry => {
        let report = filteredReports.find(r => r.month === monthEntry.month && r.userId === userId);
        let totalSpent = report ? report.totalAmount : 0;
        let budget = monthEntry.amount;
        let status = totalSpent <= budget ? "Đạt" : "Vượt";
        let statusClass = status === "Đạt" ? "status-green" : "status-red";
        let statusIcon = status === "Đạt" ? "✅" : " ";

        let row = document.createElement("tr");
        row.innerHTML = `
            <td>${monthEntry.month}</td>
            <td>${totalSpent.toLocaleString('vi-VN')} VND</td>
            <td>${budget.toLocaleString('vi-VN')} VND</td>
            <td class="${statusClass}">${statusIcon} ${status}</td>
        `;
        table.appendChild(row);
    });
}

function filterStatistics() {
    let filterValue = document.getElementById("statusFilter").value;
    let filteredReports = monthlyReports;

    if (filterValue !== "all") {
        filteredReports = monthlyReports.filter(report => {
            let monthEntry = monthlyCategories.find(entry => entry.month === report.month);
            if (!monthEntry) return false;
            let totalSpent = report.totalAmount;
            let budget = monthEntry.amount;
            let status = totalSpent <= budget ? "Đạt" : "Vượt";
            return filterValue === "đạt" ? status === "Đạt" : status === "Vượt";
        });
    }

    displayStatistics(filteredReports);
}