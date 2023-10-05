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
        const attractionId = document.querySelector('.attid');
        attractionId.textContent = data.data.attraction.id;
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

TPDirect.setupSDK(
  137089,
  'app_eQFg4aJmlExREKLzwSeaM23aQGdSyu3y8Hcc6bfhQnh3nvWS9ZawMNeOnma2',
  'sandbox'
);

TPDirect.card.setup({
  // Display ccv field
  fields: {
    number: {
      // css selector
      element: '#card-number',
      placeholder: '**** **** **** ****',
    },
    expirationDate: {
      // DOM object
      element: document.getElementById('card-expiration-date'),
      placeholder: 'MM / YY',
    },
    ccv: {
      element: '#card-ccv',
      placeholder: 'ccv',
    },
  },
  styles: {
    // Style all elements
    input: {
      color: 'gray',
    },
    // style focus state
    ':focus': {
      color: 'black',
    },
    // style valid state
    '.valid': {
      color: 'green',
    },
    // style invalid state
    '.invalid': {
      color: 'red',
    },
    // Media queries
    // Note that these apply to the iframe, not the root window.
    '@media screen and (max-width: 400px)': {
      input: {
        color: 'orange',
      },
    },
  },
  // 此設定會顯示卡號輸入正確後，會顯示前六後四碼信用卡卡號
  isMaskCreditCardNumber: true,
  maskCreditCardNumberRange: {
    beginIndex: 6,
    endIndex: 11,
  },
});

const submitButton = document.querySelector('.confirm-btn');
submitButton.setAttribute('disabled', true);
submitButton.style.backgroundColor = 'lightgray';
submitButton.style.cursor = 'default';
TPDirect.card.onUpdate(function (update) {
  // update.canGetPrime === true
  // --> you can call TPDirect.card.getPrime()
  if (update.canGetPrime === true) {
    // Enable submit Button to get prime.
    submitButton.removeAttribute('disabled', true);
    submitButton.style.backgroundColor = '#448899';
    submitButton.style.cursor = 'pointer';
  } else {
    // Disable submit Button to get prime.
    submitButton.setAttribute('disabled', true);
    submitButton.style.backgroundColor = 'lightgray';
    submitButton.style.cursor = 'default';
  }
});

const contactNotice = document.querySelector('.contact-notice');
submitButton.addEventListener(
  'click',
  (onSubmit = (event) => {
    event.preventDefault();
    const tappayStatus = TPDirect.card.getTappayFieldsStatus();
    const name = document.getElementById('name2').value;
    const email = document.getElementById('mail').value;
    const phone = document.getElementById('phone').value;
    if (tappayStatus.canGetPrime === false) {
      console.log('can not get prime');
      return;
    }
    if (phone === '') {
      contactNotice.textContent = '聯絡資訊不可為空 ! ';
      return;
    } else if (!/^[0-9]{4}[0-9]{3}[0-9]{3}$/.test(phone)) {
      contactNotice.textContent = '手機格式錯誤';
      return;
    }

    // Get prime
    TPDirect.card.getPrime((result) => {
      if (result.status !== 0) {
        console.log('get prime error ' + result.msg);
        return;
      }
      const prime = result.card.prime;

      const priceTxt = document.querySelector('.total-price').textContent;
      const priceTxts = priceTxt.match(/\d+/g);
      const price = priceTxts[0];

      const attractionId_str = document.querySelector('.attid').textContent;
      const attractionId = parseInt(attractionId_str, 10);
      console.log('attractionId', attractionId);

      const attractionName = document.querySelector('.title').textContent;
      const img = document.querySelector('.img').src;
      const address = document.querySelector('.address').textContent;
      const date = document.querySelector('.date').textContent;
      let time = document.querySelector('.time').textContent;
      if (time.indexOf('早上') !== -1) {
        time = 'morning';
      } else {
        time = 'afternoon';
      }

      let bookingData = {
        prime: prime,
        order: {
          price: price,
          trip: {
            attraction: {
              id: attractionId,
              name: attractionName,
              address: address,
              image: img,
            },
            date: date,
            time: time,
          },
          contact: {
            name: name,
            email: email,
            phone: phone,
          },
        },
      };

      let token = localStorage.getItem('token');

      fetch(`/api/orders`, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify(bookingData),
        cache: 'no-cache',
        headers: new Headers({
          'content-type': 'application/json',
          Authorization: `Bearer ${token}`,
        }),
      })
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          if (data.data.payment.status === 0) {
            console.log('data', data);
            const orderNumber = data.data.number;
            console.log('order num', orderNumber);
            window.location.href = `/thankyou?number=${orderNumber}`;
          } else {
            const orderNumber = data.data.number;
            window.location.href = `/thankyou?number=${orderNumber}`;
          }
        });
    });
  })
);
