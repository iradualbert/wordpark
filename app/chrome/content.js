const baseURL = "http://127.0.0.1:8000/api";
const api = {
    userURL: `${baseURL}/auth/user`,
    registerURL: `${baseURL}/auth/register`,
    loginURL: `${baseURL}/auth/login`,
    logoutURL: `${baseURL}/auth/logout`,
    wordURL: `${baseURL}/words/`,
    listURL: `${baseURL}/lists/`,
};
const actions = {
    SET_USER: "SET_USER",
    SET_UNAUTHENTICATED: "SET_UNAUTHENTICATED",
    ADD_WORD: "ADD_WORD",
    DELETE_WORD: "DELETE_WORD",
    ADD_LIST: "ADD_LIST",
}


class Content {
    constructor(state){
        this.state = state;
        this.selection = "";
        this.hasRendered = false;
        this.newList = false;
        this.isHistory = false;
    }
    getSelection = () => {
        let selectedText =  window.getSelection().toString().trim();
        if ( selectedText.length){
            if(this.textInput){
                this.textInput.value = selectedText;
            }
        }
    }
    initialize(){
        this.auth = new Authentication(this.state, this);
    };
    render(){
        this.initialize();
        const div = document.createElement('div');
        try{
            document.getElementById('ext-form').parentElement.remove();
        }
        catch(err){

        }
        div.innerHTML = CreateForm();
        div.style.position = "fixed";
        div.style.float = "right";
        div.style.zIndex = 10000;
        document.body.appendChild(div);
        this.mainContainer = div;
        this.closeButton = document.querySelector('.ext-close-btn');
        this.closeButton.onclick = (event) => {
            this.toggleRender();
        }
        this.formsDiv = document.getElementById('ext-forms-div');
        if(this.state.user.isAuthenticated){
            this.formsDiv.innerHTML = createWordForm();
            // this.historyDiv = document.querySelector('.ext-history');
            // this.historyDiv.innerHTML += RenderHistory(this.state.history.words);
        }
        else{
            this.formsDiv.innerHTML = createAuthForm();
        }
        this.getElements();

    }
    getElements () {
        const isAuthenticated = this.state.user.isAuthenticated;
        this.authDiv = document.querySelector(".ext-authenticated");
        if (isAuthenticated && this.isHistory){
            return 
        }
        else if(isAuthenticated){
            this.form = document.querySelector('#ext-form');
            this.textInput = document.querySelector('#ext-text');
            this.meaningInput = document.querySelector('#ext-meaning');
            this.listInput = document.querySelector('#ext-list');
            this.newListInput = document.querySelector("#ext-new-list");
            this.submitButton = document.querySelector('#ext-submit-button');
            this.newListButton = document.querySelector('.ext-new-list-button');
            this.logoutButton = document.querySelector(".ext-logout");
            this.userDiv = document.querySelector(".ext-user");
            this.historyDiv = document.querySelector('.ext-history');
            /// update auth div
            this.authDiv.classList.remove('ext-none');
            this.userDiv.innerText = this.state.user.credentials.fullname;
            
            // show history and update list / collections
            // this.showHistory();
            this.state.history.lists.map(list => {
                const option = document.createElement('option');
                option.value = list.id;
                option.text = list.name;
                this.listInput.appendChild(option);
            })
            
            // add events
            this.textInput.onkeyup = (event) => this.handleChange(event);
            this.newListButton.onclick = (event) => this.toggleNewList(event);
            this.form.onsubmit = (event) => this.handleSubmit(event);
            this.logoutButton.onclick = (event) => this.auth.logout(event);
        }
        else {
            this.auth.initialize();
        }
    };
    showHistory(){
        // update history
        this.historyDiv.innerHTML = "";
        this.state.history.words.map(word => {
            const div = document.createElement('div');
            div.id = word.id;
            div.className = "ext-card";
            div.innerHTML = RenderHistory(word);
            this.historyDiv.appendChild(div);
        })
    };
    toggleNewList(event){
        event.preventDefault();
        this.newList = !this.newList;
        this.newListInput.parentElement.classList.toggle("ext-none");
        this.listInput.parentElement.classList.toggle("ext-none");
        this.newListButton.innerText = this.newList ? "Cancel": "+ New List";
    };
    toggleRender(){
        this.mainContainer.classList.toggle('ext-none');
    }
    gotMessage = (request, sender, sendResponse) => {
        const msg = request.msg
        this.state = request.state;
        if(this.hasRendered){
            this.toggleRender();
        }
        else {
            this.render();
            this.hasRendered = true;
        }
        if (msg) {
            this.getSelection();
        }
       
    };
    sendRequest(action){
        chrome.runtime.sendMessage(action);
    };
    handleChange(event){
        if(this.textInput.value){
            this.submitButton.disabled = false;
        }
        else{
            this.submitButton.disabled = true;
        }
    }
    async handleSubmit(event){
        event.preventDefault();
        const data = {};
        data.word_data = {};
        data.list_data ={};
        data.word_data = {
            url: window.location.href,
            origin_title: document.title,
            text: this.textInput.value,
            meaning: this.meaningInput.value,
            list_id: this.listInput.value && !this.newList ? parseInt(this.listInput.value) : null,
            created_at: new Date(),
            language: navigator.language,
        }
        if(this.newList){
            data.list_data = {
                name: this.newListInput.value,
                created_at: new Date()
            };
        }
        try {
            const response = await fetch(api.wordURL, {
                method: "POST",
                body: JSON.stringify(data),
                headers: {
                    "Content-Type": "application/json;charset=utf-8",
                    Authorization: this.state.user.token,
                },
            });
            const jsonData = await response.json();
            this.sendRequest({
                action: actions.ADD_WORD,
                payload: jsonData.word_data
            });
            this.state.history.words = [jsonData.word_data, ...this.state.history.words]
            if(this.newList){
                let list_data = jsonData.list_data;
                this.sendRequest({
                    type: actions.ADD_LIST,
                    payload: list_data
                });
                this.state.history.lists.push(list_data); // = [list_data, ...this.state.history.lists];
                const option = document.createElement('option');
                option.value = list_data.id;
                option.text = list_data.name;
                this.listInput.appendChild(option);
            }
            this.resetForm();
        } catch (error) {
            console.log(error);
        }
    };
    resetForm(){
        this.form.reset();
        this.submitButton.disabled = true;
        this.selection = "";
        if(this.newList){
            this.newList = false;
            this.newListInput.parentElement.classList.add('ext-none');
            this.listInput.parentElement.classList.remove('ext-none');
            this.newListButton.innerText = "+ New List";
        }
    }
}

