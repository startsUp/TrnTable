import React, { Component } from 'react'
import '../../App.css'
import './components.css'

export const DefaultHostSettings = {
    maxRequestPerUsers: {id: 's1',desc: 'Maximum number of tracks a Guest can request.', 
                        type: 'dropdown', 
                        options: [5, 10, 20, 30], 
                        default: 10},
    guests: {id: 's2',desc: 'Maximum Users that can join your session.', 
                type: 'input',
                inputType: 'number', 
                min: 5,
                max: 300,  
                default: 50},
    keepSpotifyPlaylist: {id: 's3', desc: 'Delete the Session\'s Playlist from my spotify \
                                 account when I end the session.',
                          type: 'boolean',
                          default: false}
}

const InputSetting = props => (
    <div>
        {props.setting.inputType === 'number' && 
        <input type="number" 
            min={props.setting.min} placeholder={props.setting.default} 
            max={props.setting.max} step="5"/>
        }
    </div>
)
const BoolSetting = props => (
    <label class="switch">
        <input type="checkbox"/>
        <span class="slider round"></span>
    </label>
)
class DropdownSetting extends Component{
    constructor(props){
        super(props)
        this.state = {
            value: this.props.value
        }
    }
    handleChange = (event) =>{
        this.setState({value: event.target.value})
    }
    render(){
        const {setting} = this.props
        return(
            <div>
                <select value={this.state.value} onChange={this.handleChange}>
                    {setting.options.map((val,index)=>{
                        return(<option key={index}>{val}</option>)})
                    }
                </select>
            </div>  
        )
    }
}

const settingComponent = (setting) => {
    console.log(setting)
    if(setting.type === 'dropdown')
        return(<DropdownSetting key={setting.id} value={setting.default} setting={setting}/>)
    else if(setting.type === 'boolean')
        return(<BoolSetting key={setting.id} setting={setting}/>)
    else
        return(<InputSetting key={setting.id} setting={setting}/>)
}

const Settings = props => (
    <div className='settings-container'>
        <div className='settings-window'>
            <div className='settings'>
                <div className='settings-list'>
                        {   
                            Object.values(props.settings).map((setting)=>{
                                return(settingComponent(setting))
                            })
                        }
                </div>
                <div className='list-showmore' style={{width: '20%'}} onClick={props.endSession}>
                    End Session
                </div>
            </div>
        </div>
    </div>
)
export default Settings


