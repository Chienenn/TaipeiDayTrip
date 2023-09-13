//url attraction id
const path = window.location.pathname.split("/");
const attractionId = path[path.length - 1];

document.addEventListener("DOMContentLoaded", function () {
  fetch(`/api/attraction/${attractionId}`)
    .then((response) => response.json())
    .then((data) => {
      const attractionName = data.data.name;
      const attractionDescription = data.data.description;
      const attractionAddress = data.data.address;
      const attractionTransport = data.data.transport;
      const attractionCategory = data.data.category;
      const attractionMrt = data.data.mrt;

      const attractionDetailElement =
        document.querySelector(".attraction-detail");
      const attractionDescriptionElement = document.querySelector(
        ".attraction-description"
      );
      const attractionAddressElement = document.querySelector(
        ".attraction-address"
      );
      const attractionTransportElement = document.querySelector(
        ".attraction-transport"
      );

      const infoContainer = document.querySelector(".attraction-info22");
      infoContainer.classList.add("attraction-info22");

      const infoString = `${attractionCategory} at ${attractionMrt}`;
      const infoElement = document.createElement("div");
      infoElement.textContent = infoString;
      infoElement.classList.add("attraction-info1");

      const nameElement = document.createElement("div");
      nameElement.textContent = attractionName;
      nameElement.classList.add("attraction-name");
      infoContainer.appendChild(infoElement);
      infoContainer.appendChild(nameElement);

      attractionDetailElement.appendChild(infoContainer);

      //text
      const descriptionElement = document.createElement("div");
      descriptionElement.textContent = attractionDescription;
      descriptionElement.classList.add("attraction-description2");
      attractionDescriptionElement.appendChild(descriptionElement);

      const addressElement = document.createElement("div");
      addressElement.textContent = attractionAddress;
      addressElement.classList.add("attraction-address2");
      attractionAddressElement.appendChild(addressElement);

      const transportElement = document.createElement("div");
      transportElement.textContent = attractionTransport;
      transportElement.classList.add("attraction-transport2");
      attractionTransportElement.appendChild(transportElement);
    })
    .catch((error) => {
      console.error("發生錯誤", error);
    });
});

//image
const prevButton = document.getElementById("left-btn");
const nextButton = document.getElementById("right-btn");
const dotIndicator = document.querySelector(".dot-box");

const dotss = dotIndicator.querySelectorAll(".dot");
console.log(dotss);

let images = [];
let dots = [];
let currentImageIndex = 0;

fetch(`/api/attraction/${attractionId}`)
  .then((response) => response.json())
  .then((data) => {
    const attractionImages = data.data.images;
    const totalImages = attractionImages.length;

    attractionImages.forEach((imageUrl, index) => {
      const imageElement = document.createElement("img");
      const imgContainer = document.querySelector(".img-container");
      imageElement.src = imageUrl;
      imageElement.classList.add("attraction-images");

      images.push(imageElement);

      if (index === 0) {
        imageElement.style.opacity = 1;
      } else {
        imageElement.style.opacity = 0;
      }

      imgContainer.appendChild(imageElement);
    });

    prevButton.addEventListener("click", prevImage);
    nextButton.addEventListener("click", nextImage);
    // dot
    for (let i = 0; i < totalImages; i++) {
      const dot = document.createElement("div");
      dot.classList.add("dot");
      dotIndicator.appendChild(dot);
      dots.push(dot);
    }

    dots[0].classList.add("active");
    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        currentImageIndex = index;

        imageatIndex(currentImageIndex);
      });
    });
  });

function prevImage() {
  images[currentImageIndex].style.opacity = 0;
  currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
  images[currentImageIndex].style.opacity = 1;

  updateDot();
}

function nextImage() {
  images[currentImageIndex].style.opacity = 0;
  currentImageIndex = (currentImageIndex + 1) % images.length;
  images[currentImageIndex].style.opacity = 1;

  updateDot();
}

function updateDot() {
  dots.forEach((dot, index) => {
    if (index === currentImageIndex) {
      dot.classList.add("active");
    } else {
      dot.classList.remove("active");
    }
  });
}

function imageatIndex(index) {
  images.forEach((image, i) => {
    if (i === index) {
      image.style.opacity = 1;
    } else {
      image.style.opacity = 0;
    }
  });

  updateDot();
}
//fee
function morning() {
  let feeCount = document.querySelector(".fee-count");
  feeCount.textContent = "新台幣2000元";
}

function afternoon() {
  let feeCount = document.querySelector(".fee-count");
  feeCount.textContent = "新台幣2500元";
}