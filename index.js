const photoContainerEl = document.querySelector(".photo-container");
const photoEl = photoContainerEl.querySelector("img.photo");
const photographerNameEl = photoContainerEl.querySelector(
  "p.photographer_name span"
);
const buttonLikeEl = photoContainerEl.querySelector("button.button_like");
const counterLikeEL = photoContainerEl.querySelector("p.counter_likes span");
const historyEl = document.querySelector("div.history");

const showHistoryButtonEL = historyEl.querySelector("button.show_history");
const previousButtonEl = historyEl.querySelector("button.previous");
const nextButtonEl = historyEl.querySelector("button.next");

const key = "unsplashPhotos";
let localStorageData = JSON.parse(localStorage.getItem(key)) || [];

let liked = false;
let currentPhotoId;
let maxPhotoIndex;

render();

let indexGetter;
let activationHistoryButton = false;
let indexInHistory = -1;

buttonLikeEl.addEventListener("click", function () {
  if (indexInHistory >= 0) return;
  if (!liked) {
    const newQuantityLikes = ++localStorageData.findLast(
      (photo) => photo.id === currentPhotoId && !photo.you_liked
    ).likes;
    localStorageData.findLast(
      (photo) => photo.id === currentPhotoId && !photo.you_liked
    ).you_liked = true;
    saveDataToLocalStorage();
    counterLikeEL.textContent = newQuantityLikes;
    buttonLikeEl.textContent = "You liked!";
    buttonLikeEl.classList.add("clicked");
    liked = true;
  } else {
    const quantityLikes = --localStorageData.findLast(
      (photo) => photo.id === currentPhotoId && photo.you_liked
    ).likes;
    localStorageData.findLast(
      (photo) => photo.id === currentPhotoId && photo.you_liked
    ).you_liked = false;
    saveDataToLocalStorage();
    counterLikeEL.textContent = quantityLikes;
    buttonLikeEl.textContent = "Like";
    buttonLikeEl.classList.remove("clicked");
    liked = false;
  }
});

showHistoryButtonEL.addEventListener("click", function () {
  if (!activationHistoryButton) {
    previousButtonEl.classList.remove("invisible");
    nextButtonEl.classList.remove("invisible");
    activationHistoryButton = true;
  } else {
    previousButtonEl.classList.add("invisible");
    nextButtonEl.classList.add("invisible");
    activationHistoryButton = false;
  }
});

previousButtonEl.addEventListener("click", function (e) {
  let num = indexGetter.decrement();
  if (num < 0) {
    num = 0;
    indexGetter.increment();
    e.target.classList.add("inactive");
    setTimeout(() => {
      e.target.classList.remove("inactive");
    }, 500);
    return;
  }
  showHistoryPhoto(num);
  e.target.classList.remove("inactive");
  if (localStorageData[num].you_liked) {
    addPhotoToLocalStorage(localStorageData[num], true, true);
  } else {
    addPhotoToLocalStorage(localStorageData[num]);
  }

  indexInHistory = num;
});

nextButtonEl.addEventListener("click", function (e) {
  let num = indexGetter.increment();
  if (num > localStorageData.length - 1) {
    num = localStorageData.length - 1;
    indexGetter.decrement();
    e.target.classList.add("inactive");
    setTimeout(() => {
      e.target.classList.remove("inactive");
    }, 500);
    return;
  }
  showHistoryPhoto(num);
  e.target.classList.remove("inactive");
  localStorageData[num].you_liked
    ? addPhotoToLocalStorage(localStorageData[num], true, true)
    : addPhotoToLocalStorage(localStorageData[num]);
  indexInHistory = num;
});

async function fetchRandomPhoto() {
  const response = await fetch("https://api.unsplash.com/photos/random", {
    headers: {
      Authorization: "Client-ID ",
    },
  });

  if (!response.ok) {
    throw new Errror(`Error! Код статуса ${response.status} `);
  }
  return await response.json();
}

async function render() {
  const result = await fetchRandomPhoto();
  const a = localStorageData.indexOf(
    localStorageData.findLast(
      (photo) => photo.id === result.id && photo.you_liked
    )
  );
  const b = localStorageData.indexOf(
    localStorageData.findLast((photo) => photo.id === result.id)
  );
  if (a === b && a !== -1) {
    addPhotoToLocalStorage(result, true);

    counterLikeEL.textContent = localStorageData.findLast(
      (photo) => photo.id === currentPhotoId && photo.you_liked
    ).likes;
    buttonLikeEl.textContent = "You liked!";
    buttonLikeEl.classList.add("clicked");
    liked = true;
  } else {
    addPhotoToLocalStorage(result);
    counterLikeEL.textContent = result.likes;
    liked = false;
  }
  indexGetter = createIndexForHistory(maxPhotoIndex);
  photoEl.setAttribute("src", result.urls.regular);
  photoEl.setAttribute("alt", result.slug);
  photographerNameEl.textContent = result.user.name;
}

function createIndexForHistory(number) {
  return {
    value: number,
    increment() {
      return (this.value += 1);
    },
    decrement() {
      return (this.value -= 1);
    },
  };
}

function showHistoryPhoto(photoIndex) {
  photoEl.setAttribute("src", localStorageData[photoIndex].urls.regular);
  photoEl.setAttribute("alt", localStorageData[photoIndex].slug);
  photographerNameEl.textContent = localStorageData[photoIndex].user.name;
  counterLikeEL.textContent = localStorageData[photoIndex].likes;

  if (localStorageData[photoIndex].you_liked) {
    buttonLikeEl.textContent = "You liked!";
    buttonLikeEl.classList.add("clicked");
  } else {
    buttonLikeEl.textContent = "Like";
    buttonLikeEl.classList.remove("clicked");
  }
}

function addPhotoToLocalStorage(
  newPhoto,
  _you_liked = false,
  _historyLikesCorrection = false
) {
  const newPhotoObject = {
    id: newPhoto.id,
    urls: {
      regular: newPhoto.urls.regular,
    },
    slug: newPhoto.slug,
    user: {
      name: newPhoto.user.name,
    },
    likes: newPhoto.likes + _you_liked - _historyLikesCorrection,
    you_liked: _you_liked,
  };
  currentPhotoId = newPhoto.id;
  localStorageData.push(newPhotoObject);
  maxPhotoIndex = localStorageData.length - 1;
  saveDataToLocalStorage();
}

function saveDataToLocalStorage() {
  localStorage.setItem(key, JSON.stringify(localStorageData));
}
