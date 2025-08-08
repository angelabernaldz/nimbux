import models from '../data/models.js'
import { Validator, Errors } from 'common'
import { rateLimitedFetch } from '../utils'

const { User } = models

export default (userId, locationString) => {
    
    Validator.id(userId)
    Validator.locationString(locationString)
    
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${locationString}&limit=5&format=json`

    return User.findById(userId)
        .catch((error) => { 
            throw new Errors.SystemError('Unexpected error while searching for user:', error)
        })
        .then((user) => {
            if (!user) throw new Errors.AuthError('User id does not belong to anyone')
            return rateLimitedFetch('nominatim', nominatimUrl)
                .catch((error) => { 
                    throw new Errors.SystemError('Unexpected error while fetching Nominatim API:', error)
                })
                .then((response) => {
                    if (!response.ok) throw new Errors.NominatimAPIConnectionError('Unable to stablish connection with Nominatim API')
                    return response.json()
                        .catch((error) => { 
                            throw new Errors.SystemError('Unexpected error while parsing Nominatim API response:', error)
                        })
                        .then((locationsFound) => {
                            if (!locationsFound || locationsFound.length === 0) {
                                throw new Errors.LocationNotFoundError('Unable to find locations with the provided location string')
                            }
                            return locationsFound
                        })
                })
        })
}

