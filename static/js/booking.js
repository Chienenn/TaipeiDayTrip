window.addEventListener('load', function () {
  let token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/';
  }

  fetch(`/api/booking`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      console.log(data);
      if (data.data !== null) {
        const title = document.querySelector('.title');
        title.textContent = data.data.attraction.name;
        const date = document.querySelector('.date');
        date.textContent = data.date;
        const time = document.querySelector('.time');
        if (data.time === 'morning') {
          data.time = '早上 9 點到下午 4 點';
        } else {
          data.time = '下午 2 點到晚上 9 點';
        }
        time.textContent = data.time;
        const price = document.querySelector('.price');
        price.textContent = '費用 : 新台幣 ' + data.price + ' 元';
        const totalFee = document.querySelector('.total-price');
        totalFee.textContent = '總價 : 新台幣 ' + data.price + ' 元';
        const address = document.querySelector('.address');
        address.textContent = data.data.attraction.address;
        const img = document.querySelector('.img');
        img.src = data.data.attraction.images;
      } else {
        document.querySelector('.section').style.display = 'none';
        document.querySelector('.member-info').style.display = 'none';
        document.querySelector('.credit-info').style.display = 'none';
        document.querySelector('.confirm').style.display = 'none';
        document.querySelector('.solid').style.display = 'none';
        document.querySelector('.solid1').style.display = 'none';
        document.querySelector('.solid2').style.display = 'none';
        document.querySelector('.confirm-btn').style.display = 'none';

        document.querySelector('.confirm').style.display = 'none';
        const empty = document.querySelector('.empty');
        let emptyTxt = document.createTextNode('目前沒有任何待預訂的行程');
        empty.appendChild(emptyTxt);

        const footer = document.getElementById('footer-div');
        footer.style.height = '500px';
      }
    });
});

const deleteBooking = document.querySelector('.icon_delete');

deleteBooking.addEventListener('click', () => {
  const token = localStorage.getItem('token');

  fetch(`/api/booking`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })
    .then(function (response) {
      //   console.log(response);
      return response.json();
    })
    .then(function (data) {
      location.reload();
    })
    .catch(function (error) {
      console.error('發生錯誤：', error);
    });
});

/// login...

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
          let name = document.querySelector('.name');
          name.textContent = data.data.data.name;

          let mail = document.getElementById('mail');
          mail.value = data.data.data.email;
          let nameInput = document.getElementById('name2');

          nameInput.value = data.data.data.name;
        }
      });
  }
})();
