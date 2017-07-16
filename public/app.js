window.App = class {
  constructor(firebaseApp, rootElement, windowObj) {
    this.currentUser_ = null;
    this.database_ = firebaseApp.database();
    this.rootElement_ = rootElement;
    this.windowObj_ = windowObj;

    const auth = firebaseApp.auth();
    auth.signInAnonymously();
    auth.onAuthStateChanged(user => this.handleAuthChange_(user));

    new OnlineUsers(firebaseApp, rootElement.querySelector('.online-users-container'));

    rootElement.style.display = '';
  }

  collectDisplayName_() {
    if (this.currentUser_.displayName) {
      return Promise.resolve(this.currentUser_.displayName);
    }
    return new Promise((resolve, reject) => {
      const displayNamePrompt = this.rootElement_.querySelector('form.display-name-prompt');
      displayNamePrompt.style.display = '';
      displayNamePrompt.querySelector('[type=submit]').disabled = false;
      displayNamePrompt.addEventListener('submit', e => {
        const displayName = displayNamePrompt.querySelector('[name=displayName]').value;
        if (displayName) {
          displayNamePrompt.style.display = 'none';
          resolve(displayName);
        }
        e.preventDefault();
      });
    });
  }

  handleAuthChange_(user) {
    if (!user) {
      console.error(`Unexpectedly signed out. Previous user: ${this.currentUser_}`);
      this.currentUser_ = null;
      return;
    }
    console.log(`Signed in with uid ${user.uid}`);
    this.currentUser_ = user;
    this.collectDisplayName_().then(displayName => {
      console.log(`Updating user profile with new displayName: ${displayName}`);
      return user.updateProfile({displayName: displayName});
    }).then(() => {
      this.onlineUsersRegister_();
    });
  }

  onlineUsersGetRefName_() {
    if (!this.currentUser_) {
      consol.error('onlineUsersGetRefName_ called but signed out.');
      return null;
    }
    return `onlineUsers/${this.currentUser_.uid}`;
  }

  onlineUsersRegister_() {
    const refName = this.onlineUsersGetRefName_();
    this.database_.ref(refName).set({
      displayName: this.currentUser_.displayName
    }).then(() => {
      console.debug(`Saved onlineUsers entry to ${refName}`);
      this.windowObj_.onbeforeunload = () => { this.onlineUsersUnregister_(); };
    });
  }

  onlineUsersUnregister_() {
    const refName = this.onlineUsersGetRefName_();
    this.database_.ref(refName).remove().then(() => {
      console.debug(`Removed onlineUsers entry for ${refName}`);
    });
  }
}
