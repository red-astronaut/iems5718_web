function updateUserInfo() {
    fetch('/currentUser')
        .then(response => response.json())
        .then(data => {
            const userEmail = document.getElementById('user-email');
            if (data.email) {
                userEmail.textContent = data.email;
            } else {
                userEmail.textContent = data.message;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            const userEmail = document.getElementById('user-email');
            userEmail.textContent = 'Please login';
        });
}

// 页面加载时更新用户信息
document.addEventListener('DOMContentLoaded', updateUserInfo);


// Azure
// function updateUserInfo() {
//     fetch('/currentUser', {
//         method: 'GET',
//         credentials: 'include',  // 确保发送 cookies
//         headers: {
//             'Accept': 'application/json',
//             'Content-Type': 'application/json'
//         }
//     })
//     .then(response => {
//         if (!response.ok) {
//             throw new Error('Network response was not ok');
//         }
//         return response.json();
//     })
//     .then(data => {
//         const userEmail = document.getElementById('user-email');
//         if (!userEmail) return;
        
//         if (data.email) {
//             userEmail.textContent = data.email;
//         } else {
//             userEmail.textContent = data.message || 'Please login';
//         }
//     })
//     .catch(error => {
//         console.error('Error:', error);
//         const userEmail = document.getElementById('user-email');
//         if (userEmail) {
//             userEmail.textContent = 'Please login';
//         }
//     });
// }

// // 页面加载时更新用户信息
// document.addEventListener('DOMContentLoaded', updateUserInfo);

// // 每30秒更新一次用户信息
// setInterval(updateUserInfo, 30000);