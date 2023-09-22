document.addEventListener('DOMContentLoaded', function () {
  const mrtContainer = document.getElementById('mrt-container');
  fetch('/api/mrts')
    .then((response) => response.json())
    .then((data) => {
      if (data.data) {
        data.data.forEach((mrt) => {
          const p = document.createElement('p');
          p.textContent = mrt;
          mrtContainer.appendChild(p);
        });
        const mrtNameElements = document.querySelectorAll('#mrt-container p');
        mrtNameElements.forEach((element) => {
          element.addEventListener('click', (event) => {
            keyword = event.target.textContent;
            searchInput.value = keyword;
            //searchByMRT();
            console.log('search by mrt ', keyword);
            searchInput.value = keyword;
            attractionsContainer.innerHTML = '';
            nextPage = 0;

            loadNextPage();
          });
        });
      } else {
        console.error('無法獲取站名');
      }
    })
    .catch((error) => {
      console.error('發生錯誤:', error);
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
        location.reload();
      });
  }
});

function clearInput() {
  document.querySelector('#name').value = '';
  document.querySelector('#email').value = '';
  document.querySelector('#password').value = '';

  document.querySelector('#password-login').value = '';
  document.querySelector('#email-login').value = '';

  document.querySelector('.notice-signup').textContent = '';
  document.querySelector('.notice-login').textContent = '';
}

const closeSignupBtn = document.querySelector('.icon-signup-close');
closeSignupBtn.addEventListener('click', () => {
  document.querySelector('.dialog-mask').style.display = 'none';
  document.querySelector('.dialog-signup').style.display = 'none';
  document.querySelector('.dialog-login').style.display = 'block';
  document.body.style.overflow = 'auto';
  clearInput();
});

const closeLoginBtn = document.querySelector('.icon-login-close');
closeLoginBtn.addEventListener('click', () => {
  document.querySelector('.dialog-mask').style.display = 'none';
  document.body.style.overflow = 'auto';
  clearInput();
});

const switchSignup = document.querySelector('.switch-signup');
switchSignup.addEventListener('click', () => {
  document.querySelector('.dialog-signup').style.display = 'flex';
  document.querySelector('.dialog-login').style.display = 'none';
  clearInput();
});

const switchLogin = document.querySelector('.switch-login');
switchLogin.addEventListener('click', () => {
  document.querySelector('.dialog-login').style.display = 'block';
  document.querySelector('.dialog-signup').style.display = 'none';
  clearInput();
});

const signup = document.querySelector('.signup-btn');

signup.addEventListener('click', (event) => {
  event.preventDefault();

  const name = document.querySelector('#name').value;
  const email = document.querySelector('#email').value;
  const password = document.querySelector('#password').value;
  const signupInfo = {
    name: name,
    email: email,
    password: password,
  };

  let notice = document.querySelector('.notice-alert');
  notice.textContent = '';
  notice = document.querySelector('.notice-signup');
  notice.textContent = '';

  fetch(`/api/user`, {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify(signupInfo),
    cache: 'no-cache',
    headers: new Headers({
      'content-type': 'application/json',
    }),
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      console.log(data);

      if (data.ok === true) {
        let notice = document.querySelector('.notice-alert');
        notice.textContent = '註冊成功 ! ';
      } else {
        let notice = document.querySelector('.notice-signup');
        notice.textContent = data.message;
      }
    });
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
    console.log('token', token);
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

/// mrt scroll...
const mrtScrollContainer = document.querySelector('.mrt-scroll-container');

const leftBtn = document.getElementById('left-btn');
const rightBtn = document.getElementById('right-btn');

leftBtn.addEventListener('click', () => {
  mrtScrollContainer.scrollBy(-100, 0);
});

rightBtn.addEventListener('click', () => {
  mrtScrollContainer.scrollBy(100, 0);
});

//// loading next page...
let nextPage = 0; // 初始頁碼
let isLoading = false;
const attractionsContainer = document.getElementById('attractions');
const attractionsPerPage = 12;
let keyword = '';
let selectedMRT = '';
let attractionID = 10;

function loadNextPage() {
  if (isLoading || nextPage === null) {
    return;
  }

  isLoading = true;

  fetch(
    `/api/attractions?page=${nextPage}&keyword=${encodeURIComponent(keyword)}`
  )
    .then((response) => response.json())
    .then((data) => {
      if (data.data) {
        data.data.forEach((attraction, index) => {
          if (index < attractionsPerPage) {
            const attractionContainer = document.createElement('div');
            attractionContainer.classList.add('attraction-container');

            let attractionID = attraction.id;

            // 超連結
            const attractionLink = document.createElement('a');
            attractionLink.href = `/attraction/${attractionID}`;
            attractionLink.classList.add('attraction-link');

            const image = document.createElement('img');
            const images = attraction.images;
            if (images && images.length > 0) {
              image.src = images[0];
              image.classList.add('attraction-image');
            }

            const title = document.createElement('div');
            title.textContent = attraction.name;
            title.classList.add('attraction-name');

            const infoContainer = document.createElement('div');
            infoContainer.classList.add('attraction-info');

            const mrt = document.createElement('span');
            mrt.textContent = attraction.mrt;
            mrt.classList.add('attraction-mrt');

            const cat = document.createElement('span');
            cat.textContent = attraction.category;
            cat.classList.add('attraction-cat');

            attractionContainer.appendChild(image);
            attractionContainer.appendChild(title);
            infoContainer.appendChild(mrt);
            infoContainer.appendChild(cat);
            attractionContainer.appendChild(infoContainer);

            attractionsContainer.appendChild(attractionLink);
            attractionLink.appendChild(attractionContainer);
          }
        });

        nextPage = data.nextPage; // next page
        console.log('in function', nextPage);
        if (nextPage === null && attractionsContainer.children.length === 0) {
          const noResultsMessage = document.createElement('h3');
          noResultsMessage.textContent = '沒有搜尋結果';
          attractionsContainer.appendChild(noResultsMessage);
          window.removeEventListener('scroll', checkScroll);
        }
      } else {
        console.error('無法獲取景點');
      }

      isLoading = false;
    })
    .catch((error) => {
      console.error('發生錯誤:', error);
      isLoading = false;
    });
}

function checkScroll() {
  if (isLoading) {
    return;
  }

  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
    console.log(nextPage);

    loadNextPage();
  }
}

window.addEventListener('scroll', checkScroll);

loadNextPage();

////search

const searchBtn = document.getElementById('search-btn');
const searchInput = document.getElementById('search');

searchBtn.addEventListener('click', () => {
  if (isLoading) {
    return;
  }

  keyword = searchInput.value.trim();
  attractionsContainer.innerHTML = '';
  nextPage = 0;
  loadNextPage();
});
