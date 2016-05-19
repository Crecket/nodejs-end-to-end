import React from 'react';
import User from './User.jsx';

class UserList extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {};
    };
    
    render() {
        var fn = this;
        return (
            <div className="col-xs-12">
                <div className="row">
                    <div className="panel panel-info">
                        <div className="panel-heading">
                            Users
                        </div>
                        <div className="panel-body">
                            <ul className="userListReact">
                                {Object.keys(this.props.users).map(function (key) {
                                    return <User userClickCallback={fn.props.userClickCallback} key={key}
                                                 username={key}/>;
                                })}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        );
    };
}


export default UserList;