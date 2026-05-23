const express = require("express");
const router = express.Router();

const { auth, allowRoles } = require("../middlewares/auth");
const adminController = require("../controllers/adminController");

/* =========================
   TEST ADMIN
========================= */
router.get("/ping", auth, allowRoles("ADMIN"), (req, res) => {
  res.json({ ok: true });
});

/* =========================
   USUARIOS
========================= */
router.get("/users", auth, allowRoles("ADMIN"), adminController.getUsers);

router.post("/users", auth, allowRoles("ADMIN"), adminController.createUser);

router.delete("/users/:id", auth, allowRoles("ADMIN"), adminController.deleteUser);

router.put("/users/:id/role", auth, allowRoles("ADMIN"), adminController.updateUserRole);

router.put("/users/:id/unit", auth, allowRoles("ADMIN"), adminController.assignUnit);

router.put("/users/:id/line", auth, allowRoles("ADMIN"), adminController.assignLine);

module.exports = router;