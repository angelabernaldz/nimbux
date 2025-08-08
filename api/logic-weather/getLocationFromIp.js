import models from '../data/models.js'
import { Validator, Errors } from 'common'
import { rateLimitedFetch } from '../utils'

const { User } = models

export default (userId) => {

    Validator.id(userId)

    const ipApiUrl = 'http://ip-api.com/json'

    return User.findById(userId)
        .catch((error) => { 
            throw new Errors.SystemError('Unexpected error while searching for user:', error)
        })
        .then((user) => {
            if (!user) throw new Errors.AuthError('User id does not belong to anyone')
            return rateLimitedFetch('ip-api', ipApiUrl)
                .catch((error) => { 
                    throw new Errors.SystemError('Unexpected error while fetching IP API:', error)
                })
                .then((response) => {
                    if (!response.ok) throw new Errors.GeoLocationAPIError('Unable to stablish connection with IP API to obtain current location')
                    return response.json()
                        .catch((error) => { 
                            throw new Errors.SystemError('Unexpected error while parsing IP API response:', error)
                        })
                        .then((data) => {
                            if (data.status === 'success') {
                                const currentLocation = {
                                    name: data.city, 
                                    latitude: data.lat,
                                    longitude: data.lon
                                }
                                return currentLocation
                            }
                        })
                })
        })
}