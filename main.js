"use strict";
const breedSelectForm = document.getElementById("breed-select-form");
const selectEl = document.getElementById("select-breed");
const breedInputForm = document.getElementById("breed-input-form");
const breedInput = document.getElementById("breed");
const outputBySelect = document.getElementById("output-by-select");
const outputByInput = document.getElementById("output-by-input");
const gallery = document.getElementById("gallery");
const galleryTitle = document.getElementById("gallery-title");
const galleryPageLimit = 6;
const galleryPagination = document.getElementById("gallery-pagination");
let currentPage = 1;
let urlChunks = [];

breedInputForm.addEventListener("submit", (e) => {
  getPictureByBreed(e, outputByInput);
});
breedSelectForm.addEventListener("submit", (e) => {
  getPictureByBreed(e, outputBySelect);
});

//get list of breeds and create select options
fetch("https://dog.ceo/api/breeds/list/all")
  .then((res) => {
    return res.json();
  })
  .then((data) => {
    if (data.status === "success") {
      console.log(data);
      for (let prop in data.message) {
        let breed = prop;
        let subbreedArr = data.message[breed];
        breed = capitalizeWord(breed);
        selectEl.innerHTML += `<option value=${breed}>${breed}</option>`;
        subbreedArr.forEach((subBreed) => {
          subBreed = capitalizeWord(subBreed);
          let breedAndSub = `${breed} ${subBreed}`;
          selectEl.innerHTML += `<option value="${breedAndSub}">${breedAndSub}</option>`;
        });
      }
    }
  })
  .catch((e) => {
    console.log(e);
  });

function getPictureByBreed(e, output) {
  //also finds if subbreed provided (2 words);
  e.preventDefault();
  let inputBreed = getFormData(e.target).breed.trim();
  let breed = inputBreed.toLowerCase().replace(" ", "/");
  if (!inputBreed) {
    output.innerHtml = `<span class="text-danger">Search field is empty</span>`;
    e.target.reset();
    return;
  }
  fetch(`https://dog.ceo/api/breed/${breed}/images/random`)
    .then((res) => {
      if (res.statusText === "Not Found") {
        output.innerHTML = `<span class="error-msg text-danger">Nuotrauka nerasta</span>`;
        e.target.reset();
        throw new Error("Nuotrauka nerasta");
      }
      return res.json();
    })
    .then((data) => {
      let html = `
         <img src="${data.message}" alt="${inputBreed} picture">
                    <div class="caption">
                        <p>I am ${capitalizeWord(inputBreed)}!</p>
                        <button onclick="createGallery('${inputBreed}','${breed}')" class="btn btn-success mb-4" type="button">Show more pictures</button>
                    </div>
        `;
      output.innerHTML = html;
    })
    .catch((e) => {
      console.log(e);
    });
}
function createGallery(inputBreed, breed) {
  gallery.innerHTML = "";
  galleryTitle.textContent = "";
  fetch(`https://dog.ceo/api/breed/${breed}/images`)
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      if (data.status === "success") {
        galleryTitle.innerHTML = `<a class="btn btn-success back-to-top" href="#top"><i class="fa fa-arrow-up" aria-hidden="true"></i> </a> ${capitalizeWord(inputBreed)}:`;
        if (data.message.length > galleryPageLimit) {
          urlChunks = arrayToChunks(data.message, galleryPageLimit);
          createPaginatedGallery(currentPage);
        } else {
          data.message.forEach((url, ind) => {
            let html = `<img class="gallery-item" src="${url}" alt="${capitalizeWord(inputBreed)} picture">`;

            gallery.innerHTML += html;
          });
        }
      }
    })
    .catch((e) => {
      console.log(e);
    });
}
function createPaginatedGallery(page) {
  currentPage = page;
  galleryPagination.innerHTML = ` <li id="prev" class="page-item ${page <= 1 ? "disabled" : ""}">
                        <button class="page-link" type="button" onClick="createPaginatedGallery(${currentPage - 1})" tabindex="-1">Previous</button>
                    </li>`;
  // for (let i = 1; i < urlChunks.length + 1; i++) {
  //   galleryPagination.innerHTML += `
  //        <li class="page-item ${i === page ? "disabled" : ""}"><button onClick="createPaginatedGallery(${i})" type="button" class="page-link">${i}</button></li>`;
  // }

  if (page !== 1) {
    galleryPagination.innerHTML += `
          <li class="page-item ${page === 1 ? "disabled" : ""}"><button onClick="createPaginatedGallery(${1})" type="button" class="page-link">1</button></li>`;
  }
  galleryPagination.innerHTML += `
         <li class="page-item disabled"><button  type="button" class="page-link">${page}</button></li>`;

  if (page !== urlChunks.length) {
    galleryPagination.innerHTML += `
          <li class="page-item ${page === urlChunks.length ? "disabled" : ""}"><button onClick="createPaginatedGallery(${urlChunks.length})" type="button" class="page-link">${urlChunks.length}</button></li>`;
  }
  galleryPagination.innerHTML += `
    <li id="next" class="page-item">
    <button class="page-link ${page >= urlChunks.length ? "disabled" : ""}"  onClick="createPaginatedGallery(${currentPage + 1})"  type="button">Next</button>
</li>`;
  chooseAndRenderPage(urlChunks, page);

  function chooseAndRenderPage(urlList, page) {
    gallery.innerHTML = "";
    urlList[page - 1].forEach((url) => {
      gallery.innerHTML += `<img class="gallery-item" src="${url}" alt="dog picture">`;
    });
  }
}

function arrayToChunks(arr, chunkLen) {
  let urlChunks = [];
  for (let i = 0; i < arr.length; i += chunkLen) {
    let chunk = [];
    for (let j = i; j < i + chunkLen; j++) {
      if (arr[j]) {
        chunk.push(arr[j]);
      }
    }
    urlChunks.push(chunk);
  }
  return urlChunks;
}
function capitalizeWord(word) {
  word = word.toLowerCase().charAt(0).toUpperCase() + word.slice(1);
  return word;
}
function getFormData(form) {
  const formData = new FormData(form);
  let data = {};
  for (const [key, value] of formData) {
    data[key] = value;
  }
  return data;
}
