import React  from 'react';
import muiThemeable from 'material-ui/styles/muiThemeable';

import CryptoHelper from './CryptoHelper';

// import PersonAdd from 'material-ui/svg-icons/social/person-add';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import Paper from 'material-ui/Paper';
import Checkbox from 'material-ui/Checkbox';
import {Tabs, Tab} from 'material-ui/Tabs';

const styles = {
    inputs: {
        width: '100%',
    },
    tabs: {
        padding: 20,
    },
    paperLoginStyle: {
        width: '100%',
        padding: 20,
        textAlign: 'center',
        display: 'inline-block',
    },
    checkbox: {
        marginTop: 6,
    },
};


class Login extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            rememberme: false
        };
    };

    // submit login screen
    handleSubmit = (e) => {
        e.preventDefault();
        // get input field values
        var username = this.refs.inputUsername.input.value;
        var password = this.refs.inputPassword.input.value;

        // if empty it counts as undefined
        password = !password ? "" : password;

        // check if we're already handeling a login request
        if (!this.props.loginLoadingState) {

            // verify the input
            if (!CryptoHelper.validPasswordType(password)) {
                this.props.openModal('The maximum password length is 512', 'Invalid password given');
            } else if (username.length < 3 || username.length > 25) {
                this.props.openModal('Username has to be between 3 and 25 characters long', 'Invalid username');
            } else {
                // update login loading state
                this.props.loginLoadingCallback();
                // start a new login attempt
                this.props.ChatClient.loginAttempt(username, password);
            }
        }
    };


    // submit login screen
    handleRegisterSubmit = (e) => {
        e.preventDefault();
        // get input field values
        var username = this.refs.inputUsernameRegister.input.value;
        var password = this.refs.inputPasswordRegister.input.value;
        var passwordRepeat = this.refs.inputPasswordRepeatRegister.input.value;

        // if empty it counts as undefined
        password = !password ? "" : password;
        passwordRepeat = !passwordRepeat ? "" : passwordRepeat;

        // check if we're already handeling a login request
        if (!this.props.loginLoadingState) {

            // verify the input
            if (passwordRepeat !== password) {
                this.props.openModal('The two passwords you entered do not match. Make sure you enter the same password twice.', 'Passwords don\'t match');
            } else if (!CryptoHelper.validPasswordType(password)) {
                this.props.openModal('The maximum password length is 512', 'Invalid password given');
            } else if (username.length < 3 || username.length > 25) {
                this.props.openModal('Username has to be between 3 and 25 characters long', 'Invalid username');
            } else {
                // update login loading state
                this.props.loginLoadingCallback();
                // start a new login attempt
                this.props.ChatClient.registrationAttempt(username, password);
            }
        }
    };

    // handle checkbox rememberme click
    remembermeClick = () => {
        if (this.state.rememberme === true) {
            this.setState({rememberme: false});
            this.props.remembermeCheckboxCallback(false);
        } else {
            this.setState({rememberme: true});
            this.props.remembermeCheckboxCallback(true);
        }
    };

    // login with random test account
    testLogin = (e) => {
        e.preventDefault();
        if (!this.props.loginLoadingState) {
            // update login loading state
            this.props.loginLoadingCallback();
            // start a new login attempt with a random test1 t/m test99 account
            this.props.ChatClient.loginAttempt('test' + (1 + Math.floor(Math.random() * 99)), '');
        }
    };

    render() {
        return (
            <div className="row center-xs">
                <div className="col-xs-12 col-sm-6">
                    <div className="box">
                        <Tabs style={styles.tabs}>
                            <Tab label="Login">
                                <Paper style={styles.paperLoginStyle} zDepth={1}>
                                    <form onSubmit={this.handleSubmit}>
                                        <p> Sign in to your account </p>
                                        <TextField
                                            floatingLabelText="Enter your username"
                                            hintText="Username"
                                            ref="inputUsername"
                                            style={styles.inputs}
                                            type="text" required autoFocus
                                        />
                                        <br/>
                                        <TextField
                                            floatingLabelText="Enter your password"
                                            hintText="Password"
                                            ref="inputPassword"
                                            style={styles.inputs}
                                            type="password" required
                                        />
                                        <br />
                                        <Checkbox
                                            label="Remember Me"
                                            checked={this.state.rememberme}
                                            onClick={this.remembermeClick}
                                            style={styles.checkbox}
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
                            </Tab>
                            <Tab label="Register">
                                <Paper style={styles.paperLoginStyle} zDepth={1}>
                                    <form onSubmit={this.handleRegisterSubmit}>
                                        <p> Register a new account </p>
                                        <TextField
                                            floatingLabelText="Enter your username"
                                            hintText="Username"
                                            ref="inputUsernameRegister"
                                            style={styles.inputs}
                                            type="text" required autoFocus
                                        />
                                        <br/>
                                        <TextField
                                            floatingLabelText="Enter your password"
                                            hintText="Password"
                                            ref="inputPasswordRegister"
                                            style={styles.inputs}
                                            type="password"
                                            required/>
                                        <br/>
                                        <TextField
                                            floatingLabelText="Enter your password again"
                                            hintText="Password"
                                            ref="inputPasswordRepeatRegister"
                                            style={styles.inputs}
                                            type="password" required
                                        />
                                        <br />
                                        <RaisedButton
                                            style={styles.inputs}
                                            type="submit"
                                            label="Register"
                                            onClick={this.handleRegisterSubmit}
                                            primary={true}
                                        />
                                    </form>
                                </Paper>
                            </Tab>
                        </Tabs>
                    </div>
                </div>
                <div className="col-xs-12 col-sm-4">
                    <div className="box" style={styles.tabs}>
                        <Paper style={styles.paperLoginStyle} zDepth={1}>
                            <p>Test accounts with no password</p>
                            <RaisedButton
                                style={styles.inputs}
                                type="submit"
                                label="Login"
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

// give theme context
Login.childContextTypes = {
    muiTheme: React.PropTypes.object.isRequired,
};
export default muiThemeable()(Login);