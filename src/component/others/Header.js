import React from 'react'
import images from '../../weather.jpeg'
import './Header.css'
function Header() {
  return (
    <div className='header'>
      <li><img className='imgWeather' src={images} alt='images'/></li>
      <li>Weather</li>
    </div>
  )
}

export default Header
