const socket = io();

// Elements
const messageForm = document.querySelector('#message-form');
const messageFormInput = messageForm.querySelector('input');
const messageFormButton = messageForm.querySelector('button');
const sendLocationButton = document.querySelector('#send-location');
const messages = document.querySelector('#messages');
const sidebar = document.querySelector('#sidebar');

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationMessageTemplate = document.querySelector(
  '#location-message-template'
).innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

// Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoScroll = () => {
  // new message
  const newMessage = messages.lastElementChild;

  // height of new message
  const newMessageStyles = getComputedStyle(newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = newMessage.offsetHeight + newMessageMargin;

  // Visible height
  const visibleHeight = messages.offsetHeight;

  // height of messages container
  const containerHeight = messages.scrollHeight;

  //how far have i scrolled
  const scrollOffset = messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    messages.scrollTop = messages.scrollHeight;
  }
};

socket.on('message', (message) => {
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format('h:mm a'),
  });
  messages.insertAdjacentHTML('beforeend', html);
  autoScroll();
});

socket.on('locationMessage', (mess) => {
  const html = Mustache.render(locationMessageTemplate, {
    username: mess.username,
    url: mess.url,
    createdAt: moment(mess.createdAt).format('h:mm a'),
  });
  messages.insertAdjacentHTML('beforeend', html);
  autoScroll();
});

socket.on('roomData', ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, { room, users });
  sidebar.innerHTML = html;
});

messageForm.addEventListener('submit', (e) => {
  e.preventDefault();

  messageFormButton.setAttribute('disabled', 'disabled');

  const message = e.target.elements.message.value;
  socket.emit('sendMessage', message, (e) => {
    messageFormButton.removeAttribute('disabled');
    messageFormInput.value = '';
    messageFormInput.focus();
  });
});

sendLocationButton.addEventListener('click', () => {
  if (!navigator.geolocation) {
    return alert('GeoLocation is not supported by your browser');
  }
  sendLocationButton.setAttribute('disabled', 'disabled');
  navigator.geolocation.getCurrentPosition((pos) => {
    socket.emit(
      'sendLocation',
      {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      },
      () => {
        sendLocationButton.removeAttribute('disabled');
      }
    );
  });
});

socket.emit('join', { username, room }, (err) => {
  if (err) {
    alert(err);
    location.href = '/';
  }
});
