import express from "express";

const app = express();
app.use(express.json());
app.use(express.static("public"));

app.post("/login",(req,res)=>{

  const { username, password } = req.body;

  if(username==="admin" && password==="1234"){
    return res.json({message:"ok"});
  }

  res.status(401).send("Invalid");
});

let complaints = [];
let count = 1;

app.post("/complaints", (req, res) => {
  const { name, room, email, category, subject, description } = req.body;

  const complaint = {
    id: "CMP" + String(count++).padStart(3, "0"),
    name,
    room,
    email,
    category,
    subject,
    description,
    status: "pending"
  };

  complaints.push(complaint);
  res.json(complaint);
});

app.get("/complaints", (req, res) => res.json(complaints));

app.put("/complaints/:id",(req,res)=>{

const complaint = complaints.find(c=>c.id===req.params.id);
if(!complaint) return res.status(404).send("Not found");

if(complaint.status!=="pending"){
return res.json({message:"Final state cannot be changed"});
}

complaint.status = req.body.status;
complaint.remarks = req.body.remarks || "";

res.json(complaint);
});

app.delete("/complaints/:id", (req, res) => {
  complaints = complaints.filter(c => c.id !== req.params.id);
  res.json({ message: "Deleted" });
});

const PORT = 5000;
app.listen(PORT, () => console.log("Server running on", PORT));