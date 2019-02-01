import React, { Component } from 'react'
import '../App.css'
import AppLogo from '../components/logo'
import ConfirmActionPopup from '../components/confirmPopup'
import {ReactComponent as InfoLogo} from '../res/images/round-info.svg'
class Login extends Component {
    constructor(props){
        super(props)
        this.state = {
            popup: {show: false}
        }
    }
    handleClick = () => {
        const popup = {show: true,  
            title: 'Whats TrnTable?', 
            accept: 'Cool!',
            onAccept: this.handleClose,
            message: <div>A web app that lets spotify users create a party playlist and host sessions where other users can upvote, downvote and request songs to be added. Made by <a href='https://github.com/startsUp'>Shardool Patel</a></div>, 
            close: this.handleClose,
          }
        
        this.setState({popup: popup})
    }
    handleClose = () => {
        this.setState({popup: {show: false}})
    }
    render() {
        const {popup} = this.state
    return (
		<div className='login-page-container'>
            {popup.show && <ConfirmActionPopup popupInfo={popup}/>}
            <InfoLogo className='dash-logo' id='info-icon' onClick={this.handleClick}/>
			<div className='login-page-logo'>
				<AppLogo styleName='app-logo' animate={true}/>
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