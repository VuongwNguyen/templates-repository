const router = require("express").Router();

// User routes
router.use("/users", require("./user.routes"));

// Example routes (for reference)
router.use("/examples", require("./example.routes"));

// Account routes (uncomment when implemented)
// router.use("/account", require("./account.routes"));

module.exports = router;
