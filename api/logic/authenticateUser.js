import { Validator, Errors } from 'common'
import bcrypt from 'bcryptjs'
import models from '../data/models.js'

const { User } = models

export default (email, password) => {

    Validator.email(email)
    Validator.password(password)

    return User.findOne({ email: email })
        .catch((error) => { 
            throw new Errors.SystemError('Unexpected error while searching for user:', error)
        })
        .then((user) => {
            if (!user) throw new Errors.ExistenceError('No user with this email')
            return bcrypt.compare(password, user.password)
                .catch((error) => { 
                    throw new Errors.SystemError('Unexpected error while comparing passwords:', error)
                })
                .then((isPasswordValid) => {

                    if (!isPasswordValid) throw new Errors.CredentialsError('Wrong Password')

                    return user._id.toString()
                })
        })
}