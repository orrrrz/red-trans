function initFontAwesome() {
    // Add Font Awesome CSS to the page
    const fontAwesomeCDN = document.createElement('link');
    fontAwesomeCDN.rel = 'stylesheet';
    fontAwesomeCDN.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css';
    document.head.appendChild(fontAwesomeCDN);
  }
  
  function initStyles() {
    const styles = document.createElement('style');
    styles.textContent = `
  
    .container .main .interaction-content {
      display: inline;
    }
  
    .note-item .title span {
      overflow: auto;
    }
  
    .translate-btn {
      cursor: pointer;
      color: #999;
      background: none;
      border: none;
      padding: 4px;
      display: none;
    }
    
    .note-item .title:hover .translate-btn {
      display: inline;
    }
    
    .translate-btn:hover {
      color: #666;
    }
    .translation-text {
      display: block;
      color: #666;
      font-size: 0.9em;
      margin-top: 4px;
      font-style: italic;
      overflow: auto;
    }
    `;
    document.head.appendChild(styles);
  }