/** @jsx React.DOM */

'use strict';

var ChatBox = React.createClass({

  getInitialState: function () {
    return { users: [] };
  },

  componentDidMount: function () {
    this.chatProxy = this.props.chatProxy;
    this.chatProxy.connect(this.props.username);
    this.chatProxy.onMessage(this.addMessage.bind(this));
    this.chatProxy.onUserConnected(this.userConnected.bind(this));
    this.chatProxy.onUserDisconnected(this.userDisconnected.bind(this));
  },

  userConnected: function (user) {
    var users = this.state.users;
    users.push(user);
    this.setState({
      users: users
    });
  },

  userDisconnected: function (user) {
    var users = this.state.users;
    users.splice(users.indexOf(user), 1);
    this.setState({
      users: users
    });
  },

  messageHandler: function (message) {
    message = this.refs.messageInput.getDOMNode().value;
    this.addMessage({
      content: message,
      author: this.chatProxy.getUsername()
    });
    this.chatProxy.broadcast(message);
  },

  addMessage: function (message) {
    if (message) {
      message.date = new Date();
      this.refs.messagesList.addMessage(message);
    }
  },

  render: function () {
    return <div className="chat-box" ref="root">
        <div className="chat-header ui-widget-header">React p2p Web RTC Chat</div>
        <div className="chat-content-wrapper row">
          <UsersList users={this.state.users} username={this.props.username} ref="usersList"></UsersList>
          <MessagesList ref="messagesList"></MessagesList>          
        </div>
        <MessageInput ref="messageInput" messageHandler={this.messageHandler}>
        </MessageInput>
      </div>;
  }
});
/** @jsx React.DOM */
'use strict';

var ChatMessage = React.createClass({

  render: function () {
    var msg = this.props.message;
    var hours = msg.date.getHours();
    var minutes = msg.date.getMinutes();
    hours = hours < 9 ? '0' + hours : hours;
    minutes = minutes < 9 ? '0' + minutes : minutes;
    return <div className="chat-message">
        <div className="message-time">[{hours + ':' + minutes}]</div>
        <div className="message-author">{msg.author}: </div>
        <div className="message-content">{msg.content}</div>
      </div>;
  }
});
/** @jsx React.DOM */

'use strict';

var MessageInput = React.createClass({

  mixins: [React.addons.LinkedStateMixin],

  keyHandler: function (event) {
    var msg = this.state.message.trim();
    if (event.keyCode === 13 && msg.length) {
      this.props.messageHandler(msg);
      this.setState({ message: '' });
    }
  },

  getInitialState: function () {
    return { message: '' };
  },

  render: function () {
    return <input type="text" className="form-control" placeholder="Enter a message... press [enter] to send" valueLink={this.linkState('message')} onKeyUp={this.keyHandler} />;
  }
});
/** @jsx React.DOM */

'use strict';

var MessagesList = React.createClass({

  getInitialState: function () {
    return { messages: [] };
  },

  addMessage: function (message) {
    var messages = this.state.messages;
    var container = this.refs.messageContainer.getDOMNode();
    messages.push(message);
    this.setState({ messages: messages });
    // Smart scrolling - when the user is
    // scrolled a little we don't want to return him back
    if (container.scrollHeight - (container.scrollTop + container.offsetHeight) >= 50) {
      this.scrolled = true;
    } else {
      this.scrolled = false;
    }
  },

  componentDidUpdate: function () {
    if (this.scrolled) {
      return;
    }
    var container = this.refs.messageContainer.getDOMNode();
    container.scrollTop = container.scrollHeight;
  },

  render: function () {
    var messages;
    messages = this.state.messages.map(function (m) {
      return <ChatMessage message={m}></ChatMessage>;
    });
    if (!messages.length) {
      messages = <div className="chat-no-messages">No messages</div>;
    }
    return <div ref="messageContainer" className="chat-messages col-xs-9">
        {messages}
      </div>;
  }
});
/** @jsx React.DOM */
'use strict';

var UsersList = React.createClass({
  render: function () {
    var users = this.props.users.map(function (user) {
      return <div className="chat-user">» {user}</div>;
    });
    return <div className="users-list col-xs-3">
        <span class="badge">{users.length + 1}</span> Users Online:
        {users}
        <div className="chat-user yourself">» {this.props.username}</div>
      </div>;
  }
});