const content = new Content({});
chrome.runtime.onMessage.addListener(content.gotMessage)



function RenderHistory(word) {
        const wordlist = word.wordlist ? `<div class="ext-text-muted"><small>${word.wordlist}</small></div>`: "";
        const meaning = word.meaning ? `<p class="ext-text-muted">${word.meaning}</p>` : "";
        const origin_link = word.origin_title ? `<a href=${word.url} target="_blank" class="ext-origin-link">${word.origin_title}</a>` : "";
        const createdAt = new Date(word.created_at).toLocaleString();
        return `
              
              <div class="ext-card-body">
                <div class="ext-card-top">
                    <div class="ext-card-title">${word.text}</div>
                    ${wordlist}
                </div>
                ${meaning}
                ${origin_link}
                <div class="ext-card-bottom">
                    <small class="ext-text-muted">${createdAt}</small>
                    <button class="ext-delete-btn" id=${word.id}><svg width="1em" height="1em" viewBox="0 0 16 16"
                            class="bi bi-trash" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                            <path fill-rule="evenodd"
                                d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4L4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" />
                        </svg>
                    </button>
                </div>
            
        `
    
};


function CreateForm() {
    return `
    <style>
    .ext-form {
        position: fixed;
        top: 50px;
        right: 10px;
        height: 550px;
        overflow-y: auto;
        overflow-x: hidden;
        background-color: white !important;
        color: #141c2c !important;
        font-family: Arial, Helvetica, sans-serif !important;
        padding: 20px !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        justify-content: center !important;
        width: 350px !important;
        border: 1px solid #f7f7f7 !important;
        float: right !important;
        box-shadow: 0 0 5px 2px rgba(0, 0, 0, .3) !important;
        z-index: 10000000 !important;
    }
    .ext-history {
            width: 100% !important;
            background-color: white !important;
            position: absolute;
            top: 10px;
            padding: 0 10px;
        }
    .ext-close-btn{
        position: fixed;
        cursor: pointer;
        float: right;
        right: 20px;
        top: 50px;
        border: 0;
        padding: 10px;
        font-size: 16px;
        background-color: white;
        z-index: 1;
    }
    .ext-form>h4{
        font-size: 16px !important;
        font-family: Arial, Helvetica, sans-serif !important;

    }

    .ext-form-group {
        margin: 10px 0 !important;
        width: 100% !important;
    }

    .ext-form-group>label {
        text-transform: uppercase  !important;
        color: #dbdbdb !important;
        font-size: 14px  !important;
        opacity: 1 !important;

    }

    .ext-form-control {
        width: 100% !important;
        background-color: #f7f7f7 !important;
        border-radius: 3px !important;
        border: 0 !important;
        /* border: 2px solid #ecf2ff !important; */
        font-size: 16px !important;
        font-family: inherit !important;
        padding: 10px !important;
        margin-top: 10px !important;
        box-sizing: border-box !important;
    }

    .ext-form-control::placeholder {
        color: #bfbfbf !important;
        opacity: 1 !important;
    }

    .ext-btn {
        cursor: pointer !important;
        text-transform: uppercase !important;
        background-color: #141c2c !important;
        border: 0 !important;
        border-radius: 3px !important;
        color: #fff !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        font-family: inherit !important;
        font-weight: bold !important;
        font-size: 14px !important;
        padding: 10px !important;
        margin: 20px 0 !important;
        width: 100% !important;
    }

    .ext-btn:disabled {
        background-color: #8c8b8b !important;
    }

    .ext-none {
        display: none !important;
    }
    
    .ext-new-list-button {
        float: right !important;
        margin-bottom: 10px !important;
        padding: 5px !important;
        text-decoration: none !important;
    }
    .ext-auth-div {
        width: 100%;
        margin: 10px;
        padding: 10px;
        float: right !important;
        display: flex !important;
        flex-direction: row !important;
        justify-content: space-between !important;
    }
        
        .ext-card {
            margin: 20px 0 !important;
            width: 100% !important;
            background-color: #f7f7f7 !important;
            font-family: Arial, Helvetica, sans-serif !important;
        }
        .ext-flex {
            display: flex !important;
        }
        .ext-card-body {
            padding: 10px !important;
        }
        .ext-card-top {
            margin-bottom: 10px !important;
        }
        .ext-card-title {
            font-size: 20px !important;
            padding-bottom: 2px !important;
        }
        .ext-text-muted {
            color: #7d7d7d !important;
        }
        .ext-origin-link {
            margin-bottom: 10px !important;
        }
        .ext-card-bottom {
            margin-top: 15px !important;
            display: flex !important;
            justify-content: space-between !important;
        }
        .ext-delete-btn {
            cursor: pointer !important;
            width: 35px !important;
            font-size: 20px !important;
            padding: 5px !important;
            background-color: #d11f1f !important;
            color: white !important;
            border:0 !important;
            border-radius: 3px !important;
        }
        .ext-delete-btn:disabled{
            background-color: #e69c9c !important;
        }
    </style>
    
<form id="ext-form" method="POST" class="ext-form">
    <div class="ext-close-btn">X</div>
    <div class="ext-authenticated ext-none">
      <div class="ext-auth-div">
        <div class="ext-user"></div>
        <a href="#" class="ext-logout">Logout</a>
      </div>
    </div>
    <h4 class="ext-title">
        Learning Made Easy
    </h4>
    <div class="ext-forms-div" id="ext-forms-div"></div>
    <div class="ext-history">
        
    </div>
    
</form>
`
} 

