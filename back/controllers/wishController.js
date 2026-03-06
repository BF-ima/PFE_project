const db=require("../config/db")

exports.addWish=async(req,res)=>{

const {team_id,project_id,priority}=req.body

await db.execute(
"INSERT INTO wishes(team_id,project_id,priority) VALUES(?,?,?)",
[team_id,project_id,priority]
)

res.json({message:"wish added"})

}
exports.getTeamWishes=async(req,res)=>{

const teamId=req.params.team_id

const [wishes]=await db.execute(
`
SELECT w.*,p.title
FROM wishes w
JOIN projects p ON w.project_id=p.id
WHERE team_id=?
ORDER BY priority
`,
[teamId]
)

res.json(wishes)

}