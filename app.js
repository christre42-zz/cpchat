const ipcRenderer = require('electron').ipcRenderer; 

let profile, currentChannel
let channels = []


// UI-components 
const channelsDiv = document.querySelector('.channels')
const profileDiv = document.querySelector('.profile')
const chatDiv = document.querySelector('.chat')
const channelMetaDiv = document.querySelector('.channel-meta')


// Startup
ipcRenderer.send('startup', 'clean text, string')


// Show all channels on start
ipcRenderer.on('channel_served', function(arg, e) { 
  for (i in e) {
    channels.push(e[i]._doc)
    channelsDiv.innerHTML += '<div class="channel name ' + e[i]._doc.title 
    + '" id="' + e[i]._doc.title + '">#' + e[i]._doc.title + '</div>'
  }
  currentChannel = channels[0]
  // Set first channel as active
  let _allChannelsDivs = document.querySelectorAll('.channel')
  _allChannelsDivs[0].classList.add('isactive')
  // Set active channel to meta
  channelMetaDiv.innerHTML = 'channel: ' + currentChannel.title
  // Send it to server
  ipcRenderer.send('getCurrentChannel', currentChannel.title)
})


function login() {
  var username = document.querySelector('#loginname').value
  ipcRenderer.send('login', username)
}

// Login accepted
ipcRenderer.on('login_acepted', function(arg, user) {
  profile = user[0]._doc
  profileDiv.innerHTML = profile.name
  document.querySelector('.loginwrapper').style.display = 'none'
})

// Current chat
ipcRenderer.on('channel-chat', function(arg, chat) {
  if(!chat) {
    chatDiv.innerHTML+= '<div class="chat-item">This conversation has no content yet</div>' 
  }
  for (i in chat) {
    console.log(chat)
    chatDiv.innerHTML+= '<div class="chat-item"><div class="chat-name">' 
    + chat[i]._doc.name + ':</div>' 
    + '<div class="chat-date">' + chat[i]._doc.date + '</div>' 
    + '<div class="chat-message">' + chat[i]._doc.message + '</div></div>'
  }
})