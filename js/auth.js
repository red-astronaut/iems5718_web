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


// Azure 的代码
// function updateUserInfo() {
//     fetch('/currentUser', {
//         method: 'GET',
//         credentials: 'include',  // 关键：确保发送 cookies
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
//             console.log('User email updated:', data.email); // 添加调试日志
//         } else {
//             userEmail.textContent = data.message || 'Please login';
//             console.log('No email found:', data.message); // 添加调试日志
//         }
//     })
//     .catch(error => {
//         console.error('Error fetching user info:', error);
//         const userEmail = document.getElementById('user-email');
//         if (userEmail) {
//             userEmail.textContent = 'Please login';
//         }
//     });
// }

// // 页面加载时更新用户信息
// document.addEventListener('DOMContentLoaded', updateUserInfo);

// // 可选：定期更新用户信息
// setInterval(updateUserInfo, 30000);
