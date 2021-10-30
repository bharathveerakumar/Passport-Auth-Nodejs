const bcrypt=require('bcrypt')

let cryption=async (value)=>{
    let hashKey=await bcrypt.hash(value, 15)
    return hashKey
}

let compare=async (value, value1)=>{
    return await bcrypt.compare(value, value1)
}

module.exports={ cryption, compare }