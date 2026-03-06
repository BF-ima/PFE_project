const db = require("../config/db");

exports.getAllProjects = async (req,res)=>{
try{

const [projects] = await db.execute(`
SELECT 
p.id,
p.title,
p.description,
p.technologies,
p.speciality,
p.max_students,
u.full_name AS teacher
FROM projects p
LEFT JOIN users u ON p.teacher_id = u.id
`);

res.json(projects);

}catch(err){
console.error(err)
res.status(500).json({message:"Server error"})
}
}

exports.searchProjects = async (req,res)=>{

try{

const keyword = req.query.keyword;

const [projects] = await db.execute(
`
SELECT * FROM projects
WHERE title LIKE ?
OR description LIKE ?
`,
[`%${keyword}%`,`%${keyword}%`]
);

res.json(projects);

}catch(err){

res.status(500).json({message:"Server error"})

}

}

exports.filterProjects = async (req,res)=>{

try{

const {speciality,technology} = req.query;

let query = "SELECT * FROM projects WHERE 1=1";
let params=[];

if(speciality){

query+=" AND speciality=?";
params.push(speciality)

}

if(technology){

query+=" AND technologies LIKE ?";
params.push(`%${technology}%`)

}

const [projects] = await db.execute(query,params);

res.json(projects)

}catch(err){

res.status(500).json({message:"Server error"})

}

}

exports.getProjectDetails = async (req,res)=>{

try{

const id = req.params.id;

const [project] = await db.execute(
`
SELECT 
p.*,
u.full_name AS teacher,
u.email AS teacher_email
FROM projects p
LEFT JOIN users u ON p.teacher_id = u.id
WHERE p.id=?
`,
[id]
);

if(project.length==0){

return res.status(404).json({message:"Project not found"})

}

res.json(project[0])

}catch(err){

res.status(500).json({message:"Server error"})

}

}

exports.projectStatus = async (req,res)=>{

try{

const projectId = req.params.id;

const [candidates] = await db.execute(
`
SELECT COUNT(*) as total
FROM wishes
WHERE project_id=?
`,
[projectId]
);

res.json({
project_id:projectId,
applications:candidates[0].total
})

}catch(err){

res.status(500).json({message:"Server error"})

}

}

exports.saveProjectView = async (req,res)=>{

try{

const studentId = req.user.id;
const projectId = req.params.id;

await db.execute(
`
INSERT INTO project_views(student_id,project_id)
VALUES(?,?)
`,
[studentId,projectId]
);

res.json({message:"view saved"})

}catch(err){

res.status(500).json({message:"Server error"})

}

}