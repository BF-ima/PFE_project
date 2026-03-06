const router=require("express").Router()

const team=require("../controllers/teamController")
const {authenticate}=require("../middleware/authMiddleware")

router.post("/create",authenticate,team.createTeam)

router.post("/add",authenticate,team.addMember)

router.delete("/remove",authenticate,team.removeMember)

module.exports=router