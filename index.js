class UniqueTabId {
  #sessionStorageKey;
  #gotResponse = false;
  #channel = undefined;

  /**
   * Set this as true if you want to create a new tab id for a duplicated tab
   * This is the default behavior is the same too.
   * If you set this as false, you will see that duplicated tabs retain the same tab id as the original tab
   */
  newTabIdForDuplicatedTab = true;
  /**
   * A callback that is called with the tabId and isTabDuplicated, after the Broadcast Channel communication is done
   */
  tabidCallback = () => {};
  /**
   * A function that would be called to generate a uniqueId
   */
  uniqIdFunc = () => {};
  /**
   * The duration in milliseconds that we will wait for all the other tabs to respond back when asked for search
   */
  WAIT_TIMEOUT = 1000;

  constructor(appid = "client") {
    this.initTab = this.initTab.bind(this);
    this.removeTabId = this.removeTabId.bind(this);

    this.#sessionStorageKey = appid + "-unique-tabid";
    this.#channel = new BroadcastChannel(appid + "-unique-tabid-broadcast-channel");
    this.#channel.onmessage = (msg) => {
      const type = msg && msg.data && msg.data.type;
      let tabid = msg && msg.data && msg.data.tabid;
    
      if(type === "SEARCH"){
        if(window.sessionStorage.getItem(this.#sessionStorageKey) === tabid){
          this.#channel.postMessage({
            type: "FOUND",
            tabid
          })
        }
      }
      else if(type === "FOUND"){
        if(window.sessionStorage.getItem(this.#sessionStorageKey) === tabid){
          this.#gotResponse = true;
          if(this.newTabIdForDuplicatedTab){
            tabid = this.uniqIdFunc();
          }
          this.tabidCallback(tabid, true);
        }
      }
    };
  }


  removeTabId(){
    window.sessionStorage.removeItem(this.#sessionStorageKey);
  }
  
  initTab(){
    let tabid = window.sessionStorage.getItem(this.#sessionStorageKey);
    if(tabid === null){
      tabid = this.uniqIdFunc();
      window.sessionStorage.setItem(this.#sessionStorageKey, tabid);
      this.tabidCallback(tabid, false);
    }
    else{
      this.#gotResponse = false;
      this.#channel.postMessage({
        type: "SEARCH",
        tabid
      });
      setTimeout(() => {
        if(!this.#gotResponse){
          this.tabidCallback(tabid, false);
        }
      }, this.WAIT_TIMEOUT);
    }
  }
}

module.exports = UniqueTabId;