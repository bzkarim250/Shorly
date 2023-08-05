let shortUrlForm = document.querySelector("#url-shorten-form");
let submitButton = shortUrlForm.querySelector("button");
let input = shortUrlForm.querySelector(".url-input");
let alertMessage = shortUrlForm.querySelector(".alert");
let shortURLsResult = document.querySelector(".url-shorten-results");

// Adding delete button on new function
function insertAfter(newNode, existingNode) {
  existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
}

// Add Delete all url
function removeAllGeneratedURLs() {
  //Adding delete button on buttom of url list  when more than 1 url generated 
  if (shortURLsResult.querySelectorAll(".url-shorten-result").length >= 2) {
    if (shortURLsResult.querySelector(".delete-all-urls")) {
      shortURLsResult.querySelector(".delete-all-urls").remove();
    }
    // Creating delete button
    let button = document.createElement("button");
    button.type = "button";
    button.classList = "btn btn-sm delete-all-urls scale-effect";
    button.textContent = "delete all";
    insertAfter(button, shortURLsResult.lastElementChild);
    // Delete all Urls and clear local storage
    let deleteAll = shortURLsResult.querySelector(".delete-all-urls");
    deleteAll.addEventListener("click", () => {
      shortURLsResult.innerHTML = "";
      savedURLs = [];
      localStorage.removeItem("saved");
    });
  } else {
    if (shortURLsResult.querySelector(".delete-all-urls")) {
      shortURLsResult.querySelector(".delete-all-urls").remove();
    }
  }
}

// Delete One url
function removeURL() {
  let deleteURLButton = shortURLsResult.querySelectorAll(".delete-url");
  deleteURLButton.forEach((button) => {
    button.addEventListener("click", () => {
      // getting ID of sinle Url
      let linkId = button.closest(".url-shorten-result").id;
      // Delete URL From The List
      button.closest(".url-shorten-result").remove();
      // Get Index Of This URL And Delete it from the Array
      const index = savedURLs.findIndex((url) => url.id == linkId);
      // Delete URL From The Array
      savedURLs.splice(index, 1);
      // Refresh The Array & LocalStorage
      localStorage.setItem("saved", JSON.stringify(savedURLs));
      removeAllGeneratedURLs();
    });
  });
}

function copyURL() {
  let copyButtons = shortURLsResult.querySelectorAll(".copy-new-url");
  copyButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Get URL Content
      let urlText = button
        .closest(".url-shorten-result")
        .querySelector(".new-url p").textContent;
      const body = document.querySelector("body");
      const area = document.createElement("textarea");
      body.appendChild(area);
      area.value = urlText;
      area.select();
      //allow copy shortend url
      document.execCommand("copy");
      button.classList.add("copied");
      button.innerHTML = "copied!";
      setTimeout(() => {
        button.classList.remove("copied");
        button.innerHTML = "copy";
      }, 2000);
      body.removeChild(area);
    });
  });
}



function reandomIds() {
  let currentTime = Date.now();
  let currentTimeString = currentTime.toString(32).slice(0, 8);
  let reandomNumber = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)
    .toString()
    .slice(0, 4);
  let reabdomId = `${currentTimeString}-${reandomNumber}`;
  return reabdomId;
}

// API using shrtcode
const makeShortURL = async (userUrl) => {
  let apiBaseURL = "https://api.shrtco.de/v2/";
  let shortenQuery = `shorten?url=`;
  let fetchLink = `${apiBaseURL}${shortenQuery}${userUrl}`;

  try {
    let response = await fetch(fetchLink);
    let data = await response.json();
    let status = data.ok;

    // Response With Data
    if (status) {
      let originalURL = data.result.original_link;
      let shortUrl = data.result.full_short_link;
      // Make Object For [originalURL, shortUrl]
      let generatedURL = {
        id: reandomIds(),
        originalURL: originalURL,
        shortUrl: shortUrl
      };
      // Change Submit Button Text & Style
      shortUrlForm.classList.add("success");
      submitButton.innerHTML = `<i class="fa fa-check" aria-hidden="true"></i> shortened!`;
      setTimeout(() => {
        shortUrlForm.classList.remove("success");
        submitButton.innerHTML = "shorten it!";
      }, 1700);
      generatedShortUrlHtml(reandomIds(), originalURL, shortUrl);
      // Save [link] Object To Localstorage After Pushing It To The [savedURLs] Array
      savedURLs.push(generatedURL);
      localStorage.setItem("saved", JSON.stringify(savedURLs));
    }
    // Response With Error Message [No Data].
    else {
      // Change Submit Button Text
      submitButton.innerHTML = "shorten it!";
      let errorCode = data.error_code;
      switch (errorCode) {
        //Empty
        case 1:
          alerts("Please add a link to be shortened");
          break;
        // Invalid
        case 2:
          alerts(data.error.split(",")[0] + ", Please enter valid url");
          break;
        // If URL Is Not Allowed To Be Shortened
        case 10:
          alerts("The link is short enought!.");
          break;
        default:
          alerts(data.error);
      }
    }
  } catch (error) {
  }
};

shortUrlForm.addEventListener("submit", (e) => {
  e.preventDefault();
  let inputValue = input.value.trim().replace(" ", "");
  submitButton.innerHTML = `<i class="fa fa-spinner" aria-hidden="true"></i> Shortening URL...`;
  makeShortURL(inputValue);
  //clear input for another url
  shortUrlForm.reset();
});

// Show Alerts
function alerts(message) {
  shortUrlForm.classList.add("empty");
  alertMessage.textContent = message;

  setTimeout(() => {
    shortUrlForm.classList.remove("empty");
  }, 5000);
}

// Generating url HTML Structure
function generatedShortUrlHtml(id, originalURL, shortUrl) {
  shortURLsResult.insertAdjacentHTML(
    "beforeend",
    `
  <div class="url-shorten-result" id='${id}'>
    <div class="old-url">
    <p><a href="${originalURL}" target="_blank">${originalURL}</a></p>
    </div>
    <div class="new-url">
      <p><a href="${shortUrl}" target="_blank">${shortUrl}</a></p>
      <div class="options">
        <button type="button" class="copy-new-url btn btn-sm scale-effect">
          copy
        </button>

        <button type="button" class="delete-url scale-effect">
          <i class="fa fa-trash"></i>
        </button>
      </div>
    </div>
  </div>`
  );
  removeURL();
  copyURL();
  removeAllGeneratedURLs();
}

// Expand Header Navgation Function
function expandNavgation() {
  let navgation = document.querySelector(".header .main-navgation");
  let icon = toggleMenu.querySelector(".icon");
  let closed = true;

  toggleMenu.addEventListener("click", () => {
    // Change Icon
    if (icon.classList.contains("fa-bars")) {
      icon.className = "fa-regular fa-xmark icon";
    } else {
      icon.className = "fa-regular fa-bars icon";
    }

    // Open Or Close Navgation Menu
    let navgationHeight = navgation.scrollHeight;
    if (closed) {
      navgation.style.height = `${navgationHeight}px`;
    } else {
      navgation.style.height = "";
    }
    closed = !closed;
  });
  // Close Navgation For Devices Greater Than 992px Width.
  window.addEventListener("resize", () => {
    if (window.innerWidth > 992) {
      icon.className = "fa-regular fa-bars icon";
      navgation.style.height = "";
      closed = true;
    }
  });
}
expandNavgation();
