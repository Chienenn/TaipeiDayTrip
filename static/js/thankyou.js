const url = location.href.split('=');
const orderNumber = url[1];

window.addEventListener('load', function () {
  let token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/';
  }
  fetch(`/api/order/${orderNumber}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })
    .then(function (response) {
      if (response.status === 500) {
        const result = document.querySelector('.result');
        result.textContent = '失敗，請保存此訂單號做詢問';
      }
      return response.json();
    })
    .then(function (data) {
      console.log(data);
      if (data.data !== null) {
        const result = document.querySelector('.result');
        result.textContent = '成功 !';
        const url = location.href.split('=');
        const orderNumber = url[1];
        const order_number = document.querySelector('.order_number');
        order_number.textContent = orderNumber;
      } else {
        const result = document.querySelector('.result');
        result.textContent = '失敗! 請保存此訂單編號詢問';
        const order_number = document.querySelector('.order_number');
        order_number.textContent = orderNumber;
        document.querySelector('.notice').style.display = 'none';
        document.querySelector('.headlin2').style.display = 'none';
      }
    });
});

const loginSignup = document.getElementById('login-signup');

loginSignup.addEventListener('click', () => {
  document.querySelector('.dialog-mask').style.display = 'flex';
  document.body.style.overflow = 'hidden';
});

loginSignup.addEventListener('click', () => {
  document.querySelector('.dialog-mask').style.display = 'flex';

  if (loginSignup.innerHTML === '登出系統') {
    document.querySelector('.dialog-mask').style.display = 'none';
    fetch(`/api/user/auth`, {
      method: 'DELETE',
    })
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        localStorage.removeItem('token');
        window.location.href = '/';
      });
  }
});

const logIn = document.querySelector('.login-btn');

logIn.addEventListener('click', (event) => {
  const email = document.querySelector('#email-login').value;
  const password = document.querySelector('#password-login').value;
  const loginInfo = {
    email: email,
    password: password,
  };
  fetch(`/api/user/auth`, {
    method: 'PUT',
    credentials: 'include',
    body: JSON.stringify(loginInfo),
    cache: 'no-cache',
    headers: new Headers({
      'Content-Type': 'application/json',
    }),
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      if (data.ok === true) {
        localStorage.setItem('token', data.token);
        location.reload();
      } else {
        let notice = document.querySelector('.notice-login');
        notice.textContent = data.message;
      }
    })
    .catch(function (error) {
      console.error('Login request error:', error);
    });
});

(function auth_user() {
  if (localStorage.getItem('token')) {
    let token = localStorage.getItem('token');
    const headers = new Headers({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });

    fetch(`/api/user/auth`, {
      method: 'GET',
      headers: headers,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data['data'] != null) {
          let button = document.querySelector('#login-signup');
          button.innerHTML = '登出系統';
        }
      });
  }
})();

const reservation = document.querySelector('.reservation');
reservation.addEventListener('click', () => {
  const token = localStorage.getItem('token');

  if (token) {
    window.location.href = '/booking';
  } else {
    document.querySelector('.dialog-mask').style.display = 'flex';
  }
});
