import { comparePassword, hashPassword } from '../utils/password.js'

const password = 'minha-senha'

const hash = await hashPassword(password)
const correct = await comparePassword(password, hash)
const incorrect = await comparePassword('senha-errada', hash)

console.log(`Senha original: ${password}`)
console.log(`Hash: ${hash}`)
console.log(`Senha correta: ${correct}`)
console.log(`Senha incorreta: ${incorrect}`)
