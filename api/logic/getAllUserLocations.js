import models from '../data/models.js'
import { Validator, Errors } from 'common'

const { User, Location } = models

export default (userId) => {

    Validator.id(userId)

    return User.findById(userId)
        .catch((error) => {
            throw new Errors.SystemError('Unexpected error while searching for user:', error)
        })
        .then((user) => {
            if (!user) throw new Errors.AuthError('User id does not belong to anyone')
            if (user.favLocations.length === 0) return []

            return Location.find({ '_id': {$in: user.favLocations }})
                .catch((error) => {
                    throw new Errors.SystemError('Unexpected error while searching for user locations:', error)
                })
                .then((locationsFound) => {
                    const orderedLocations = user.favLocations.map(id => {
                        const loc = locationsFound.find(location => location._id.toString() === id.toString())
                        if (!loc) return null
                      
                        const { _id, __v, ...rest } = loc.toObject()
                        return { ...rest, id: _id }
                      }).filter(Boolean)
                      
                    return orderedLocations
                })
        })
}