document.addEventListener("DOMContentLoaded", function () {
  const mrtContainer = document.getElementById("mrt-container");
  fetch("/api/mrts")
    .then((response) => response.json())
    .then((data) => {
      if (data.data) {
        data.data.forEach((mrt) => {
          const p = document.createElement("p");
          p.textContent = mrt;
          mrtContainer.appendChild(p);
        });
        const mrtNameElements = document.querySelectorAll("#mrt-container p");
        mrtNameElements.forEach((element) => {
          element.addEventListener("click", (event) => {
            keyword = event.target.textContent;
            searchInput.value = keyword;
            //searchByMRT();
            console.log("search by mrt ", keyword);
            searchInput.value = keyword;
            attractionsContainer.innerHTML = "";
            nextPage = 0;

            loadNextPage();
          });
        });
      } else {
        console.error("無法獲取站名");
      }
    })
    .catch((error) => {
      console.error("發生錯誤:", error);
    });
});

const mrtScrollContainer = document.querySelector(".mrt-scroll-container");

const leftBtn = document.getElementById("left-btn");
const rightBtn = document.getElementById("right-btn");

leftBtn.addEventListener("click", () => {
  mrtScrollContainer.scrollBy(-100, 0);
});

rightBtn.addEventListener("click", () => {
  mrtScrollContainer.scrollBy(100, 0);
});

////
let nextPage = 0; // 初始頁碼
let isLoading = false;
const attractionsContainer = document.getElementById("attractions");
const attractionsPerPage = 12;
let keyword = "";
let selectedMRT = "";
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
            const attractionContainer = document.createElement("div");
            attractionContainer.classList.add("attraction-container");

            let attractionID = attraction.id;

            // 超連結
            const attractionLink = document.createElement("a");
            attractionLink.href = `/attraction/${attractionID}`;
            attractionLink.classList.add("attraction-link");

            const image = document.createElement("img");
            const images = attraction.images;
            if (images && images.length > 0) {
              image.src = images[0];
              image.classList.add("attraction-image");
            }

            const title = document.createElement("div");
            title.textContent = attraction.name;
            title.classList.add("attraction-name");

            const infoContainer = document.createElement("div");
            infoContainer.classList.add("attraction-info");

            const mrt = document.createElement("span");
            mrt.textContent = attraction.mrt;
            mrt.classList.add("attraction-mrt");

            const cat = document.createElement("span");
            cat.textContent = attraction.category;
            cat.classList.add("attraction-cat");

            attractionContainer.appendChild(image);
            attractionContainer.appendChild(title);
            infoContainer.appendChild(mrt);
            infoContainer.appendChild(cat);
            attractionContainer.appendChild(infoContainer);

            // attractionContainer.appendChild(attractionLink);

            // attractionsContainer.appendChild(attractionContainer);
            attractionsContainer.appendChild(attractionLink);
            attractionLink.appendChild(attractionContainer);
          }
        });

        nextPage = data.nextPage; // 更新下一頁
        console.log("in function", nextPage);
        if (nextPage === null && attractionsContainer.children.length === 0) {
          const noResultsMessage = document.createElement("h3");
          noResultsMessage.textContent = "沒有搜尋結果";
          attractionsContainer.appendChild(noResultsMessage);
          window.removeEventListener("scroll", checkScroll);
        }
      } else {
        console.error("無法獲取景點");
      }

      isLoading = false;
    })
    .catch((error) => {
      console.error("發生錯誤:", error);
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
    console.log("window.innerHeight:", window.innerHeight);
    console.log("window.scrollY:", window.scrollY);
    console.log("document.body.offsetHeight:", document.body.offsetHeight);
    console.log(
      "Threshold for triggering scroll load:",
      document.body.offsetHeight - 100
    );
  }
}

window.addEventListener("scroll", checkScroll);

loadNextPage();

////搜尋
const searchBtn = document.getElementById("search-btn");
const searchInput = document.getElementById("search");

searchBtn
  .addEventListener("click", () => {
    if (isLoading) {
      return;
    }

    keyword = searchInput.value.trim();
    attractionsContainer.innerHTML = "";
    nextPage = 0;
    loadNextPage();
  })

  .catch((error) => {
    isLoading = false;
    console.error("發生錯誤:", error);
  });
