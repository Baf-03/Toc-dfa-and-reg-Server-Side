import todoModel from "../models/todoSchema.js";
import userModel from "../models/userSchema.js";

// Define the Caesar cipher shift value
const shift = 3;

// Encrypt function using a simple Caesar cipher
const encrypt = (text) => {
  return text.split('')
    .map(char => String.fromCharCode(char.charCodeAt(0) + shift))
    .join('');
};

// Decrypt function using a simple Caesar cipher
const decrypt = (text) => {
  return text.split('')
    .map(char => String.fromCharCode(char.charCodeAt(0) - shift))
    .join('');
};

const createTodo = async (req, res) => {
  const { desc, status, adminName } = req.body;
  if (!desc || !adminName) {
    return res.json({
      data: null,
      status: false,
      message: "Required fields are missing",
    });
  }

  const checkUserStatus = await userModel.findOne({ admin_name: adminName }).any_active_req;
  if (checkUserStatus) {
    return res.json({
      data: null,
      status: false,
      message: "Hit after pending request",
    });
  }

  const encryptedDesc = encrypt(desc);

  const objToSend = {
    desc: encryptedDesc,
    status,
    admin_name: adminName,
  };

  try {
    const db_resp = await todoModel.create(objToSend);
    const decryptedResp = {
      ...db_resp._doc,
      desc: decrypt(db_resp.desc), // Decrypt before sending to client
    };
    res.json(decryptedResp);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create to-do' });
  }
};

const getTodos = async (req, res) => {
  const { adminName } = req.params;

  if (adminName !== req.userEmail) {
    return res.status(403).json({ message: 'You are not authorized to fetch these to-dos.' });
  }

  const todos = await todoModel.find({ admin_name: adminName });

  // Decrypt the description for each to-do
  const decryptedTodos = todos.map(todo => {
    return {
      ...todo._doc,
      desc: decrypt(todo.desc)
    };
  });

  res.json({
    data: decryptedTodos,
    status: true,
  });
};

const changeStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (status !== 1 && status !== 0) {
    return res.json({
      data: null,
      status: false,
      message: "Required fields are missing",
    });
  }
  const data = await todoModel.findOneAndUpdate({ _id: id }, { status }, { new: true });
  res.json(data);
};

const updateDesc = async (req, res) => {
  const { id } = req.params;
  const { desc } = req.body;
  if (!desc || !id) {
    return res.json({
      message: "Required fields are missing",
      data: null,
      status: false,
    });
  }

  // Encrypt the new description
  const encryptedDesc = encrypt(desc);

  try {
    await todoModel.findOneAndUpdate({ _id: id }, { desc: encryptedDesc });
    res.json({
      message: "To-do updated!",
      status: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update to-do",
      status: false,
    });
  }
};

const tmpDeleteTodo = async (req, res) => {
  const { id } = req.params;
  const { method } = req.body;

  if (!id || !method) {
    return res.status(400).json({ message: "Missing ID or method in request" });
  }

  try {
    let updateQuery;
    let message;

    switch (method) {
      case "recover":
        updateQuery = { is_deleted: false };
        message = "Todo recovered";
        break;
      case "delete":
        updateQuery = { is_deleted: true };
        message = "Todo deleted temporarily";
        break;
      default:
        return res.status(400).json({ message: "Unknown update method" });
    }

    await todoModel.findOneAndUpdate({ _id: id }, updateQuery);
    res.json({ message });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const deleteAllTemp = async (req, res) => {
  const { id } = req.params;
  if (id !== req.userEmail) {
    return res.status(403).json({ message: 'You are not authorized to delete these to-dos.' });
  }
  try {
    await todoModel.updateMany(
      { admin_name: id },
      { $set: { is_deleted: true } }
    );
    res.status(200).json({ message: "Todos deleted temporarily" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export { createTodo, changeStatus, updateDesc, tmpDeleteTodo, deleteAllTemp, getTodos };
