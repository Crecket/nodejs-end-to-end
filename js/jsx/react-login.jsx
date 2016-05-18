var ReactLogin = React.createClass({
    handleSubmit: function (e) {
        e.preventDefault();
        var username = this.refs['inputUsername'].value;
        var password = this.refs['inputPassword'].value;

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
    },
    render: function () {
        var button_login = {__html: (this.props.loginLoadingState) ? 'Login <span class="fa fa-refresh fa-spin"></span>' : 'Login'};
        return (
            <div className="col-xs-12 col-md-6 col-md-offset-3 col-lg-4 col-lg-offset-4">
                <form method="post" onSubmit={this.handleSubmit}>
                    <div className="panel panel-success">

                        <div className="panel-heading">
                            Enter your username and password
                        </div>

                        <div className="panel-body">
                            <label className="sr-only">Username</label>
                            <input type="text"
                                   className="form-control input-lg"
                                   placeholder="Username"
                                   ref="inputUsername"
                                   required autofocus autocomplete="off"/>

                            <label className="sr-only">Password</label>
                            <input type="password"
                                   ref="inputPassword"
                                   className="form-control input-lg"
                                   placeholder="Password"/>

                            <button className="btn btn-lg btn-primary btn-block"
                                    type="submit"
                                    dangerouslySetInnerHTML={button_login}/>
                        </div>

                    </div>
                </form>
            </div>
        );
    }
});

