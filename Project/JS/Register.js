let users = JSON.parse(localStorage.getItem("users")) || [];  // Lấy danh sách người dùng từ localStorage, hoặc khởi tạo với mảng rỗng  

// Hiển thị thông báo dạng Snackbar  
function showSnackbar(message, color) {  
    let snackbar = document.getElementById("snackbar");  
    snackbar.textContent = message; // Đặt nội dung thông báo  
    snackbar.style.backgroundColor = color; // Đặt màu nền  
    snackbar.className = "show"; // Thêm lớp "show" để hiển thị snackbar  
    setTimeout(function() {   
        snackbar.className = snackbar.className.replace("show", ""); // Ẩn snackbar sau 3 giây  
    }, 3000);  
}  

// Hàm đăng ký người dùng  
function register() {  
    let email = document.getElementById("email").value.trim(); // Lấy giá trị email và loại bỏ khoảng trắng  
    let password = document.getElementById("password").value; // Lấy giá trị mật khẩu  
    let confirmPassword = document.getElementById("confirmpassword").value; // Lấy giá trị xác nhận mật khẩu  
    let regex = /^[a-zA-Z0-9._%+-]+@(?:[a-zA-Z0-9-]+\.)+(com|vn)$/; // Biểu thức kiểm tra định dạng email  
    let id = users.length > 0 ? users[users.length - 1].id + 1 : 1; // Tạo ID mới cho người dùng  

    // Kiểm tra xem email có bị bỏ trống không  
    if (email === "") {  
        showSnackbar("Email không được để trống!", "red"); // Hiển thị lỗi nếu email bị bỏ trống  
    } else if (!regex.test(email)) { // Kiểm tra định dạng email  
        showSnackbar("Email không hợp lệ!", "red"); // Hiển thị lỗi nếu email không hợp lệ  
    } else if (users.some(user => user.email === email)) { // Kiểm tra xem email đã tồn tại chưa  
        showSnackbar("Email đã tồn tại!", "red"); // Hiển thị lỗi nếu email đã tồn tại  
    } else { // Nếu email hợp lệ, tiếp tục kiểm tra mật khẩu  
        // Kiểm tra xem mật khẩu có bị bỏ trống không  
        if (password === "") {  
            showSnackbar("Mật khẩu không được để trống!", "red"); // Hiển thị lỗi nếu mật khẩu bị bỏ trống  
        } else if (password.length < 6) { // Kiểm tra độ dài mật khẩu  
            showSnackbar("Mật khẩu tối thiểu 6 ký tự trở lên!", "red"); // Hiển thị lỗi nếu mật khẩu quá ngắn  
        } else if (password !== confirmPassword) { // Kiểm tra xem mật khẩu nhập lại có khớp không  
            showSnackbar("Mật khẩu không trùng khớp!", "red"); // Hiển thị lỗi nếu mật khẩu nhập lại không khớp  
        } else { // Nếu tất cả điều kiện hợp lệ, tiến hành đăng ký người dùng  
            let user = {  
                id: id,  
                email: email,  
                password: password  
            };  
            users.push(user); // Thêm người dùng mới vào danh sách  
            localStorage.setItem("users", JSON.stringify(users)); // Lưu danh sách người dùng vào localStorage  

            // Hiển thị thông báo đăng ký thành công  
            showSnackbar("Đăng ký thành công!", "blue");  
            setTimeout(() => {  
                window.location.href = "./Login.html"; // Chuyển hướng đến trang đăng nhập sau 3 giây  
            }, 3000);  
        }  
    }  
}  