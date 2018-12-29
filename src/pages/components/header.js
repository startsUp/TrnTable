import React, { Component } from 'react'
import '../../App.css'

const Header = props => (
    <div className='header-container'>
        <div className='header-content'>
            {props.content}
        </div>        
    </div>
        
)
export default Header
