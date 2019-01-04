import React, { Component } from 'react'
import '../App.css'
import icon from '../res/images/logo.webp'
class Login extends Component {
    handleLogin = () => {
        window.open('https://jukebox-2952e.firebaseapp.com/login', 'Spotify Login', 'height=600,width=400')
    }
    render() {
    return (
		<div className='login-page-container'>
			<div className='login-page-logo'>
				<img className='logo' src={icon}/>
				<div className='login-page-title'>TrnTable</div>
			</div>
			<div>
				<div id='spotify-login-tip'>Let's Get Started</div>
				<a className='button-container' onClick={this.handleLogin}>
					<span id='spotify-button'>
						Login with spotify
					</span>
				</a>
			</div>
		</div> 
    )
	}
}	
export default Login