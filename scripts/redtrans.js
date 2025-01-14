const Options = {
  vendor: 'openai',
  language: 'en',
  llmApiKey: '',
  load: function() {
    chrome.storage.local.get(['vendor', 'language', 'llmApiKey'], (result) => {
      this.vendor = result.vendor || 'openai';
      this.language = result.language || 'en';
      this.llmApiKey = result.llmApiKey || '';
    });
  }
}

initFontAwesome();
initStyles();

class TransElement {
  // element is the leaf DOM element to translate
  constructor(element) {
    this.element = element;
    this.text = element.textContent;
    this.translation = '';
    this.showTranslation = false;
    element.transElement = this;
  }

  toggleTranslation() {
    this.showTranslation = !this.showTranslation;
    if (this.showTranslation) {
      this.element.textContent = this.translation;
    } else {
      this.element.textContent = this.text;
    }
  }

  isTranslated() {
    return this.translation != '';
  }

  translate() {
    const ele = this;
    
    translate(this.text, "", Options, function(result) {
      console.log(`[Translate]${ele.text} -> ${result.data}`);
      ele.translation = result.data;
      ele.toggleTranslation();
    });
  }

  onTranslateBtn() {
    if (this.isTranslated()) {
      // toggle the text and translation
      this.toggleTranslation();
    } else {
      this.translate();
    }
  }
}


// Function to add translate buttons to feed titles
function initTransOnFeedsPage() {
  // Select all titles within note-items
  const feedTitles = document.querySelectorAll('.note-item .title');

  // console.log('Found titles:', feedTitles.length);
  feedTitles.forEach((feedTitle, index) => {

    const span = feedTitle.querySelector('span');
    span.dataset.text = span.textContent;
    span.dataset.showTranslation = false;

    if (!feedTitle.querySelector('.translate-btn')) {
      // console.log(`Adding translate button to title ${index + 1}`);
      const translateBtn = document.createElement('button');
      translateBtn.className = 'translate-btn';
      translateBtn.innerHTML = '<i class="fa fa-globe" aria-hidden="true"></i>';

      const transElement = new TransElement(span);
      // span.transElement = transElement;
      
      translateBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        transElement.onTranslateBtn();
      });

      feedTitle.appendChild(translateBtn);
    } else {
      // console.log(`Title ${index + 1} already has a translate button`);
    }
  });
}

function getDetailElements() {
  const elements = [];

  for (const selector of [
    '#detail-title',
    '#detail-desc .note-text',
    '.bottom-container .date'
  ]) {
    const detailElement = document.querySelector(selector);
    if (detailElement && detailElement.textContent.trim() != '') {
      elements.push(detailElement);
    }
  }

  // add all comments
  // const comments = document.querySelectorAll('.parent-comment .content .note-text span');
  // console.log('Found comments:', comments.length);
  // elements.push(...comments);


  const transElements = [];

  elements.forEach((element) => {
    if (element.transElement) {
      return;
    }
    const transElement = new TransElement(element);
    // element.transElement = transElement;
    transElements.push(transElement);
  });

  return transElements;
}

function initTransOnDetailPage() {
  const bottomContainers = document.querySelectorAll('.bottom-container');

  console.log('Found bottom containers:', bottomContainers.length);
  bottomContainers.forEach((container, index) => {
    if (!container.querySelector('.translate-btn')) {
      console.log(`Adding translate button to bottom container ${index + 1}`);

      const translateBtn = createTranslateBtn('block');

      translateBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const transElements = getDetailElements();
        transElements.forEach((transElement) => {
          transElement.onTranslateBtn();
        });
      });
      
      container.appendChild(translateBtn);
    }
  });

  // for comments
  const comments = document.querySelectorAll('.parent-comment .content .note-text span');
  comments.forEach((container, index) => {
    console.log(`comment ${index + 1}, has translate btn: ${container.querySelector('.translate-btn')}, has transElement: ${container.transElement}`);
    if (container.transElement == null && !container.querySelector('.translate-btn')) {
      const translateBtn = createTranslateBtn('inline-block');
      container.parentNode.insertBefore(translateBtn, container.nextSibling);

      const transElement = new TransElement(container);
      // container.transElement = transElement;

      translateBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        transElement.onTranslateBtn();
      });
    }
  });
}

function createTranslateBtn(display = 'inline-block') {
  const translateBtn = document.createElement('button');
  translateBtn.className = 'translate-btn';
  translateBtn.innerHTML = '<i class="fa fa-globe" aria-hidden="true"></i>';
  translateBtn.style.display = display;
  return translateBtn;
}

function initTransOnNotifications() {
  const interactiveContents = document.querySelectorAll('.container .main .interaction-content');

  console.log('Found interactive contents:', interactiveContents.length);
  interactiveContents.forEach((container, index) => {

    if (container.transElement) {
      return;
    }

    const transElement = new TransElement(container);
    // container.transElement = transElement;

    if (!container.querySelector('.translate-btn')) {
      console.log(`Adding translate button to bottom container ${index + 1}`);

      const translateBtn = createTranslateBtn('inline-block');

      translateBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        transElement.onTranslateBtn();
      });
      
      // insert the button after the container
      container.parentNode.insertBefore(translateBtn, container.nextSibling);
    }
  });
}

// Add this new function to observe DOM changes
function observeDOMChanges() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length) {
        // Check which page we're on and initialize accordingly
        const path = window.location.pathname;
        console.log(`url path: ${path}`);
        if (path.startsWith('/explore')) {
          // Check if it's a detail page (has an ID after /explore/)
          if (path.match(/\/explore\/[a-zA-Z0-9]+/)) {
            initTransOnDetailPage();
          } else {
            initTransOnFeedsPage();
          }
        } else if (path.includes('/notification')) {
          initTransOnNotifications();
        }
      }
    });
  });

  // Start observing the document with the configured parameters
  // observer.observe(document.body, {
  //   childList: true,
  //   subtree: true
  // });

  // feeds page
  const feedsSection = document.querySelector('#exploreFeeds');
  if (feedsSection) {
    observer.observe(feedsSection, {
      childList: true,
      subtree: true
    });
  }

  // only observer comments lists.
  const commentsSection = document.querySelector('.comments-container .list-container');
  if (commentsSection) {
    observer.observe(commentsSection, {
      childList: true,
      subtree: true
    });
  }

  //notification section
  const notificationSection = document.querySelector('.notification-page .tabs-content-container');
  if (notificationSection) {
    observer.observe(notificationSection, {
      childList: true,
      subtree: false
    });
  }


}

function delayInit(milliseconds = 1000) {
  setTimeout(() => {
    initializeTranslations();
  }, milliseconds);
}

// Update the initialization section at the bottom
Options.load();

// Add immediate execution along with DOMContentLoaded listener
function initializeTranslations() {
  console.log(`Initializing translations: location path: ${window.location.pathname}`);
  initTransOnFeedsPage();
  initTransOnDetailPage();
  initTransOnNotifications();
  observeDOMChanges();
}

// Run immediately if DOM is already loaded
if (document.readyState === 'loading') {
  console.log('DOM is still loading, adding event listener');
  document.addEventListener('DOMContentLoaded', delayInit);
} else {
  delayInit(1000);
}

// add message listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'URL_CHANGED') {
    console.log(`URL_CHANGED: ${message.url}, re-init.`);
    // wait 1 second and then re-init
    delayInit(1000);
  }
});
