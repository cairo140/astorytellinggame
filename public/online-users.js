window.OnlineUsers = class {
  constructor(firebaseApp, rootElement) {
    this.onlineUsersList_ = rootElement.querySelector('.online-users');
    this.users_ = {};

    const onlineUsersRef = firebaseApp.database().ref('onlineUsers');
    onlineUsersRef.on('child_added', data => this.handleChildAdded_(data));
    onlineUsersRef.on('child_removed', data => this.handleChildRemoved_(data));
  }

  handleChildAdded_(data) {
    const el = document.createElement('li');
    el.textContent = data.val().displayName;
    this.onlineUsersList_.appendChild(el);
    this.users_[data.key] = el;
  }

  handleChildRemoved_(data) {
    this.onlineUsersList_.removeChild(this.users_[data.key]);
    delete this.users_[data.key];
  }
}
