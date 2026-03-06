const db=require("../config/db")

exports.uploadDeliverable=async(req,res)=>{

const {team_id,title}=req.body

const file=req.file.filename

await db.execute(
`
INSERT INTO deliverables(team_id,title,file_path,version)
VALUES(?,?,?,1)
`,
[team_id,title,file]
)

res.json({message:"file uploaded"})

}