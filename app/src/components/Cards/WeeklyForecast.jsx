import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import getWeatherIcon from '../../helpers/getWeatherIcon'

function WeeklyForecast({ dailyForecast }) {
    if (!dailyForecast || !dailyForecast.time) return null

    const forecastData = dailyForecast.time.map((date, index) => ({
        day: new Date(date).toLocaleDateString('en-US', { weekday: 'long' }),
        tmin: dailyForecast.temperature_2m_min[index],
        tmax: dailyForecast.temperature_2m_max[index],
        weather_code: dailyForecast.weather_code[index],
        precipitation: dailyForecast.precipitation_probability_max[index],
    }))

    const CustomTooltip = ({ payload, label }) => {
        if (!payload || !payload.length) return null

        const data = payload[0].payload

        return (
            <div className="bg-white p-2 rounded-lg shadow-md">
                <div className="text-center text-sm font-medium text-gray-700">
                    <p>{label}</p>
                    <p className="text-sm">{getWeatherIcon(data.weather_code, 1)}</p>
                    <p>Max: {Math.round(data.tmax)}°C</p>
                    <p>Min: {Math.round(data.tmin)}°C</p>
                    <p>Precipitation: {data.precipitation}%</p>
                </div>
            </div>
        )
    }
    
    const rawMin = Math.min(...forecastData.map(item => item.tmin))
    const rawMax = Math.max(...forecastData.map(item => item.tmax))

    const range = rawMax - rawMin || 1  
    const maxTicks = 5

    function niceStep(range, maxTicks) {
        const roughStep = range / (maxTicks - 1)
        const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)))
        const residual = roughStep / magnitude

        if (residual <= 1) return magnitude
        if (residual <= 2) return 2 * magnitude
        if (residual <= 5) return 5 * magnitude
        return 10 * magnitude
    }

    let ticks = []
    let minTemp, maxTemp

    if (range < 5) {
        minTemp = Math.floor(rawMin)
        maxTemp = Math.ceil(rawMax)
        for (let i = minTemp; i <= maxTemp; i++) {
            ticks.push(i)
        }
    } else {
        const step = niceStep(range, maxTicks)
        minTemp = Math.floor(rawMin / step) * step
        maxTemp = Math.ceil(rawMax / step) * step

        for (let tick = minTemp; tick <= maxTemp; tick += step) {
            ticks.push(+tick.toFixed(2))
        }
    }
    
    return (
        <div className="w-auto h-[300px] bg-white shadow-md rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-2 text-center">Weekly Forecast</h2>

            <ResponsiveContainer width="100%" height="80%">
                <LineChart data={forecastData} margin={{ left: 10, right: 10 }}>
                    <XAxis 
                        dataKey="day" 
                        tick={{ fill: '#555', fontSize: 12 }} 
                        axisLine={false} 
                        dy={5} 
                        interval="preserveStart" 
                        padding={{ left: 30, right: 30 }}
                    />
                    <YAxis 
                        domain={[minTemp, maxTemp]} 
                        ticks={ticks}
                        tick={{ fill: '#555' }} 
                        axisLine={false} 
                        tickFormatter={(value) => `${Math.round(value)}°`} 
                        margin={{ top: 20 }} 
                        padding={{ top: 10 }}
                    />
                    <Tooltip content={<CustomTooltip />} />

                    <Line 
                        type="monotone" 
                        dataKey="tmin" 
                        stroke="#1E90FF" 
                        strokeWidth={2} 
                        dot={{ r: 2, fill: '#1E90FF' }} 
                    />

                    <Line 
                        type="monotone" 
                        dataKey="tmax" 
                        stroke="#FF4500" 
                        strokeWidth={2} 
                        dot={{ r: 2, fill: '#FF4500' }} 
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}

export default WeeklyForecast

