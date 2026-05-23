/**
 * ==========================================================
 * Archivo: controllers/authController.js
 * ----------------------------------------------------------
 * Controlador de autenticación.
 *
 * Responsabilidad:
 * - Gestionar el registro de usuarios
 * - Validar credenciales de acceso
 * - Generar tokens JWT
 *
 * Este archivo contiene la lógica de negocio
 * asociada a la autenticación del sistema.
 *
 * NO define rutas.
 * ==========================================================
 */

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

/* =========================
   SIGNUP
========================= */
exports.signup = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  try {
    const exists = await User.findOne({ username });
    if (exists) {
      return res.status(400).json({ error: "Usuario ya existe" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      password: hashedPassword,
      role: "USUARIO",
    });

    await user.save();

    res.status(201).json({ message: "Usuario creado" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error creando usuario" });
  }
};

/* =========================
   SIGNIN
========================= */
exports.signin = async (req, res) => {
  console.log("POST /signin recibido", req.body);

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    console.log("JWT_SECRET SIGN:", process.env.JWT_SECRET);
    
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.json({
      token,
      userId: user._id,
      username: user.username,
      role: user.role,
    });

  } catch (err) {
    console.error("ERROR EN SIGNIN:", err);
    return res.status(500).json({ error: "Error en login" });
  }
};