import React, { Component } from 'react'
import '../App.css'
import icon from '../res/images/logo.webp'
import {ReactComponent as AppIcon} from '../res/images/logo-svg.svg'
class Login extends Component {
    render() {
    return (
		<div className='login-page-container'>
			<div className='login-page-logo'>
				<AppIcon className='app-logo'/>
				<div className='login-page-title'>TrnTable</div>
			</div>
			<div>
				<div id='spotify-login-tip'>Let's Get Started</div>
				<a className='button-container' href='https://jukebox-2952e.firebaseapp.com/login'>
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