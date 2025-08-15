import { Validator, Errors } from 'common'
import bcrypt from 'bcryptjs'
import models from '../data/models.js'

const { User } = models

export default (username, email, password) => {

    Validator.username(username)
    Validator.email(email)
    Validator.password(password)

    return User.findOne({ email: email })
        .catch((error) => { 
            throw new Errors.SystemError('Unexpected error while searching for user:', error)
        })
        .then((user) => {
            if (user) throw new Errors.DuplicityError('Email already in use')
                return bcrypt.hash(password, 15)
                    .catch((error) => { 
                        throw new Errors.SystemError('Unexpected error while hashing password:', error)
                    })
                    .then((cryptPassword) => {
                        const user = {
                            username,
                            email,
                            password: cryptPassword
                        }
                        return User.create(user)
                        .catch((error) => { 
                            throw new Errors.SystemError('Unexpected error while creating user:', error)
                        })
                    })
        })
}

