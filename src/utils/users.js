const users = [];

const addUser = ({ id, username, room }) => {
  // clean data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  // Validate data
  if (!username || !room) {
    return {
      error: 'Username and room are required',
    };
  }

  //check duplicate user
  const existingUser = users.find(
    (u) => u.room === room && u.username === username
  );

  // Validate username
  if (existingUser) {
    return {
      error: 'Username is in use',
    };
  }

  //store user
  const user = { id, username, room };
  users.push(user);
  return { user };
};

const removeUser = (id) => {
  const index = users.findIndex((u) => u.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

const getUser = (id) => users.find((u) => u.id === id);

const getUsersInRoom = (room) => users.filter((u) => u.room === room);

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
};
