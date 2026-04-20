import express from "express"
import fs from 'fs'
import { json } from "stream/consumers"

// Variaveis
const app = express()

// Informar para o Express que vai ser utilizado o formato JSON no post
app.use(express.json())

// Função para fazer os arquivos serem lidos sempre
function LerJSON (){
    const data = fs.readFileSync('./database/usuarios.json', 'utf-8')
    return JSON.parse(data || '[]')
}

// Função para se caso o usuario for criado
function F_newUser(users, body){
    const newUser = {
        id: Date.now(),
        ...body
    }

    users.push(newUser)

    fs.writeFileSync('./database/usuarios.json', JSON.stringify(users, null, 2))

    return newUser
}

// Metodos HTTP
app.post('/cadastro', (req, res) => {
    // variaveis para guardar o email
    const {email} = req.body

    const users = LerJSON()

    // Verificar se o email já existe no banco
    const emailExistente = users.some(user => user.email === email)

    // validar de o email ja existe no banco de dados
    if (emailExistente){
        console.log("Email já existente.", email)
        return res.status(400).json({
            error: "Esse email já foi cadastrado.",
        })
    }
    else{
        const newUser = F_newUser(users, req.body)
        console.log("Novo usuario cadastrado !", email)
        return res.status(201).json(newUser)
    }
})

app.get('/usuarios', (req, res) => {
    const users = LerJSON()
    res.status(200).json(users)
    console.log(users)
})

app.listen(3000)