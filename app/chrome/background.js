chrome.contextMenus.create({
  "id": "someid",
  "title": "Word Power",
  "contexts": ["page", "selection"]
});
const baseURL = "http://127.0.0.1:8000/api";
const actions = {
  SET_USER: "SET_USER",
  SET_UNAUTHENTICATED: "SET_UNAUTHENTICATED",
  ADD_WORD: "ADD_WORD",
  DELETE_WORD: "DELETE_WORD",
  ADD_LIST: "ADD_LIST",
}
const api = {
  userURL: `${baseURL}/auth/user`,
  registerURL: `${baseURL}/auth/register`,
  loginURL: `${baseURL}/auth/login`,
  logoutURL: `${baseURL}/auth/logout`,
  wordURL: `${baseURL}/words`,
};

let state = {
  user: {
    isAuthenticated: false,
    credentials: {},
    loading: false,
    token: null
  },
  ui: {
    loading: false
  },

  history: {
    words: [],
    lists: [],
  },
  errors: {},

}

class Background {
  constructor(state) {
    this.state = state;
  }
  loadLocalStorage() {
    const store = localStorage.getItem('store');
    if (store) {
      this.state.user = JSON.parse(store);
    }
    else{
      this.setUnauthenticated();
    }
  }

  initialize() {
    this.loadLocalStorage();
    const token = this.state.user.token;
    if (token) {
      var status;
      fetch(api.userURL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json;charset=utf-8",
          Authorization: token,
        },
      })
        .then((res) => {
          status = res.ok;
          return res.json();
        })
        .then((jsonData) => {
          if (status) {
            this.state.user.credentials = jsonData.user;
            this.state.history.lists = jsonData.lists;
            this.state.history.words = jsonData.words;
            localStorage.setItem('store', JSON.stringify(this.state.user));
            localStorage.setItem('history', JSON.stringify(this.state.history));
          } else {
            this.setUnauthenticated();
          }
        });

    }
    else {
      this.setUnauthenticated()
    }
  };

  setAuthenticated(jsonData) {
    this.state.user.credentials = jsonData.user;
    this.state.user.token = `Token ${jsonData.token}`;
    this.state.history.lists = jsonData.lists;
    this.state.history.words = jsonData.words;
    this.state.user.isAuthenticated = true;
    this.state.user.loading = false;
    localStorage.setItem('store', JSON.stringify(this.state.user));
    localStorage.setItem('history', JSON.stringify(this.state.history));
  };
  setUnauthenticated() {
    this.state = {
      user: {
        isAuthenticated: false,
        credentials: {},
        loading: false,
        token: null,
      },
      ui: {
        loading: false,
      },

      history: {
        words: [],
        lists: [],
      },
      errors: {},
    };
    localStorage.setItem('store', JSON.stringify(this.state.user));
    localStorage.setItem('history', "{words:[], lists: []");
  };

  addWord(jsonData) {
    this.state.history.words = [jsonData, ...this.state.history.words];
    localStorage.setItem('history', JSON.stringify(this.state.history));
  };
  addList(jsonData) {
    this.state.history.lists = [jsonData, ...this.state.history.lists];
    localStorage.setItem('history', JSON.stringify(this.state.history));
  }
  deleteWord(id) {
    this.state.history.words = this.state.history.words.filter(word => word.id !== id)
    localStorage.setItem('history', JSON.stringify(this.state.history));
  };

  buttonClicked = (tab, msg) => {

      chrome.tabs.sendMessage(tab.id, { state: this.state, msg: msg })
  };

  gotRequest = (action, sender, sendResponse) => {
    switch (action.type) {
      case actions.SET_USER:
        this.setAuthenticated(action.payload);
        break;
      case actions.SET_UNAUTHENTICATED:
        this.setUnauthenticated();
        break;
      case actions.DELETE_WORD:
        this.deleteWord(action.payload)
        break;
      case actions.ADD_WORD:
        this.addWord(action.payload);
        break;
      case actions.ADD_LIST:
        this.addList(action.payload);
        break;
      default:
        break;
    }
  };
}

let background = new Background(state)
background.initialize();
chrome.browserAction.onClicked.addListener(background.buttonClicked);
chrome.runtime.onMessage.addListener(background.gotRequest);
chrome.contextMenus.onClicked.addListener((info, tab) => background.buttonClicked(tab, "select"));
