import React  from 'react';

import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import Paper from 'material-ui/Paper';

const paperLoginStyle = {
    margin: 20,
    padding: 20,
    textAlign: 'center',
    display: 'inline-block',
};

class Login extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {};

        // this.handleSubmit = this.handleSubmit.bind(this);
    };

    handleSubmit = (e) => {
        e.preventDefault();
        // get input field values
        var username = this.refs.inputUsername.input.value;
        var password = this.refs.inputPassword.input.value;

        // if empty it counts as undefined
        if (!password) {
            password = "";
        }

        // check if we're already handeling a login request
        if (!this.props.loginLoadingState) {
            // validate input
            if (username.length > 2 && username.length < 25 && CryptoHelper.validPasswordType(password)) {
                // update login loading state
                this.props.loginLoadingCallback();
                // start a new login attempt
                SessionHelper.loginAttempt(username, password);
            }
        }
    };

    render() {
        return (
            <Paper style={paperLoginStyle} zDepth={1}>
                <form onSubmit={this.handleSubmit}>
                    <p> Enter your username and password </p>
                    <TextField
                        floatingLabelText="Enter your username"
                        hintText="Username"
                        ref="inputUsername"
                        type="text"
                        required autofocus
                    />
                    <br/>
                    <TextField
                        floatingLabelText="Enter your password"
                        hintText="Password"
                        ref="inputPassword"
                        type="password"
                        required autofocus
                    />
                    <br />
                    <RaisedButton type="submit" label="Login" onClick={this.handleSubmit} primary={true}/>

                </form>
            </Paper>
        );
    };
}

export default Login;