export function MakeCard(word){
  const wordList = word.wordlist ? `<div class="card-subtitle mb-2 text-muted"><small>${word.wordlist}</small></div>` : ""
  const meaning = word.meaning ? `<p class="card-text text-muted">${word.meaning}</p>`: "";
  const related = word.related ? `<div class="card-text">
                    <span class="badge badge-light">${word.related}</span>
                </div>` : ""
  const time = new Date(word.created_at).toLocaleString();
  
    return `
    <div class="card mb-2" id=${word.id}>
            <div class="card-body">
                <div class="d-flex justify-content-between">
                    <div>
                        <div class="card-title">${word.text}</div>
                        ${wordList}
                    </div>      
                </div>
                ${meaning}
                ${related}
                <div class="d-flex justify-content-between">
                     <small class="card-text text-muted">${time}</small>
                     <button class="btn btn-danger delete-btn" id=${word.id}><svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-trash" fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                        <path fill-rule="evenodd"
                            d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4L4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" />
                    </svg>
                    </button>
                    
                </div>
            </div>
     
    `
}


export default class History {
    constructor(ui) {
        this.ui = ui;
        this.memory = ui.memory;
    }
    createCards() {
        var words = this.memory.history.words;
        if (words) {
            words.map(word => {
                const div = document.createElement('div');
                div.innerHTML = MakeCard(word);
                this.ui.container.appendChild(div);
            })
        }

    }
    getElements() {
        this.deleteButtons = document.querySelectorAll(".delete-btn");
        this.deleteButtons.forEach(button => {
            button.onclick = (event) => {
                button.disabled = true;
                // button.parentElement.parentElement.parentElement.remove();
                this.ui.handleDelete(parseInt(button.id), button);
            }
        });
    }
    addEventListeners() {

    }

}
