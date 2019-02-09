const { app, BrowserWindow, ipcMain } = require('electron')
const mongoose = require('mongoose')

const Schema = mongoose.Schema;
const dburl = 'mongodb://admin:etganskesjuktpassord1@ds223605.mlab.com:23605/cpchat'
let mainWindow

// Conect to DB (mLab)
mongoose.connect(dburl, { useNewUrlParser: true }, (err) => {
	console.log('mongo db connection', err)
})

// Schema - CHANNEL
const channelSchema = new Schema({
	title: String,
	topic: String,
	users: {
		name: String
	}
})
// Schema - CHAT
const chatSchema = new Schema({
	name: String,
	message: String,
	date: String,
	channel: String
})
// Schema - User
const userSchema = new Schema({
  name: String
});

// Models
const User = mongoose.model('users', {name: String})
const Channel = new mongoose.model('channel', channelSchema)
const Chat = new mongoose.model('chat', chatSchema)

// Create user
function createUser(username) {
	const user = new mongoose.model('users', userSchema)
	var newUser = new user({
		name: username
	})
}

// Create channel
function createChannel(title, topic) {
	let newChannel = new Channel({
		title: title,
		topic: topic
	})
	newChannel.save(function(err) {
		if(err) return handleError(err)
		//saved
	})
}

// Add message
function addMessage(data, chatAdded) {
	var thischat = mongoose.model('chat', chatSchema)
	var newChat = new thischat({
		name: data.name,
		message: data.message,
		date: data.date,
		channel: data.channel
	})
	newChat.save().then(function(res) {
		// sucess
		console.log('DB Query excecuted - addMessage ')
		chatAdded(res)
	}).catch(function(err) {
		console.log('Error, message: ' + err)
	})
}

// Get chat
function getChat(selectedChannel, resChat) {
	let query = Chat.find({channel: selectedChannel })
	query.exec().then(function (res) {
		// success
		console.log('DB Query excecuted - getChat ')
		resChat(res)
	}).catch(function(err) {
		// error
		console.log('Error, message: ' + err)
	})
}

// Get all users
function getAllUsers() {
	var query = User.find({})
	query.exec(function (err, docs) {
		docs.forEach(element => {
			console.log('Name of user: ' + element.name)
		})
	})
}

// Get user
function getUser(input, userFound) {
	let query = User.find({name: input })
	query.exec().then(function (user) {
		// success
		console.log('DB Query excecuted - getUser ')
		userFound(user)
	}).catch(function(err) {
		// error
		console.log('Error, message: ' + err)
	})
}

// Get all channels
function getAllChannels(input, resChannels) {
	let query = Channel.find({})
	query.exec().then(function(channels) {
		// success
		console.log('DB Query excecuted - getAllChannels ')
		resChannels(channels)
	}).catch(function(err) {
		// error
		console.log('Error, message (get all channels): ' + err)
	})
}


// ==================================================================
/// IPC HANDLING
// ==================================================================

// START UP - SEND ALL CHANNELS
ipcMain.on('startup', function(event, arg) {
	getAllChannels(arg, function(_allChannels) {
		event.sender.send('channel_served', _allChannels);
	})
})

// LOGIN ATTEMPT - GET USER
ipcMain.on('login', function(event, userinput) {
	getUser(userinput, function(user){
		if (user.length) {
			event.sender.send('login_acepted', user);
		} else {
			console.log('no user here')
		}
	})
})

// SET CHAT BASED ON CURRENT CHANNEL
ipcMain.on('getCurrentChannel', function(event, currentChannel) {
	getChat(currentChannel, function(chat) {
		if (chat.length === 0) {
			event.sender.send('channel-chat', false)
		} else {
			event.sender.send('channel-chat', chat)
		}
	})
})

// NEW MESSAGE IN CHAT/CHANNEL
ipcMain.on('new-message', function(event, newChat) {
	addMessage(newChat, function(response) {
		event.sender.send('post-message', response)
	})
})


function createWindow() {
	// Create the browser window.
	mainWindow = new BrowserWindow({ 
		width: 1200, 
		height: 800,
		transparent: true
	})

	// and load the index.html of the app.
	mainWindow.loadFile('index.html')

	// Open the DevTools.
	  mainWindow.webContents.openDevTools()

	// Emitted when the window is closed.
	mainWindow.on('closed', () => {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		mainWindow = null
	})
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
	// On macOS it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

app.on('activate', () => {
	// On macOS it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (mainWindow === null) {
		createWindow()
	}
})