function createWordForm(){
    return `
    <div class="ext-form-group">
        <label>Word / Phrase **</label>
        <input class="ext-form-control" type="text" name="text" id="ext-text" placeholder="New word or phrase.....">
    </div>
    <div class="ext-form-group">
        <label>Meaning / Notes</label>
        <textarea class="ext-form-control" type="text" name="meaning" id="ext-meaning"
            placeholder="Add meaning or context..."></textarea>
    </div>
    <div class="ext-form-group">
        <label>List / Collection</label>
        <select class="ext-form-control" name="list" id="ext-list">
            <option value="">None</option>
        </select>
    </div>
    <div class="ext-form-group ext-none">
        <label>New List Name **</label>
        <input class="ext-form-control" type="text" name="text" id="ext-new-list" placeholder="Enter New List name.....">
    </div>
    <a href="#" class="ext-new-list-button">+ New List</a>
    <div class="ext-form-group">
        <button type="submit" class="ext-btn btn-dark" id="ext-submit-button" disabled>
            Save
        </button>
    </div>
    `
}

function createAuthForm(){
    return `
    <div class="ext-form-group">
        <label>Fullname **</label>
        <input class="ext-form-control" type="text" name="fullname" id="ext-fullname" placeholder="Fullname.....">
    </div>
    <div class="ext-form-group">
        <label>Email **</label>
        <input class="ext-form-control" type="email" name="email" id="ext-email" placeholder="Email.....">
    </div>
    <div class="ext-form-group">
        <label>Password **</label>
        <input class="ext-form-control" type="password" name="password" id="ext-password" placeholder="Password.....">
    </div>
    <div class="ext-form-group">
        <button type="submit" class="ext-btn btn-dark" id="ext-submit-button" disabled>
            Sign Up
        </button>
    </div>
     <div class="ext-toggle-login-signup" id="ext-toggle-login-signup">
                <small>
                    Already have an account? <a href="#" id="ext-toggle-btn">Log In</a>
                </small>
    </div>

    `
}

