const db=require("../config/db")

exports.createTeam=async(req,res)=>{

const leader=req.user.id
const {name}=req.body

const [team]=await db.execute(
"INSERT INTO teams(name,leader_id) VALUES(?,?)",
[name,leader]
)

await db.execute(
"INSERT INTO team_members(team_id,student_id) VALUES(?,?)",
[team.insertId,leader]
)

res.json({message:"team created"})

}

exports.addMember=async(req,res)=>{

const {team_id,student_id}=req.body

await db.execute(
"INSERT INTO team_members(team_id,student_id) VALUES(?,?)",
[team_id,student_id]
)

res.json({message:"member added"})

}

exports.removeMember=async(req,res)=>{

const {team_id,student_id}=req.body

await db.execute(
"DELETE FROM team_members WHERE team_id=? AND student_id=?",
[team_id,student_id]
)

res.json({message:"member removed"})

}


