import React from 'react'
import './Weather.css'
import Header from './Header'
function Weather() {
  return (
    <>
        <Header/>
        <div className='weather'>
            <div className='cards'>
                <h4>mumbai</h4>
                <p>India</p>
                <h4>33</h4>
                <p>text</p>
            </div>
        </div>
    </>
  )
}

export default Weather
