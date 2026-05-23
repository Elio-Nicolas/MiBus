const User = require("../models/User");
const bcrypt = require("bcrypt");

/* =========================
   LISTAR USUARIOS
========================= */
exports.getUsers = async (req, res) => {
  try {
    console.log("ADMIN USERS by:", req.user.userId);

    const users = await User.find({}, "-password");
    res.json(users);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error obteniendo usuarios" });
  }
};

/* =========================
   CREAR USUARIO
========================= */
exports.createUser = async (req, res) => {
  try {
    const { username, password, role, assignedUnit } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username y password requeridos" });
    }

    const exists = await User.findOne({ username });
    if (exists) {
      return res.status(400).json({ error: "El usuario ya existe" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      password: hashedPassword,
      role: role || "USUARIO",
      assignedUnit: assignedUnit || null,
    });

    await newUser.save();

    res.status(201).json({
      message: "Usuario creado correctamente",
      user: {
        _id: newUser._id,
        username: newUser.username,
        role: newUser.role,
        assignedUnit: newUser.assignedUnit,
      },
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error creando usuario" });
  }
};

/* =========================
   ELIMINAR USUARIO
========================= */
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    await User.findByIdAndDelete(id);

    res.json({ ok: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al eliminar usuario" });
  }
};

/* =========================
   CAMBIAR ROL
========================= */
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    user.role = role;
    await user.save();

    res.json({
      msg: "Rol actualizado",
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error actualizando rol" });
  }
};

/* =========================
   ASIGNAR UNIDAD
========================= */
exports.assignUnit = async (req, res) => {
  try {
    const { unit } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { assignedUnit: unit },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(user);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error actualizando unidad" });
  }
};

/* =========================
   ASIGNAR LINEA
========================= */
exports.assignLine = async (req, res) => {
  try {
    const { line } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { assignedLine: line },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(user);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error actualizando línea" });
  }
};