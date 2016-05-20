import React from 'react';
import User from './User.jsx';

import {List, ListItem} from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import Divider from 'material-ui/Divider';

const userListStyle = {
    textAlign: 'left'
};

class UserList extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {};
    };
    

    render() {
        var fn = this;
        return (
            <List style={userListStyle}>
                <Subheader>Users</Subheader>
                {Object.keys(this.props.users).map(function (key) {
                    return <User userClickCallback={fn.props.userClickCallback}
                                 key={key}
                                 username={key}/>;
                })}
                <Divider/>
            </List>
        );
    };
}


export default UserList;