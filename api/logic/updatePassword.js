import bcrypt from 'bcrypt'
import { Validator, Errors } from 'common'
import models from '../data/models.js'

const { User } = models

export default (userId, oldPassword, newPassword) => {

    Validator.id(userId)
    Validator.password(oldPassword)
    Validator.password(newPassword)

    return User.findById(userId)
        .catch((error) => { 
            throw new Errors.SystemError('Unexpected error while searching for user:', error)
        })
        .then((user) => {
            if (!user) throw new Errors.AuthError('User id does not belong to anyone')
            return bcrypt.compare(oldPassword, user.password)
                .catch((error) => { 
                    throw new Errors.SystemError('Unexpected error while comparing passwords:', error)
                })
                .then((isPasswordCorrect) => {
                    if (!isPasswordCorrect) throw new Errors.CredentialsError('Wrong Password')

                    return bcrypt.hash(newPassword, 15)
                        .catch((error) => { 
                            throw new Errors.SystemError('Unexpected error while hashing password:', error)
                        })
                        .then((cryptPassword) => {
                            return User.findByIdAndUpdate(userId, { password: cryptPassword })
                        })
                })
        })
}