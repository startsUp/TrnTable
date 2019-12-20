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

    componentDidMount(){
        this.token = window.location.hash.substr(1).split('&')[0].split("=")[1]
        console.log(this.token)
        if (this.token) {
          // alert(this.token)
          
          window.opener.spotifyCallback(this.token)
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
    handleLogin = () => {
        this.popupCenter('https://jukebox-2952e.firebaseapp.com/login', 'Spotify Auth', 350, 550);
    }

    popupCenter = (url, title, w, h) => {
        // Fixes dual-screen position                         Most browsers      Firefox
        var dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : window.screenX;
        var dualScreenTop = window.screenTop != undefined ? window.screenTop : window.screenY;
    
        var width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : window.screen.width;
        var height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : window.screen.height;
    
        var systemZoom = width / window.screen.availWidth;
        var left = (width - w) / 2 / systemZoom + dualScreenLeft
        var top = (height - h) / 2 / systemZoom + dualScreenTop
        var newWindow = window.open(url, title, 'scrollbars=yes, width=' + w / systemZoom + ', height=' + h / systemZoom + ', top=' + top + ', left=' + left);
        console.log(newWindow)
        // Puts focus on the newWindow
      //  if (window.focus) newWindow.focus();
      window.addEventListener('message', event => {
        // IMPORTANT: check the origin of the data! 
        if (event.origin.startsWith('https://trntable.live')) { 
            // The data was sent from your site.
            // Data sent with postMessage is stored in event.data:
            newWindow.close()
            this.props.callback(event.data)
        } else {
            // The data was NOT sent from your site! 
            // Be careful! Do not use it. This else branch is
            // here just for clarity, you usually shouldn't need it.
            return; 
        } 
    }); 
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