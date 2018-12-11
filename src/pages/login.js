import React, { Component } from 'react'
import '../App.css'
import icon from '../res/images/logo.webp'

class Login extends Component {
    render() {
    return (
		<div className='login-page-container'>
			<div className='login-page-logo'>
				<img className='logo' src={icon}/>
				<div className='login-page-title'>TrnTable</div>
			</div>
			<div>
				<div id='spotify-login-tip'>Let's Get Started</div>
				<a id='spotify-login-button-container' href='https://jukebox-2952e.firebaseapp.com/login'>
					<span id='spotify-login-button'>
						Login with spotify
					</span>
				</a>
			</div>
		</div> 
    )
	}
}	
export default Login