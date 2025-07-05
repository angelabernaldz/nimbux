import models from '../data/models.js'
import { Validator, Errors } from 'common'

const { User, Location } = models

export default (userId, locationData) => {
    
    Validator.id(userId)
    Validator.locationData(locationData)

    const { name, latitude, longitude } = locationData

    return User.findById(userId)
        .catch((error) => {
            throw new Errors.SystemError('Unexpected error while searching for user:', error)
        })
        .then((user) => {
            if (!user) throw new Errors.AuthError('User id does not belong to anyone')
            return Location.findOne({name: name, latitude: latitude, longitude: longitude})
                .catch((error) => {
                    throw new Errors.SystemError('Unexpected error while searching for location:', error)
                })
                .then((location) => {
                    if (!location) throw new Errors.ExistenceError('Location attemped to be deleted does not exist in the database')
                    
                    user.favLocations = user.favLocations.filter(favLoc => favLoc._id.toString() !== location._id.toString())

                    return user.save()
                    .catch((error) => {
                        throw new Errors.SystemError('Unexpected error while saving user favorite locations:', error)
                    })
                })
        })
}