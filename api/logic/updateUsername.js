import models from '../data/models.js'
import { Validator, Errors } from 'common'

const { User } = models

export default (userId, newUsername) => {

    Validator.id(userId)
    Validator.username(newUsername)

    return User.findByIdAndUpdate(userId, { username: newUsername })
        .catch((error) => { 
            throw new Errors.SystemError('Unexpected error while updating username:', error)
        })
        .then((user) => {
            if (!user) throw new Errors.AuthError('User id does not belong to anyone')
        })
}