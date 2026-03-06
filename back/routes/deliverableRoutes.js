const router=require("express").Router()

const deliverable=require("../controllers/deliverableController")
const upload=require("../middleware/upload")

const {authenticate}=require("../middleware/authMiddleware")

router.post(
"/upload",
authenticate,
upload.single("file"),
deliverable.uploadDeliverable
)

module.exports=router