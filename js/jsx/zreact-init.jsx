// shitty trick using a 'z' to make sure this is loaded last
ReactDOM.render(
    <ReactApp/>,
    document.getElementById('app')
);
info('Mounted react succesfully');