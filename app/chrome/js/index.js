import createForm from "./add.js";
import Authentication from "./login.js";
import History from "./history.js";
const WordBaseURL = "http://127.0.0.1:8000/api/words/";


const defaultMemory = {
    user: {
        isAuthenticated: false,
        loading: true,
        credentials: {},
        token: null,
    },
    interface: {
        loading: false
    },
    history : {
        words: [],
        lists: [],
    },
    queue: [],
    currentPage: "form"
}

let memory = {...defaultMemory}



function UI(memory) {
    this.memory = memory;
    this.state = {};
}
UI.prototype.setAuthentication = function (jsonData){
  this.memory.user.credentials = jsonData.user;
  this.memory.user.token = `Token ${jsonData.token}`;
  this.memory.history.lists = jsonData.lists;
  this.memory.history.words = jsonData.words;
  this.memory.user.isAuthenticated = true;
  this.memory.user.loading = false;
  localStorage.setItem('store', JSON.stringify(this.memory.user));
  localStorage.setItem('history', JSON.stringify(this.memory.history));
    this.render();
}

UI.prototype.render = function () {
    this.container = document.getElementById("container");
    if(this.memory.user.isAuthenticated){
        this.container.innerHTML = createForm();
        this.getElements();
        this.addEventListeners();
        const historyList = new History(this)
        historyList.createCards()
        historyList.getElements()
        historyList.addEventListeners()
    }
    else {
        const auth = new Authentication(this.memory, this);
        auth.render()
    }
}
UI.prototype.updateMemory = function () {
    let history = localStorage.getItem('history');
    let store = localStorage.getItem('store');
    if (store){
        this.memory.user = JSON.parse(store);
    }
    if(this.memory.user.isAuthenticated && history){
        this.memory.history = JSON.parse(history)
    }
}

UI.prototype.getElements = function () {
    this.wordForm = document.getElementById("word");
    this.meaningForm = document.getElementById("meaning");
    this.relatedForm = document.getElementById('related');
    this.translationForm = document.getElementById("translation");
    this.spinner = document.querySelector(".spinner-border");
    this.alertDiv = document.getElementById("alerts");
    this.form = document.getElementById("form");
    this.submitButton = document.getElementById("submit-button");
}

UI.prototype.addEventListeners = function () {
    this.wordForm.addEventListener('keyup', (event) =>{
      this.handleChange("word", event.target.value);
    })
    this.meaningForm.onkeyup =  (event) => {
      this.handleChange("meaning", event.target.value);
    };
    this.relatedForm.onkeyup =  (event) => {
      this.handleChange("related", event.target.value);
    };
    this.translationForm.onkeyup = (event) =>{
        this.handleChange("translation", event.target.value);
    }
    this.form.onsubmit = (event) => {
      this.handleSubmit(event);
    };
}


UI.prototype.handleChange = function (name, value) {
    this.state[name] = value;
    if (this.state.word) {
        this.submitButton.disabled = false;
    }
    else {
        this.submitButton.disabled = true;
    }

}

UI.prototype.handleDelete = function(id, button){
  this.memory.history.words = this.memory.history.words.filter(word => word.id !==id )
  localStorage.setItem('history', JSON.stringify(this.memory.history));
  fetch(
    `${WordBaseURL}${id}/`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
        Authorization: this.memory.user.token,
      },
    }
  ).then(res => {
    if (res.status === 204){
      this.showAlert('Removed Successfully', 'success');
      button.parentElement.parentElement.parentElement.remove();
    }
    else(
      this.showAlert('Something went wrong', 'danger')
    )
  })
}
UI.prototype.handleSubmit = function (event) {
    event.preventDefault()
    this.state.url = window.location.href;
    let data = {
        "text": this.state.word,
        "meaning": this.state.meaning,
        "translation": this.state.translation,
        "related": this.state.related,
        "sentence": this.state.sentence,
        "created_at": new Date(),
        "url": null,
        "origin_title": null,
        "sentence": null,
        "paragraph": null,
        "wordlist": null,
        
    }
    
    var status;
    fetch(WordBaseURL, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json;charset=utf-8",
        Authorization: this.memory.user.token,
      },
    })
      .then((res) => {
        status = res.status;
        return res.json();
      })
      .then((jsonData) => {
        if (status === 400) {
          this.showAlert(JSON.stringify(json.non_field_errors), "danger");
        } else if (status === 201) {
          this.showAlert("Added Successfully", "success");
          this.memory.history.words = [jsonData, ...this.memory.history.words];
          localStorage.setItem('history', JSON.stringify(this.memory.history));
          this.render()
        }
      })
      .catch(err=> {
        this.showAlert('Network Error', "danger");
        this.render()
      })
      ;

    this.submitButton.disabled = true;
    this.spinner.classList.remove('none');

}

UI.prototype.resetForm = function() {
    this.state = {};
    this.submitButton.disabled = true;
    this.spinner.classList.add("none");
    this.form.reset();
}

UI.prototype.showAlert = function(message, className) {
    const div = document.createElement('div');
    div.className = `alert alert-${className}`;
    div.appendChild(document.createTextNode(message));
    const alertDiv = document.querySelector('#alerts');
    alertDiv.append(div);
    setTimeout(() => document.querySelector('.alert').remove(), 3000);
}

UI.prototype.initialize = function () {
    this.updateMemory();
    this.render();
    
}


let newInterface = new UI(memory);
newInterface.initialize();


// send message to 
newInterface.wordForm.onkeyup = (event) => {
  
}