class Authentication {
    constructor(state, main) {
        this.state = state;
        this.errors = {};
        this.isLogin = false;
        this.main = main;
    }
    async logout(event) {
        event.preventDefault();
        this.main.sendRequest({
            type: actions.SET_UNAUTHENTICATED
        });
        try{
            fetch(api.logoutURL, {
                method: "POST",
                headers: {
                    Authorization: this.main.state.user.token
                }
            });
        }catch(error){};
        this.main.state = {
            user: {
                isAuthenticated: false,
                token: null,
                credentials: {},
                loading: false
            },
            history: {
                words: [],
                lists: [],
            }
        };
        this.main.render();
    }

    getElements() {
        this.emailInput = document.getElementById("ext-email");
        this.passwordInput = document.getElementById("ext-password");
        this.fullnameInput = document.getElementById("ext-fullname");
        this.submitButton = document.getElementById("ext-submit-button");
        this.toggleLoginSignup = document.getElementById("ext-toggle-login-signup");
        this.toggleButton = document.getElementById("ext-toggle-btn");
        this.form = document.getElementById("ext-form");

        // add events
        this.emailInput.onkeyup = event => this.handleChange(event);
        this.fullnameInput.onkeyup = event => this.handleChange(event);
        this.passwordInput.onkeyup = event => this.handleChange(event);
        this.toggleButton.onclick = event => this.toggle(event);
        this.form.onsubmit = event => this.handleSubmit(event);
    }

    handleChange = () => {
        if (this.emailInput.value && this.passwordInput.value) {
            if (this.isLogin) {
                this.submitButton.disabled = false;
            }
            else if (this.fullnameInput.value) {
                this.submitButton.disabled = false;
            }
        }
        else {
            this.submitButton.disabled = true;
        }
    };
    handleSubmit = async (event) => {
        event.preventDefault();
        this.submitButton.disabled = true;
        const url = this.isLogin ? api.loginURL : api.registerURL;
        const data = {
            email: this.emailInput.value,
            password: this.passwordInput.value,
        };
        if (!this.isLogin) {
            // first name represents fullname in the database
            data.first_name = this.fullnameInput.value;
        }
        const response = await fetch(url, {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json;charset=utf-8",
            },
        });
        const jsonData = await response.json();
        this.main.sendRequest({
            type: actions.SET_USER,
            payload: jsonData
        });
        this.main.state.user.credentials = jsonData.user;
        this.main.state.history.lists = jsonData.lists;
        this.main.state.history.words = jsonData.words;
        this.main.state.user.isAuthenticated = true;
        this.main.state.user.token = `Token ${jsonData.token}`
        this.main.render();
    };
    toggle(event) {
        if(event){
            event.preventDefault();
        }
        this.isLogin = !this.isLogin;
        this.handleChange();
        this.fullnameInput.parentElement.classList.toggle("ext-none");
        this.submitButton.innerText = this.isLogin ? "Log In" : "Sign Up";
        this.toggleLoginSignup.innerHTML = this.isLogin
            ? `<small>
                  Don't have an account yet? <a href="#" id="ext-toggle-btn">Sign Up</a>
                </small>`
            : `
                  <small>
                    Already have an account? <a href="#" id="ext-toggle-btn">Log In</a>
                   </small>
                 `;
        this.toggleButton = document.getElementById("ext-toggle-btn");
        this.toggleButton.onclick = (event) => {
            event.preventDefault();
            this.toggle();
        };
    }
    initialize() {
        this.getElements();
    };
}
