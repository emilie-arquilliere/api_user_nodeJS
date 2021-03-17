const fs = require("fs");
const express = require("express");
const fileUpload = require('express-fileupload');
var mv = require('mv');
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.static('public'));
app.use(fileUpload({createParentPath: true}));
app.use(express.json());
const getAge = birthDate => new Date(
  (Date.now() - Date.parse(birthDate))
).getFullYear() - 1970

const readUsers = () =>
  JSON.parse(fs.readFileSync("./user.json").toString())
      .map(user => ({
        ...user,
        age: getAge(user.birthDate)
      }));

app.get("/users", (req, res) => {
  res.json(readUsers());
});

app.post("/users", (req, res) => {
  const body = req.body;
  // Récupère la liste des users
  const users = readUsers();
  
  //on vérifie si l'email existe deja
  let verifEmail = 0;
  users.forEach(user => {
    if(user.email === body.email){
      console.log("Cet email est déjà utilisé.");
      verifEmail = -1;
    }
  });
  if(verifEmail === -1) return res.json({errorMail: "Cet email est déjà utilisé"});

  //on enregistre l'image
  let chemin = '';
  if (req.files) {
    const file = req.files.avatarUrl;
    chemin = "http://localhost:6929/"+file.name;
    let ok = 0;
    file.mv(`${__dirname}/public/${file.name}`, function (err) {
      if (err) {
        ok = -1
      }
    });
    if(ok === -1){
      return res.status(500).send({ msg: "Erreur : problème lors de la sauvegarde de l'image" }); 
    }
  }

  // Création du nouveau user
  const newUser = {
    id: Math.max(...users.map((user) => user.id)) + 1,
    lastName: body.lastName.toUpperCase(),
    firstName: body.firstName,
    email: body.email,
    birthDate: body.birthDate,
    avatarUrl: chemin,
    gender: body.gender,
    age: getAge(body.birthDate)
  };
  // Ajoute le nouveau user dans le tableau d'users
  users.push(newUser);
  // Ecris dans le fichier pour insérer la liste des users
  fs.writeFileSync("./user.json", JSON.stringify(users, null, 4));
  res.json(users);
});

app.put("/users/:id", (req, res) => {
  const body = req.body;
  const id = Number(req.params.id);
  // Récupère la liste des users
  const users = readUsers();

   //on vérifie si l'email existe deja
  const emailUsers = users;
  let verifEmail = 0;
  emailUsers
   .filter((user) => user.id != id)
   .forEach((user) => {
    if(user.email === body.email){
      console.log("Cet email est déjà utilisé.");
      verifEmail = -1;
    }
  });
  if(verifEmail === -1) return res.json({errorMail: "Cet email est déjà utilisé"});

  //on enregistre l'image
  let chemin = '';
  if (req.files) {
    const file = req.files.avatarUrl;
    chemin = "http://localhost:6929/"+file.name;
    let ok = 0;
    file.mv(`${__dirname}/public/${file.name}`, function (err) {
      if (err) {
        ok = -1
      }
    });
    if(ok === -1){
      return res.status(500).send({ msg: "Erreur : problème lors de la sauvegarde de l'image" }); 
    }
  }

  // Modification d'un user
  const newUser = {
    id: id,
    lastName: body.lastName.toUpperCase(),
    firstName: body.firstName,
    email: body.email,
    birthDate: body.birthDate,
    avatarUrl: chemin,
    gender: body.gender,
    age: getAge(body.birthDate)
  };
  // Ajoute le nouveau user dans le tableau d'users
  const newUsers = [...users.filter((user) => user.id !== id), newUser];
  // Ecris dans le fichier pour insérer la liste des users
  fs.writeFileSync("./user.json", JSON.stringify(newUsers, null, 4));
  res.json(newUser);
});

app.get("/users/:id", (req, res) => {
  const body = req.body;

  // Récupère la liste des users
  const users = readUsers();
  const user = users.find((user) => user.id === Number(req.params.id));

  res.json(user);
});

app.delete("/user/:id", (req, res)=>{
  //on récupère l'id du user a supprimer et la liste des users
  const id = req.params.id;
  const users = readUsers();

  const NewUsers = users.filter((user) => user.id != id);
  fs.writeFileSync("./user.json", JSON.stringify(NewUsers, null, 4));
  res.json(NewUsers);
});

//fonction pour l'upload d'image
app.post('/upload/:id', (req,res)=>{
  const id = req.params.id;
  let path = '';

});

app.listen(6929, () => console.log("server is running"));
