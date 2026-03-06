const router=require("express").Router()

const wish=require("../controllers/wishController")
const {authenticate}=require("../middleware/authMiddleware")

router.post("/",authenticate,wish.addWish)

router.get("/:team_id",authenticate,wish.getTeamWishes)

module.exports=router
