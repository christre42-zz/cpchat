const ipcRenderer = require('electron').ipcRenderer;

let profile, currentChannel
let channels = []

// UI-components 
const channelsDiv = document.querySelector('.channels')
const profileDiv = document.querySelector('.profile')
const channelMetaDiv = document.querySelector('.channel-meta')
let chatDiv = document.querySelector('.chat')
let allChannelsDivs = []

// Startup
ipcRenderer.send('startup', 'clean text, string')


// Show all channels on start
ipcRenderer.on('channel_served', function (arg, e) {
  for (i in e) {
    channels.push(e[i]._doc)
    channelsDiv.innerHTML += '<div class="channel name ' + e[i]._doc.title
      + '" id="' + e[i]._doc.title + '">#' + e[i]._doc.title + '</div>'
  }
  currentChannel = channels[0]
  // Set first channel as active
  allChannelsDivs = document.querySelectorAll('.channel')
	allChannelsDivs[0].classList.add('isactive')
	
  allChannelsDivs.forEach(function (el) {
		el.addEventListener('click', clickOnChannel)
	})
	
  // Set active channel to meta
  channelMetaDiv.innerHTML = 'channel: ' + currentChannel.title
  // Send it to server
  ipcRenderer.send('getCurrentChannel', currentChannel.title)
})

// This one is beeing called from <form> inline
function login() {
  var username = document.querySelector('#loginname').value
  ipcRenderer.send('login', username)
}

// Login accepted
ipcRenderer.on('login_acepted', function (arg, user) {
  profile = user[0]._doc
  profileDiv.innerHTML = profile.name
  document.querySelector('.loginwrapper').style.display = 'none'
})

// Current chat
ipcRenderer.on('channel-chat', function (arg, chat) {
	chatDiv.innerHTML = ''
  if (!chat) {
		chatDiv.innerHTML = 'This conversation has no content yet'
	} 
	if (chat) {
		for (i in chat) {
			chatDiv.innerHTML += '<div class="chat-item"><div class="chat-name">'
				+ chat[i]._doc.name + ':</div>'
				+ '<div class="chat-date">' + chat[i]._doc.date + '</div>'
				+ '<div class="chat-message">' + chat[i]._doc.message + '</div></div>'
		}
	}
})

function clickOnChannel(event) {
	let selectedChannel = event.target.id
	setCurrentChannelByName(selectedChannel)

  allChannelsDivs.forEach(function (el) {
    el.classList.remove('isactive')
	})
	event.target.classList.add('isactive')
	channelMetaDiv.innerHTML = 'channel: ' + currentChannel.title
	ipcRenderer.send('getCurrentChannel', currentChannel.title)
}

function setCurrentChannelByName(name) {
	for(i in channels) {
		if(channels[i].title === name) {
			currentChannel = channels[i]
		}
	}
}