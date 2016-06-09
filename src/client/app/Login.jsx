import React  from 'react';

import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import {blue100, cyanA400, lightBlue500} from 'material-ui/styles/colors';
import Paper from 'material-ui/Paper';


const styles = {
    inputs: {
        width: '100%',
    },
    paperLoginStyle: {
        margin: 20,
        padding: 20,
        textAlign: 'center',
        display: 'inline-block',
    },
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

    testLogin = (e) => {
        e.preventDefault();
        if (!this.props.loginLoadingState) {
            // update login loading state
            this.props.loginLoadingCallback();
            // start a new login attempt with a random test1 t/m test99 account
            SessionHelper.loginAttempt('test' + (1 + Math.floor(Math.random() * 99)), '');
        }
    };

    render() {
        return (
            <div className="row center-xs">
                <div className="col-xs-12 col-sm-4">
                    <div className="box">
                        <Paper style={styles.paperLoginStyle} zDepth={1}>
                            <form onSubmit={this.handleSubmit}>
                                <p> Enter your username and password </p>
                                <TextField
                                    floatingLabelText="Enter your username"
                                    hintText="Username"
                                    ref="inputUsername"
                                    style={styles.inputs}
                                    type="text"
                                    required autofocus
                                />
                                <br/>
                                <TextField
                                    floatingLabelText="Enter your password"
                                    hintText="Password"
                                    ref="inputPassword"
                                    style={styles.inputs}
                                    type="password"
                                    required autofocus
                                />
                                <br />
                                <RaisedButton
                                    style={styles.inputs}
                                    type="submit"
                                    label="Login"
                                    onClick={this.handleSubmit}
                                    primary={true}
                                />

                            </form>
                        </Paper>
                    </div>
                </div>
                <div className="col-xs-12 col-sm-4">
                    <div className="box">
                        <Paper style={styles.paperLoginStyle} zDepth={1}>
                            <p>Test accounts with no password</p>
                            <RaisedButton
                                style={styles.inputs}
                                type="submit"
                                label="Login with test account"
                                onClick={this.testLogin}
                                primary={true}
                            />
                        </Paper>
                    </div>
                </div>
            </div>
        );
    };
}

export default Login;