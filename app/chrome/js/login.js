const AuthBaseURL = "http://127.0.0.1:8000/api/auth";

export function LoginForm (){
    return `<form id="form" method="POST">
            <div class="form-group none">
                <label>Fullname **</label>
                <input class="form-control" type="text" name="fullname" id="fullname" placeholder="fullname">
            </div>
            <div class="form-group">
                <label>Email **</label>
                <input class="form-control" type="email" name="email" id="email" placeholder="Email.....">
            </div>
            <div class="form-group">
                <label>Password **</label>
                <input class="form-control" type="password" name="password" id="password" placeholder="Password.....">
            </div>
            
            <div class="" id="alerts"></div>
            <div class="form-group">
                <button type="submit" class="btn btn-dark" id="submit-button" disabled>
                    Login
                    <div class="spinner-border text-primary none" role="status">
                        <span class="sr-only">Loading...</span>
                    </div>
                </button>
            </div>

        </form>
        <br />
        <div class="toggle-login-signup" id="toggle-login-signup">
                <small>
                  Don't have an account yet? <a href="#" id="toggle-btn">Sign Up</a>
                </small>
        </div>
              <br />
                   <br />  
        `
}


export default class Authentication {
    constructor(memory, ui) {
        this.memory = memory;
        this.ui = ui;
        this.state = { loading: false, username: "", password: "", isLogin: true };
        this.errors = {};
    }

    getElements() {
        this.emailInput = document.getElementById("email");
        this.passwordInput = document.getElementById("password");
        this.fullnameInput = document.getElementById("fullname");
        this.submitButton = document.getElementById("submit-button");
        this.toggleLoginSignup = document.getElementById("toggle-login-signup");
        this.toggleButton = document.getElementById("toggle-btn");
        this.spinner = document.querySelector(".spinner-border");
        this.alertDiv = document.getElementById("alerts");
        this.form = document.getElementById("form");
    }

    addEventListeners() {
        this.fullnameInput.onkeyup = (event) => {
            this.handleChange(event);
        };
        this.emailInput.onkeyup = (event) => {
            this.handleChange(event);
        };
        this.passwordInput.onkeyup = (event) => {
            this.handleChange(event);
        };
        this.form.onsubmit = (event) => {
            this.handleSubmit(event);
        };
        this.toggleButton.onclick = (event) => {
            event.preventDefault();
            this.toggle();
        };
    }

    setState = function (values) {
        var keys = Object.keys(values);
        for (var i = 0; keys.length > i; i++) {
            this.state[keys[i]] = values[keys[i]];
        }
        if (this.state.loading) {
            if (this.state.loading && this.spinner.className.includes("none")) {
                this.spinner.classList.remove("none");
                this.submitButton.disabled = true;
            } else if (!this.spinner.className.includes("none")) {
                this.spinner.classList.add("none");
            }
        }
        if (this.state.email && this.state.password) {
            this.submitButton.disabled = false;
        } else {
            this.submitButton.disabled = true;
        }
    };

    handleChange = function (event) {
        this.setState({ [event.target.name]: event.target.value });
    };

    handleSubmit = function (event) {
        event.preventDefault();
        this.setState({ loading: true });
        const url = this.state.isLogin ? "/login" : "/register";
        const data = {
            email: this.state.email,
            password: this.state.password,
        };
        if (!this.state.isLogin) {
            data.fullname = this.state.fullname;
        }
        var status;
        fetch(`${AuthBaseURL}${url}`, {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json;charset=utf-8",
            },
        })
            .then((res) => {
                status = res.ok;
                return res.json();
            })
            .then((jsonData) => {
                if (status) {
                    this.ui.setAuthentication(
                        jsonData
                    );
                } else {
                    this.ui.showAlert(jsonData.non_field_errors, "danger");
                }
            });
    };
    toggle() {
        this.setState({ isLogin: !this.state.isLogin });
        this.fullnameInput.parentElement.classList.toggle("none");
        this.submitButton.innerText = this.state.isLogin ? "Log In" : "Sign Up";
        this.toggleLoginSignup.innerHTML = this.state.isLogin
            ? `<small>
                  Don't have an account yet? <a href="#" id="toggle-btn">Sign Up</a>
                </small>`
            : `
                  <small>
                    Already have an account? <a href="#" id="toggle-btn">Log In</a>
                   </small>
                 `;
        this.toggleButton = document.getElementById("toggle-btn");
        this.toggleButton.onclick = (event) => {
            event.preventDefault();
            this.toggle();
        };
    }

    initialize() {
        this.ui.container.innerHTML = LoginForm();
    }

    render() {
        this.initialize();
        this.getElements();
        this.addEventListeners();
    }
}
