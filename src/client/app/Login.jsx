import React  from 'react';
import muiThemeable from 'material-ui/styles/muiThemeable';

import CryptoHelper from '../js/CryptoHelper';

import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import Paper from 'material-ui/Paper';
import Checkbox from 'material-ui/Checkbox';


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
                this.props.ChatClient.loginAttempt(username, password);
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
                                    required autoFocus
                                />
                                <br/>
                                <TextField
                                    floatingLabelText="Enter your password"
                                    hintText="Password"
                                    ref="inputPassword"
                                    style={styles.inputs}
                                    type="password"
                                    required autoFocus
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
                    </div>
                </div>
                <div className="col-xs-12 col-sm-4">
                    <div className="box">
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