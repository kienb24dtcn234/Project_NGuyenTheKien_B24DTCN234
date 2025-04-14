function login() {  
    // Lấy giá trị email và mật khẩu từ các ô nhập liệu  
    let email = document.getElementById("email").value.trim();  
    let password = document.getElementById("password").value;  
    
    // Lấy danh sách người dùng từ localStorage, nếu không có thì tạo một mảng rỗng  
    let users = JSON.parse(localStorage.getItem("users"));  
    if (users === null) {  
        users = [];  
    }  

    // Kiểm tra định dạng email có hợp lệ không  
    let regex = /^[a-zA-Z0-9._%+-]+@(?:[a-zA-Z0-9-]+\.)+(?:com|vn)$/;  
    if (regex.test(email) === false) {  
        showSnackbar("Cảnh báo: Email không đúng định dạng!");  
        return;  
    }  
    
    // Kiểm tra nếu mật khẩu bị bỏ trống  
    if (password === "") {  
        showSnackbar("Cảnh báo: Mật khẩu không được để trống!");  
        return;  
    }  

    // Kiểm tra thông tin đăng nhập trong danh sách người dùng  
    let userExists = false;  
    for (let i = 0; i < users.length; i++) {  
        if (users[i].email === email && users[i].password === password) {  
            userExists = true;  
            break;  
        }  
    }  

    // Nếu tìm thấy người dùng, hiển thị thông báo đăng nhập thành công và chuyển hướng  
    if (userExists) {  
        showSnackbar("Đăng nhập thành công!","Blue");  
        setTimeout(function() {  
            window.location.href = "./Index.html"; // Chuyển đến trang chủ sau 2 giây  
        }, 2000);  
    } else {  
        showSnackbar("Cảnh báo: Email hoặc Mật khẩu không đúng!","Red");
    }  
}  

function showSnackbar(message,color) {  
    // Lấy phần tử hiển thị thông báo  
    let x = document.getElementById("snackbar");  
    x.className = "show";  
    x.innerHTML = message; // Hiển thị nội dung thông báo 
    x.style.backgroundColor = color;
    setTimeout(function() {  
        x.className = x.className.replace("show", ""); // Ẩn thông báo sau 3 giây  
    }, 3000);  
}
